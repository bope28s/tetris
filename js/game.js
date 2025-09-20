// 게임 상태 관리
class TetrisGame {
    constructor(canvas, nextCanvas, isMultiplayer = false, playerId = 1) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas ? nextCanvas.getContext('2d') : null;
        
        this.isMultiplayer = isMultiplayer;
        this.playerId = playerId;
        
        // 게임 보드 설정
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        
        // 고유 인스턴스 ID 생성 (간섭 방지)
        this.instanceId = `tetris_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        console.log(`🆔 TetrisGame 인스턴스 생성: ${this.instanceId}, 플레이어: ${this.playerId}`);
        
        // 캔버스 크기 정규화 및 CELL_SIZE 계산
        this.normalizeCanvasSize();
        this.CELL_SIZE = this.canvas.width / this.BOARD_WIDTH;
        
        console.log(`캔버스 크기: ${this.canvas.width}x${this.canvas.height}, CELL_SIZE: ${this.CELL_SIZE}`);
        
        // 게임 상태
        this.board = [];
        this.currentBlock = null;
        this.nextBlock = null;
        this.ghostBlock = null;
        
        // 게임 스코어
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        
        // 게임 타이밍
        this.dropTime = 0;
        this.dropInterval = 1000; // 1초
        
        // 게임 상태
        this.isGameOver = false;
        this.isPaused = false;
        this.isPlaying = false;
        
        // 키 입력 상태
        this.keys = {};
        this.keyRepeat = {};
        
        this.initBoard();
        this.setupEventListeners();
        
        // 플레이어 2인 경우 AI 로직 초기화
        if (this.isMultiplayer && this.playerId === 2) {
            this.initAI();
        }
    }
    
    // AI 로직 초기화 (플레이어 2용)
    initAI() {
        console.log('AI 플레이어 초기화');
        this.aiMoveTimer = 0;
        this.aiMoveInterval = 500; // 0.5초마다 AI 행동
    }
    
    // AI 업데이트 (플레이어 2용)
    updateAI() {
        if (!this.isPlaying || this.isPaused || !this.currentBlock) return;
        
        this.aiMoveTimer += 16;
        
        if (this.aiMoveTimer >= this.aiMoveInterval) {
            // 간단한 AI: 랜덤하게 이동하거나 회전
            const actions = ['left', 'right', 'rotate', 'drop'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            
            switch (action) {
                case 'left':
                    this.moveBlock(-1);
                    break;
                case 'right':
                    this.moveBlock(1);
                    break;
                case 'rotate':
                    this.rotateBlock();
                    break;
                case 'drop':
                    this.dropBlock();
                    break;
            }
            
            this.aiMoveTimer = 0;
        }
    }
    
    // 캔버스 크기 정규화
    normalizeCanvasSize() {
        // 멀티플레이어와 싱글플레이어에 따른 적절한 크기 설정
        if (this.isMultiplayer) {
            // 멀티플레이어: 작은 캔버스
            this.canvas.width = 250;
            this.canvas.height = 500;
            if (this.nextCanvas) {
                this.nextCanvas.width = 80;
                this.nextCanvas.height = 80;
            }
        } else {
            // 싱글플레이어: 큰 캔버스
            this.canvas.width = 300;
            this.canvas.height = 600;
            if (this.nextCanvas) {
                this.nextCanvas.width = 120;
                this.nextCanvas.height = 120;
            }
        }
        
        // 캔버스 스타일도 동기화
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
        
        if (this.nextCanvas) {
            this.nextCanvas.style.width = this.nextCanvas.width + 'px';
            this.nextCanvas.style.height = this.nextCanvas.height + 'px';
        }
        
        console.log(`캔버스 정규화 완료 - 멀티플레이어: ${this.isMultiplayer}, 크기: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    // 게임 보드 초기화
    initBoard() {
        this.board = [];
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                this.board[row][col] = null;
            }
        }
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 멀티플레이어에서는 플레이어 1만 키보드 제어
        // 플레이어 2는 AI 또는 네트워크 제어
        if (!this.isMultiplayer || this.playerId === 1) {
            // 고유한 이벤트 핸들러 생성 (다른 인스턴스와 분리)
            this.keyDownHandler = (e) => this.handleKeyDown(e);
            this.keyUpHandler = (e) => this.handleKeyUp(e);
            
            document.addEventListener('keydown', this.keyDownHandler);
            document.addEventListener('keyup', this.keyUpHandler);
            
            console.log(`키보드 이벤트 리스너 설정 완료 - 플레이어 ${this.playerId}`);
        } else {
            console.log(`플레이어 ${this.playerId}는 AI 제어 - 키보드 이벤트 없음`);
        }
    }
    
    // 키 입력 처리
    handleKeyDown(e) {
        if (!this.isPlaying || this.isPaused) return;
        
        const key = e.code;
        this.keys[key] = true;
        
        // 즉시 실행되는 키들
        switch (key) {
            case 'ArrowUp':
            case 'KeyW':
                e.preventDefault();
                this.rotateBlock();
                break;
            case 'ArrowDown':
            case 'KeyS':
                e.preventDefault();
                this.dropBlock();
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                break;
        }
        
        // 반복 가능한 키들
        if (!this.keyRepeat[key]) {
            switch (key) {
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    this.moveBlock(-1);
                    this.keyRepeat[key] = setTimeout(() => {
                        this.startKeyRepeat(key, () => this.moveBlock(-1));
                    }, 200);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    this.moveBlock(1);
                    this.keyRepeat[key] = setTimeout(() => {
                        this.startKeyRepeat(key, () => this.moveBlock(1));
                    }, 200);
                    break;
            }
        }
    }
    
    handleKeyUp(e) {
        const key = e.code;
        this.keys[key] = false;
        
        if (this.keyRepeat[key]) {
            clearTimeout(this.keyRepeat[key]);
            delete this.keyRepeat[key];
        }
    }
    
    startKeyRepeat(key, action) {
        const repeatAction = () => {
            if (this.keys[key] && this.isPlaying && !this.isPaused) {
                action();
                this.keyRepeat[key] = setTimeout(repeatAction, 50);
            } else {
                delete this.keyRepeat[key];
            }
        };
        this.keyRepeat[key] = setTimeout(repeatAction, 50);
    }
    
    // 게임 시작
    start() {
        try {
            console.log('게임 시작 중...');
            
            // 캔버스 크기 재정규화 (다른 탭의 영향 방지)
            this.normalizeCanvasSize();
            this.CELL_SIZE = this.canvas.width / this.BOARD_WIDTH;
            console.log(`게임 시작 시 CELL_SIZE 재계산: ${this.CELL_SIZE}`);
            
            this.initBoard();
            this.score = 0;
            this.level = 1;
            this.lines = 0;
            this.isGameOver = false;
            this.isPaused = false;
            this.isPlaying = true;
            
            console.log('게임 상태 초기화 완료');
            
            this.spawnNewBlock();
            console.log('첫 블록 생성 완료');
            
            this.updateScore();
            console.log('점수 업데이트 완료');
            
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
            }
            
            // 각 플레이어별로 독립적인 게임 루프 생성
            const loopId = `gameLoop_${this.playerId}_${Date.now()}`;
            this.gameLoopId = loopId;
            
            this.gameLoop = setInterval(() => {
                // 다른 인스턴스의 루프와 구분하기 위한 ID 체크
                if (this.gameLoopId === loopId && !this.isPaused && this.isPlaying) {
                    this.update();
                }
            }, 16); // 60 FPS
            
            console.log(`독립적인 게임 루프 시작 - 플레이어 ${this.playerId}, ID: ${loopId}`);
            
            console.log('게임 루프 시작 완료');
            
            // 첫 번째 그리기
            this.draw();
            console.log('첫 화면 그리기 완료');
            
        } catch (error) {
            console.error('게임 시작 중 오류 발생:', error);
            this.isPlaying = false;
        }
    }
    
    // 게임 일시정지
    pause() {
        this.isPaused = !this.isPaused;
    }
    
    // 게임 정지
    stop() {
        this.isPlaying = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // 이벤트 리스너 제거 (메모리 누수 방지)
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
        
        console.log(`게임 정지 및 이벤트 리스너 제거 완료 - 플레이어 ${this.playerId}`);
    }
    
    // 새 블록 생성
    spawnNewBlock() {
        // 이미 현재 블록이 있다면 생성하지 않음 (중복 방지)
        if (this.currentBlock && this.isPlaying) {
            console.warn('이미 현재 블록이 존재함 - 중복 생성 방지');
            return;
        }
        
        if (!this.nextBlock) {
            this.nextBlock = this.getRandomBlockSafe();
        }
        
        this.currentBlock = this.nextBlock;
        this.currentBlock.x = Math.floor(this.BOARD_WIDTH / 2) - 2;
        this.currentBlock.y = 0;
        
        // 새로운 다음 블록 생성
        this.nextBlock = this.getRandomBlockSafe();
        
        console.log(`새 블록 스폰: ${this.currentBlock.type} at (${this.currentBlock.x}, ${this.currentBlock.y})`);
        console.log(`다음 블록: ${this.nextBlock.type}`);
        
        // 게임 오버 체크
        if (this.isCollision(this.currentBlock)) {
            this.gameOver();
            return;
        }
        
        this.drawNextBlock();
    }
    
    // 안전한 랜덤 블록 생성 (인스턴스별 독립)
    getRandomBlockSafe() {
        const BLOCK_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const type = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
        const block = new TetrisBlock(type);
        
        // 블록 유효성 검사
        if (!block.shape || !block.color) {
            console.error(`${this.instanceId}: 잘못된 블록 생성:`, type);
            return new TetrisBlock('I'); // 기본 블록 반환
        }
        
        console.log(`${this.instanceId}: 새 블록 생성: ${type}, 회전 상태: ${block.rotation}`);
        return block;
    }
    
    // 고스트 블록 업데이트
    updateGhostBlock() {
        if (!this.currentBlock) return;
        
        this.ghostBlock = this.currentBlock.clone();
        while (!this.isCollision(this.ghostBlock, 0, 1)) {
            this.ghostBlock.y++;
        }
    }
    
    // 블록 이동
    moveBlock(dx) {
        if (!this.currentBlock) return;
        
        if (!this.isCollision(this.currentBlock, dx, 0)) {
            this.currentBlock.x += dx;
            // 고스트 블록 제거됨
            
            // 이동 효과음 재생
            if (window.audioManager) {
                window.audioManager.playMoveSound();
            }
        }
    }
    
    // 블록 회전
    rotateBlock() {
        if (!this.currentBlock) return;
        
        this.currentBlock.rotate();
        
        // 벽 킥 (Wall Kick) 시도
        const kicks = [
            [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]
        ];
        
        let rotated = false;
        for (const [dx, dy] of kicks) {
            if (!this.isCollision(this.currentBlock, dx, dy)) {
                this.currentBlock.x += dx;
                this.currentBlock.y += dy;
                rotated = true;
                break;
            }
        }
        
        if (!rotated) {
            this.currentBlock.unrotate();
        } else {
            // 고스트 블록 제거됨
            
            // 회전 효과음 재생
            if (window.audioManager) {
                window.audioManager.playRotateSound();
            }
        }
    }
    
    // 블록 드롭
    dropBlock() {
        if (!this.currentBlock) return;
        
        if (!this.isCollision(this.currentBlock, 0, 1)) {
            this.currentBlock.y++;
            // 고스트 블록 제거됨
        } else {
            this.lockBlock();
        }
    }
    
    // 하드 드롭
    hardDrop() {
        if (!this.currentBlock) return;
        
        while (!this.isCollision(this.currentBlock, 0, 1)) {
            this.currentBlock.y++;
        }
        this.lockBlock();
    }
    
    // 블록 고정
    lockBlock() {
        if (!this.currentBlock) {
            console.warn('고정할 현재 블록이 없음');
            return;
        }
        
        console.log(`블록 고정: ${this.currentBlock.type} at (${this.currentBlock.x}, ${this.currentBlock.y})`);
        
        const shape = this.currentBlock.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = this.currentBlock.x + col;
                    const boardY = this.currentBlock.y + row;
                    
                    if (boardY >= 0 && boardY < this.BOARD_HEIGHT && 
                        boardX >= 0 && boardX < this.BOARD_WIDTH) {
                        this.board[boardY][boardX] = this.currentBlock.color;
                    }
                }
            }
        }
        
        // 현재 블록을 null로 설정 (중복 생성 방지)
        this.currentBlock = null;
        
        this.clearLines();
        this.spawnNewBlock();
        
        // 블록 착지 효과음 재생
        if (window.audioManager) {
            window.audioManager.playBlockLandSound();
        }
    }
    
    // 라인 클리어
    clearLines() {
        let linesCleared = 0;
        const fullRows = [];
        
        // 완성된 라인 찾기
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            let isFull = true;
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (!this.board[row][col]) {
                    isFull = false;
                    break;
                }
            }
            
            if (isFull) {
                fullRows.push(row);
                linesCleared++;
            }
        }
        
        if (linesCleared > 0) {
            // 깨지는 효과 애니메이션 실행
            this.playLineClearAnimation(fullRows, () => {
                // 애니메이션 완료 후 실제 라인 제거
                fullRows.sort((a, b) => b - a); // 내림차순 정렬
                fullRows.forEach(row => {
                    this.board.splice(row, 1);
                    this.board.unshift(new Array(this.BOARD_WIDTH).fill(null));
                });
                
                this.lines += linesCleared;
                
                // 점수 계산
                const lineScores = [0, 100, 300, 500, 800];
                this.score += lineScores[linesCleared] * this.level;
                
                // 레벨 업
                this.level = Math.floor(this.lines / 10) + 1;
                this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
                
                this.updateScore();
                
                // 멀티플레이어에서 상대방에게 공격 라인 전송
                if (this.isMultiplayer && linesCleared > 1) {
                    this.sendAttackLines(linesCleared - 1);
                }
                
                // 효과음 재생
                this.playLineClearSound();
            });
        }
    }
    
    // 라인 클리어 애니메이션
    playLineClearAnimation(rows, callback) {
        const animationDuration = 300; // 300ms
        const animationFrames = 15;
        const frameInterval = animationDuration / animationFrames;
        let currentFrame = 0;
        
        const animate = () => {
            // 애니메이션 진행률 (0 ~ 1)
            const progress = currentFrame / animationFrames;
            
            // 일반 보드 그리기
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawGrid();
            
            // 일반 블록들 그리기
            for (let row = 0; row < this.BOARD_HEIGHT; row++) {
                for (let col = 0; col < this.BOARD_WIDTH; col++) {
                    if (this.board[row][col] && !rows.includes(row)) {
                        const x = col * this.CELL_SIZE;
                        const y = row * this.CELL_SIZE;
                        draw3DBlock(this.ctx, x, y, this.CELL_SIZE, this.board[row][col]);
                    }
                }
            }
            
            // 깨지는 효과가 있는 라인들 그리기
            rows.forEach(row => {
                for (let col = 0; col < this.BOARD_WIDTH; col++) {
                    if (this.board[row][col]) {
                        const x = col * this.CELL_SIZE;
                        const y = row * this.CELL_SIZE;
                        
                        // 깨지는 효과
                        this.drawBreakingBlock(x, y, this.CELL_SIZE, this.board[row][col], progress);
                    }
                }
            });
            
            // 현재 블록 그리기
            if (this.currentBlock) {
                drawBlock(this.ctx, this.currentBlock, this.CELL_SIZE);
            }
            
            currentFrame++;
            
            if (currentFrame <= animationFrames) {
                setTimeout(animate, frameInterval);
            } else {
                callback();
            }
        };
        
        animate();
    }
    
    // 깨지는 블록 그리기 (더 실감나는 파괴 효과)
    drawBreakingBlock(x, y, size, color, progress) {
        const ctx = this.ctx;
        
        // 각 조각의 고유한 움직임을 위한 시드
        const pieces = [
            { dx: -1, dy: -0.5, rotation: 0.5, size: 0.4 },
            { dx: 1, dy: -0.3, rotation: -0.3, size: 0.3 },
            { dx: -0.5, dy: 0.8, rotation: 0.8, size: 0.35 },
            { dx: 0.8, dy: 0.6, rotation: -0.6, size: 0.25 },
            { dx: 0, dy: -1, rotation: 0.2, size: 0.2 },
            { dx: -0.3, dy: 0.4, rotation: -0.4, size: 0.15 }
        ];
        
        pieces.forEach((piece, index) => {
            // 물리 시뮬레이션
            const gravity = 0.5;
            const velocity = 100; // 초기 속도
            
            // 시간에 따른 위치 계산
            const time = progress;
            const pieceX = x + size/2 + piece.dx * velocity * time;
            const pieceY = y + size/2 + piece.dy * velocity * time + gravity * time * time * 50;
            
            // 회전 효과
            const rotation = piece.rotation * progress * Math.PI;
            
            // 크기 변화 (약간 줄어듦)
            const currentSize = size * piece.size * (1 - progress * 0.3);
            
            // 투명도 (점진적 사라짐)
            const alpha = Math.max(0, 1 - progress * progress); // 제곱으로 빠르게 사라짐
            
            if (alpha > 0.01 && currentSize > 1) {
                ctx.save();
                ctx.globalAlpha = alpha;
                
                // 중심점으로 이동하여 회전
                ctx.translate(pieceX, pieceY);
                ctx.rotate(rotation);
                
                // 조각 그리기 (불규칙한 모양)
                const halfSize = currentSize / 2;
                
                // 메인 색상
                ctx.fillStyle = color;
                ctx.fillRect(-halfSize, -halfSize, currentSize, currentSize);
                
                // 3D 효과 (하이라이트)
                ctx.fillStyle = this.lightenColor(color, 0.4);
                ctx.fillRect(-halfSize, -halfSize, currentSize, Math.max(1, currentSize * 0.2));
                ctx.fillRect(-halfSize, -halfSize, Math.max(1, currentSize * 0.2), currentSize);
                
                // 그림자
                ctx.fillStyle = this.darkenColor(color, 0.4);
                ctx.fillRect(-halfSize, halfSize - Math.max(1, currentSize * 0.2), currentSize, Math.max(1, currentSize * 0.2));
                ctx.fillRect(halfSize - Math.max(1, currentSize * 0.2), -halfSize, Math.max(1, currentSize * 0.2), currentSize);
                
                // 균열 효과 (선택적으로)
                if (progress > 0.3) {
                    ctx.strokeStyle = this.darkenColor(color, 0.6);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-halfSize, 0);
                    ctx.lineTo(halfSize, 0);
                    ctx.moveTo(0, -halfSize);
                    ctx.lineTo(0, halfSize);
                    ctx.stroke();
                }
                
                ctx.restore();
            }
        });
        
        // 먼지/파티클 효과
        if (progress > 0.5) {
            this.drawDustParticles(x + size/2, y + size/2, progress, color);
        }
    }
    
    // 먼지 파티클 효과
    drawDustParticles(centerX, centerY, progress, color) {
        const ctx = this.ctx;
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = progress * 30;
            const particleX = centerX + Math.cos(angle) * distance;
            const particleY = centerY + Math.sin(angle) * distance;
            
            const particleAlpha = Math.max(0, 0.8 - progress * 2);
            
            if (particleAlpha > 0.01) {
                ctx.save();
                ctx.globalAlpha = particleAlpha;
                ctx.fillStyle = this.lightenColor(color, 0.5);
                ctx.fillRect(particleX - 1, particleY - 1, 2, 2);
                ctx.restore();
            }
        }
    }
    
    // 라인 클리어 효과음 재생
    playLineClearSound() {
        if (window.audioManager) {
            window.audioManager.playLineClear();
        }
    }
    
    // 충돌 검사
    isCollision(block, dx = 0, dy = 0) {
        const shape = block.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = block.x + col + dx;
                    const newY = block.y + row + dy;
                    
                    // 경계 검사
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT) {
                        return true;
                    }
                    
                    // 다른 블록과 충돌 검사
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 게임 업데이트
    update() {
        if (this.isGameOver || !this.isPlaying) return;
        
        // 현재 블록이 없으면 업데이트하지 않음
        if (!this.currentBlock) {
            console.warn(`플레이어 ${this.playerId}: 현재 블록이 없어서 업데이트 건너뜀`);
            return;
        }
        
        // AI 업데이트 (플레이어 2인 경우)
        if (this.isMultiplayer && this.playerId === 2) {
            this.updateAI();
        }
        
        this.dropTime += 16;
        
        if (this.dropTime >= this.dropInterval) {
            this.dropBlock();
            this.dropTime = 0;
        }
        
        this.draw();
    }
    
    // 게임 렌더링
    draw() {
        // 캔버스 클리어
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 보드 그리드 그리기
        this.drawGrid();
        
        // 고정된 블록들 그리기
        this.drawBoard();
        
        // 고스트 블록 제거됨
        
        // 현재 블록 그리기 (인스턴스별 독립 렌더링)
        if (this.currentBlock) {
            this.drawBlockSafe(this.currentBlock);
        }
    }
    
    // 그리드 그리기
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // 세로선
        for (let col = 0; col <= this.BOARD_WIDTH; col++) {
            const x = col * this.CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 가로선
        for (let row = 0; row <= this.BOARD_HEIGHT; row++) {
            const y = row * this.CELL_SIZE;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    // 보드 그리기
    drawBoard() {
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (this.board[row][col]) {
                    const x = col * this.CELL_SIZE;
                    const y = row * this.CELL_SIZE;
                    
                    this.draw3DBlockSafe(x, y, this.CELL_SIZE, this.board[row][col]);
                }
            }
        }
    }
    
    // 안전한 블록 그리기 (인스턴스별 독립)
    drawBlockSafe(block) {
        const shape = block.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = (block.x + col) * this.CELL_SIZE;
                    const y = (block.y + row) * this.CELL_SIZE;
                    
                    this.draw3DBlockSafe(x, y, this.CELL_SIZE, block.color);
                }
            }
        }
    }
    
    // 안전한 3D 블록 그리기 (인스턴스별 독립)
    draw3DBlockSafe(x, y, size, color) {
        // 크기 유효성 검사
        if (size <= 0 || !isFinite(size)) {
            console.warn(`${this.instanceId}: 잘못된 블록 크기:`, size);
            size = 30; // 기본값
        }
        
        const bevelSize = Math.max(1, Math.min(size * 0.15, 5));
        
        // 캔버스 컨텍스트 상태 저장
        this.ctx.save();
        
        try {
            // 메인 블록 면
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, size, size);
            
            // 상단 하이라이트 (밝은 면)
            const lightColor = this.lightenColor(color, 0.3);
            this.ctx.fillStyle = lightColor;
            this.ctx.fillRect(x, y, size, bevelSize);
            this.ctx.fillRect(x, y, bevelSize, size);
            
            // 하단/우측 그림자 (어두운 면)
            const shadowColor = this.darkenColor(color, 0.3);
            this.ctx.fillStyle = shadowColor;
            this.ctx.fillRect(x, y + size - bevelSize, size, bevelSize);
            this.ctx.fillRect(x + size - bevelSize, y, bevelSize, size);
            
            // 테두리
            this.ctx.strokeStyle = this.darkenColor(color, 0.5);
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, size, size);
            
            // 내부 하이라이트
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(x + bevelSize, y + bevelSize, size - bevelSize * 2, 1);
            this.ctx.fillRect(x + bevelSize, y + bevelSize, 1, size - bevelSize * 2);
            
        } catch (error) {
            console.error(`${this.instanceId}: 블록 렌더링 오류:`, error);
        } finally {
            // 캔버스 컨텍스트 상태 복원
            this.ctx.restore();
        }
    }
    
    // 다음 블록 그리기
    drawNextBlock() {
        if (!this.nextCtx || !this.nextBlock) return;
        
        // 캔버스 클리어
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const centerX = this.nextCanvas.width / 2;
        const centerY = this.nextCanvas.height / 2;
        
        // 멀티플레이어에서 더 큰 셀 크기 사용 (흐림 방지)
        const cellSize = this.isMultiplayer ? 18 : 20;
        
        // 고해상도 렌더링을 위한 설정
        this.nextCtx.imageSmoothingEnabled = false;
        this.nextCtx.webkitImageSmoothingEnabled = false;
        this.nextCtx.mozImageSmoothingEnabled = false;
        this.nextCtx.msImageSmoothingEnabled = false;
        
        console.log(`다음 블록 그리기: ${this.nextBlock.type}, 셀 크기: ${cellSize}`);
        this.drawMiniBlockSafe(this.nextBlock, cellSize, centerX, centerY);
    }
    
    // 안전한 미니 블록 그리기 (인스턴스별 독립)
    drawMiniBlockSafe(block, cellSize, centerX, centerY) {
        if (!this.nextCtx) return;
        
        const shape = block.getCurrentShape();
        
        // 블록의 실제 크기 계산
        let minX = 4, maxX = -1, minY = 4, maxY = -1;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    minX = Math.min(minX, col);
                    maxX = Math.max(maxX, col);
                    minY = Math.min(minY, row);
                    maxY = Math.max(maxY, row);
                }
            }
        }
        
        const blockWidth = (maxX - minX + 1) * cellSize;
        const blockHeight = (maxY - minY + 1) * cellSize;
        const startX = centerX - blockWidth / 2;
        const startY = centerY - blockHeight / 2;
        
        // 캔버스 컨텍스트 상태 저장
        this.nextCtx.save();
        
        try {
            for (let row = minY; row <= maxY; row++) {
                for (let col = minX; col <= maxX; col++) {
                    if (shape[row][col]) {
                        const x = startX + (col - minX) * cellSize;
                        const y = startY + (row - minY) * cellSize;
                        
                        this.draw3DBlockSafe(x, y, cellSize, block.color);
                    }
                }
            }
        } catch (error) {
            console.error(`${this.instanceId}: 미니 블록 렌더링 오류:`, error);
        } finally {
            // 캔버스 컨텍스트 상태 복원
            this.nextCtx.restore();
        }
    }
    
    // 점수 업데이트
    updateScore() {
        try {
            if (this.isMultiplayer) {
                const scoreElement = document.getElementById(`p${this.playerId}-score`);
                if (scoreElement) {
                    scoreElement.textContent = this.score;
                    console.log(`플레이어 ${this.playerId} 점수 업데이트: ${this.score}`);
                } else {
                    console.warn(`플레이어 ${this.playerId} 점수 요소를 찾을 수 없음`);
                }
            } else {
                const scoreElement = document.getElementById('score');
                const levelElement = document.getElementById('level');
                const linesElement = document.getElementById('lines');
                
                console.log('점수 요소 찾기:', {
                    score: !!scoreElement,
                    level: !!levelElement, 
                    lines: !!linesElement
                });
                
                if (scoreElement) {
                    scoreElement.textContent = this.score;
                    console.log('점수 업데이트:', this.score);
                } else {
                    console.warn('점수 요소를 찾을 수 없음');
                }
                
                if (levelElement) {
                    levelElement.textContent = this.level;
                    console.log('레벨 업데이트:', this.level);
                } else {
                    console.warn('레벨 요소를 찾을 수 없음');
                }
                
                if (linesElement) {
                    linesElement.textContent = this.lines;
                    console.log('라인 업데이트:', this.lines);
                } else {
                    console.warn('라인 요소를 찾을 수 없음');
                }
            }
        } catch (error) {
            console.error('점수 업데이트 중 오류:', error);
        }
    }
    
    // 공격 라인 전송 (멀티플레이어용)
    sendAttackLines(count) {
        if (window.networkManager && this.isMultiplayer) {
            window.networkManager.sendAttackLines(count);
        }
    }
    
    // 공격 라인 받기 (멀티플레이어용)
    receiveAttackLines(count) {
        for (let i = 0; i < count; i++) {
            // 맨 위 라인 제거
            this.board.shift();
            
            // 맨 아래에 공격 라인 추가 (랜덤한 위치에 구멍 하나)
            const attackLine = new Array(this.BOARD_WIDTH).fill('#666666');
            const holePosition = Math.floor(Math.random() * this.BOARD_WIDTH);
            attackLine[holePosition] = null;
            
            this.board.push(attackLine);
        }
        
        // 현재 블록이 겹치는지 확인
        if (this.currentBlock && this.isCollision(this.currentBlock)) {
            this.gameOver();
        }
    }
    
    // 색상 유틸리티 함수들 (ColorUtils 사용)
    lightenColor(color, factor) {
        return window.ColorUtils ? window.ColorUtils.lighten(color, factor) : color;
    }
    
    darkenColor(color, factor) {
        return window.ColorUtils ? window.ColorUtils.darken(color, factor) : color;
    }
    
    // 게임 오버
    gameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // 게임 오버 효과음 재생
        if (window.audioManager) {
            window.audioManager.playGameOverSound();
            window.audioManager.stopBackgroundMusic();
        }
        
        if (!this.isMultiplayer) {
            document.getElementById('final-score').textContent = `최종 점수: ${this.score}`;
            showScreen('game-over-screen');
        } else if (window.networkManager) {
            window.networkManager.sendGameOver();
        }
    }
}
