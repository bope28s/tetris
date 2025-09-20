// 메인 애플리케이션 클래스
class TetrisApp {
    constructor() {
        this.currentScreen = 'menu-screen';
        this.gameMode = null; // 'single' 또는 'multiplayer'
        this.singlePlayerGame = null;
        this.multiplayerGames = null;
        
        this.initializeEventListeners();
        this.setupTouchControls();
    }
    
    // 이벤트 리스너 초기화
    initializeEventListeners() {
        console.log('🔗 이벤트 리스너 초기화 시작');
        
        // 메뉴 버튼들
        const singleBtn = document.getElementById('single-player-btn');
        const multiBtn = document.getElementById('multiplayer-btn');
        
        if (singleBtn) {
            console.log('✅ single-player-btn 찾음');
            singleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 1인 플레이 버튼 클릭됨');
                try {
                    this.startSinglePlayer();
                } catch (error) {
                    console.error('1인 플레이 시작 오류:', error);
                }
            });
        } else {
            console.error('❌ single-player-btn을 찾을 수 없음');
        }
        
        if (multiBtn) {
            console.log('✅ multiplayer-btn 찾음');
            multiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 2인 플레이 버튼 클릭됨');
                try {
                    this.showMultiplayerMenu();
                } catch (error) {
                    console.error('2인 플레이 시작 오류:', error);
                }
            });
        } else {
            console.error('❌ multiplayer-btn을 찾을 수 없음');
        }
        
        // 멀티플레이어 버튼들
        document.getElementById('host-game-btn').addEventListener('click', () => {
            this.hostMultiplayerGame();
        });
        
        document.getElementById('join-game-btn').addEventListener('click', () => {
            this.showJoinGameForm();
        });
        
        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.joinMultiplayerGame();
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // 게임 컨트롤 버튼들
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.quitGame();
        });
        
        // 게임 오버 버튼들
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.restartFromGameOver();
        });
        
        document.getElementById('return-menu-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // 전역 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.currentScreen === 'game-screen') {
                    this.pauseGame();
                } else if (this.currentScreen === 'multiplayer-screen') {
                    this.showMainMenu();
                }
            }
        });
    }
    
    // 터치 컨트롤 설정
    setupTouchControls() {
        // 모바일 디바이스에서만 터치 컨트롤 표시
        if ('ontouchstart' in window) {
            this.createTouchControls();
        }
    }
    
    // 터치 컨트롤 생성
    createTouchControls() {
        const gameScreen = document.getElementById('game-screen');
        const touchControls = document.createElement('div');
        touchControls.className = 'touch-controls';
        touchControls.innerHTML = `
            <button class="touch-btn" id="touch-left">←</button>
            <button class="touch-btn" id="touch-rotate">↻</button>
            <button class="touch-btn" id="touch-down">↓</button>
            <button class="touch-btn" id="touch-right">→</button>
            <button class="touch-btn" id="touch-drop">⬇</button>
        `;
        gameScreen.appendChild(touchControls);
        
        // 터치 이벤트 리스너
        document.getElementById('touch-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchInput('left');
        });
        
        document.getElementById('touch-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchInput('right');
        });
        
        document.getElementById('touch-rotate').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchInput('rotate');
        });
        
        document.getElementById('touch-down').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchInput('down');
        });
        
        document.getElementById('touch-drop').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchInput('drop');
        });
    }
    
    // 터치 입력 처리
    handleTouchInput(action) {
        const activeGame = this.gameMode === 'single' ? this.singlePlayerGame : 
                          (this.multiplayerGames ? this.multiplayerGames.player1 : null);
        
        if (!activeGame || !activeGame.isPlaying || activeGame.isPaused) return;
        
        switch (action) {
            case 'left':
                activeGame.moveBlock(-1);
                break;
            case 'right':
                activeGame.moveBlock(1);
                break;
            case 'rotate':
                activeGame.rotateBlock();
                break;
            case 'down':
                activeGame.dropBlock();
                break;
            case 'drop':
                activeGame.hardDrop();
                break;
        }
    }
    
    // 단일 플레이어 게임 시작
    startSinglePlayer() {
        try {
            console.log('단일 플레이어 게임 시작');
            this.gameMode = 'single';
            
            const canvas = document.getElementById('game-board');
            const nextCanvas = document.getElementById('next-block');
            
            if (!canvas || !nextCanvas) {
                console.error('캔버스 요소를 찾을 수 없습니다');
                return;
            }
            
            console.log('캔버스 요소 찾음:', canvas, nextCanvas);
            
            this.singlePlayerGame = new TetrisGame(canvas, nextCanvas, false);
            console.log('TetrisGame 인스턴스 생성 완료');
            
            document.getElementById('single-player-layout').classList.remove('hidden');
            document.getElementById('multiplayer-layout').classList.add('hidden');
            
            showScreen('game-screen');
            console.log('화면 전환 완료');
            
            this.singlePlayerGame.start();
            console.log('게임 시작 완료');
            
            // 배경음악 시작
            if (window.audioManager) {
                window.audioManager.playBackgroundMusic();
                console.log('배경음악 시작');
            }
        } catch (error) {
            console.error('단일 플레이어 게임 시작 중 오류:', error);
        }
    }
    
    // 멀티플레이어 메뉴 표시
    showMultiplayerMenu() {
        showScreen('multiplayer-screen');
        document.getElementById('room-code-section').classList.add('hidden');
        document.getElementById('join-room-section').classList.add('hidden');
    }
    
    // 멀티플레이어 게임 호스트
    async hostMultiplayerGame() {
        try {
            if (!window.networkManager) {
                window.networkManager = new NetworkManager();
            }
            
            const roomCode = await window.networkManager.createRoom();
            
            document.getElementById('room-code').textContent = roomCode;
            document.getElementById('room-code-section').classList.remove('hidden');
            
            // 연결 대기
            window.networkManager.setConnectionCallbacks(
                () => this.startMultiplayerGame(),
                () => this.handleConnectionLost()
            );
            
            window.networkManager.setMessageCallback((data) => {
                this.handleNetworkMessage(data);
            });
            
        } catch (error) {
            alert('게임 방 생성에 실패했습니다: ' + error.message);
        }
    }
    
    // 게임 참가 폼 표시
    showJoinGameForm() {
        document.getElementById('join-room-section').classList.remove('hidden');
        document.getElementById('room-code-input').focus();
    }
    
    // 멀티플레이어 게임 참가
    async joinMultiplayerGame() {
        const roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
        
        if (!roomCode || roomCode.length !== 6) {
            alert('올바른 방 코드를 입력해주세요 (6자리)');
            return;
        }
        
        // 로딩 표시
        const joinBtn = document.getElementById('join-room-btn');
        const originalText = joinBtn.textContent;
        joinBtn.textContent = '연결 중...';
        joinBtn.disabled = true;
        
        try {
            if (!window.networkManager) {
                window.networkManager = new NetworkManager();
            }
            
            await window.networkManager.joinRoom(roomCode);
            
            window.networkManager.setConnectionCallbacks(
                () => {
                    joinBtn.textContent = originalText;
                    joinBtn.disabled = false;
                    this.startMultiplayerGame();
                },
                () => this.handleConnectionLost()
            );
            
            window.networkManager.setMessageCallback((data) => {
                this.handleNetworkMessage(data);
            });
            
            // 성공 메시지
            alert(`🎮 방 "${roomCode}"에 참가했습니다!\n(시뮬레이션 모드: AI 상대방과 대전)`);
            
        } catch (error) {
            joinBtn.textContent = originalText;
            joinBtn.disabled = false;
            alert('게임 참가에 실패했습니다: ' + error.message);
        }
    }
    
    // 멀티플레이어 게임 시작
    startMultiplayerGame() {
        this.gameMode = 'multiplayer';
        
        const p1Canvas = document.getElementById('p1-board');
        const p1NextCanvas = document.getElementById('p1-next');
        const p2Canvas = document.getElementById('p2-board');
        const p2NextCanvas = document.getElementById('p2-next');
        
        this.multiplayerGames = {
            player1: new TetrisGame(p1Canvas, p1NextCanvas, true, 1),
            player2: new TetrisGame(p2Canvas, p2NextCanvas, true, 2)
        };
        
        document.getElementById('single-player-layout').classList.add('hidden');
        document.getElementById('multiplayer-layout').classList.remove('hidden');
        
        showScreen('game-screen');
        
        // 로컬 플레이어만 시작 (상대방은 네트워크를 통해 동기화)
        this.multiplayerGames.player1.start();
        this.multiplayerGames.player2.start();
        
        // 배경음악 시작
        if (window.audioManager) {
            window.audioManager.playBackgroundMusic();
        }
    }
    
    // 네트워크 메시지 처리
    handleNetworkMessage(data) {
        switch (data.type) {
            case 'attack_lines':
                if (this.multiplayerGames) {
                    this.multiplayerGames.player1.receiveAttackLines(data.count);
                }
                break;
            case 'game_over':
                this.handleOpponentGameOver();
                break;
        }
    }
    
    // 상대방 게임 오버 처리
    handleOpponentGameOver() {
        if (this.multiplayerGames) {
            this.multiplayerGames.player1.stop();
            this.multiplayerGames.player2.stop();
            
            alert('상대방이 게임에서 패배했습니다! 승리!');
            this.showMainMenu();
        }
    }
    
    // 연결 끊김 처리
    handleConnectionLost() {
        alert('상대방과의 연결이 끊어졌습니다.');
        this.showMainMenu();
    }
    
    // 게임 일시정지
    pauseGame() {
        if (this.gameMode === 'single' && this.singlePlayerGame) {
            this.singlePlayerGame.pause();
            const pauseBtn = document.getElementById('pause-btn');
            pauseBtn.textContent = this.singlePlayerGame.isPaused ? '계속하기' : '일시정지';
        }
    }
    
    // 게임 멈춤
    stopGame() {
        if (confirm('게임을 멈추시겠습니까? (진행 상황이 초기화됩니다)')) {
            if (this.gameMode === 'single' && this.singlePlayerGame) {
                this.singlePlayerGame.stop();
                this.singlePlayerGame.initBoard();
                this.singlePlayerGame.score = 0;
                this.singlePlayerGame.level = 1;
                this.singlePlayerGame.lines = 0;
                this.singlePlayerGame.updateScore();
                this.singlePlayerGame.draw();
            } else if (this.gameMode === 'multiplayer' && this.multiplayerGames) {
                this.multiplayerGames.player1.stop();
                this.multiplayerGames.player2.stop();
                this.multiplayerGames.player1.initBoard();
                this.multiplayerGames.player2.initBoard();
            }
            
            // 일시정지 버튼 텍스트 초기화
            document.getElementById('pause-btn').textContent = '일시정지';
        }
    }
    
    // 게임 재시작
    restartGame() {
        if (confirm('정말로 게임을 다시 시작하시겠습니까?')) {
            if (this.gameMode === 'single' && this.singlePlayerGame) {
                this.singlePlayerGame.start();
            } else if (this.gameMode === 'multiplayer' && this.multiplayerGames) {
                this.multiplayerGames.player1.start();
                this.multiplayerGames.player2.start();
            }
        }
    }
    
    // 게임 종료
    quitGame() {
        if (confirm('정말로 게임을 종료하시겠습니까?')) {
            this.showMainMenu();
        }
    }
    
    // 게임 오버에서 재시작
    restartFromGameOver() {
        if (this.gameMode === 'single') {
            this.startSinglePlayer();
        } else {
            this.showMainMenu();
        }
    }
    
    // 메인 메뉴 표시
    showMainMenu() {
        // 게임 정리
        if (this.singlePlayerGame) {
            this.singlePlayerGame.stop();
            this.singlePlayerGame = null;
        }
        
        if (this.multiplayerGames) {
            this.multiplayerGames.player1.stop();
            this.multiplayerGames.player2.stop();
            this.multiplayerGames = null;
        }
        
        // 네트워크 연결 정리
        if (window.networkManager) {
            window.networkManager.disconnect();
            window.networkManager = null;
        }
        
        this.gameMode = null;
        document.getElementById('pause-btn').textContent = '일시정지';
        
        // 배경음악 정지
        if (window.audioManager) {
            window.audioManager.stopBackgroundMusic();
        }
        
        showScreen('menu-screen');
    }
}

// 화면 전환 함수
function showScreen(screenId) {
    try {
        console.log(`🔄 화면 전환 시도: ${screenId}`);
        
        const screens = document.querySelectorAll('.screen');
        console.log(`📱 찾은 화면 개수: ${screens.length}`);
        
        screens.forEach(screen => {
            screen.classList.remove('active');
            // CSS 우선순위를 위해 더 강력한 스타일 적용
            screen.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important; z-index: -1000 !important;';
            console.log(`  - ${screen.id} 비활성화`);
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            // 약간의 지연을 두고 활성화 (CSS 전환 완료 대기)
            setTimeout(() => {
                targetScreen.classList.add('active');
                // 강제로 스타일 적용 - CSS보다 우선순위 높게
                if (screenId === 'game-screen') {
                    targetScreen.style.cssText = 'display: flex !important; opacity: 1 !important; visibility: visible !important; z-index: 2000 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100vh !important; justify-content: center !important; align-items: flex-start !important; padding: 20px !important; overflow-y: auto !important;';
                } else {
                    targetScreen.style.cssText = 'display: flex !important; opacity: 1 !important; visibility: visible !important; z-index: 2000 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100vh !important; justify-content: center !important; align-items: center !important;';
                }
                console.log(`✅ ${screenId} 활성화 완료`);
            }, 10);
        } else {
            console.error(`❌ 화면을 찾을 수 없음: ${screenId}`);
        }
    } catch (error) {
        console.error('화면 전환 오류:', error);
    }
}

// 애플리케이션 초기화 (각 탭/창별로 독립적)
let tetrisApp;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM 로드 완료 - 초기화 시작');
    
    try {
        console.log('📝 TetrisApp 클래스 생성 시도...');
        
        // 각 브라우저 탭/창마다 독립적인 인스턴스 생성
        const sessionId = 'tetris_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('🆔 세션 ID:', sessionId);
        
        tetrisApp = new TetrisApp();
        tetrisApp.sessionId = sessionId;
        console.log('✅ TetrisApp 초기화 완료');
        
        // 오디오 매니저 초기화
        console.log('🎵 AudioManager 초기화 시도...');
        try {
            window.audioManager = new AudioManager();
            console.log('✅ AudioManager 초기화 완료');
        } catch (audioError) {
            console.warn('⚠️ AudioManager 초기화 실패 (게임은 계속 진행됩니다):', audioError);
            window.audioManager = null;
        }
        
        console.log('🎮 테트리스 게임이 초기화되었습니다!');
        
        // 메뉴 버튼들이 제대로 표시되는지 확인
        const menuButtons = document.querySelectorAll('.menu-btn');
        console.log('🔘 메뉴 버튼 개수:', menuButtons.length);
        
        menuButtons.forEach((btn, index) => {
            console.log(`  버튼 ${index + 1}: ${btn.textContent} (ID: ${btn.id})`);
        });
        
        // CSS 로드 확인
        const bodyStyle = window.getComputedStyle(document.body);
        console.log('🎨 배경색:', bodyStyle.backgroundColor);
        console.log('🎨 텍스트 색상:', bodyStyle.color);
        
        // 서비스 워커 등록 (PWA 지원)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker 등록 성공:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 등록 실패:', error);
                });
        }
        
        console.log('🎯 모든 초기화 완료!');
        
    } catch (error) {
        console.error('❌ 초기화 중 치명적 오류 발생:', error);
        console.error('스택 트레이스:', error.stack);
        
        // 오류 발생 시 기본 UI라도 표시
        document.body.innerHTML = `
            <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
                <h1>🚨 게임 로드 실패</h1>
                <p>JavaScript 오류가 발생했습니다:</p>
                <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; text-align: left;">${error.message}</pre>
                <button onclick="location.reload()" style="padding: 10px 20px; margin: 10px; background: white; color: #e74c3c; border: none; border-radius: 5px; cursor: pointer;">새로고침</button>
                <button onclick="location.href='debug.html'" style="padding: 10px 20px; margin: 10px; background: white; color: #e74c3c; border: none; border-radius: 5px; cursor: pointer;">디버그 페이지</button>
            </div>
        `;
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (window.networkManager) {
        window.networkManager.disconnect();
    }
});
