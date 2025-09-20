// 테트리스 블록 정의
class TetrisBlock {
    constructor(type, x = 0, y = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.shape = BLOCK_SHAPES[type];
        this.color = BLOCK_COLORS[type];
    }

    // 현재 회전 상태의 블록 모양 반환
    getCurrentShape() {
        return this.shape[this.rotation];
    }

    // 블록 회전
    rotate() {
        const oldRotation = this.rotation;
        this.rotation = (this.rotation + 1) % this.shape.length;
        console.log(`블록 회전: ${this.type}, ${oldRotation} → ${this.rotation}`);
    }

    // 블록 회전 되돌리기
    unrotate() {
        const oldRotation = this.rotation;
        this.rotation = (this.rotation - 1 + this.shape.length) % this.shape.length;
        console.log(`블록 회전 되돌리기: ${this.type}, ${oldRotation} → ${this.rotation}`);
    }

    // 블록 복사
    clone() {
        const cloned = new TetrisBlock(this.type, this.x, this.y);
        cloned.rotation = this.rotation;
        return cloned;
    }
}

// 블록 타입 정의
const BLOCK_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// 블록 색상 정의
const BLOCK_COLORS = {
    'I': '#00f0f0', // 시안
    'O': '#f0f000', // 노랑
    'T': '#a000f0', // 보라
    'S': '#00f000', // 초록
    'Z': '#f00000', // 빨강
    'J': '#0000f0', // 파랑
    'L': '#f0a000'  // 주황
};

// 블록 모양 정의 (4x4 그리드)
const BLOCK_SHAPES = {
    'I': [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],
    'O': [
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    ],
    'T': [
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],
    'S': [
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],
    'Z': [
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [1, 0, 0, 0]
        ]
    ],
    'J': [
        [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0]
        ]
    ],
    'L': [
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [1, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ]
};

// 랜덤 블록 생성
function getRandomBlock() {
    const type = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
    const block = new TetrisBlock(type);
    
    // 블록 유효성 검사
    if (!block.shape || !block.color) {
        console.error('잘못된 블록 생성:', type);
        return new TetrisBlock('I'); // 기본 블록 반환
    }
    
    console.log(`새 블록 생성: ${type}, 회전 상태: ${block.rotation}`);
    return block;
}

// 3D 입체감 블록 렌더링 함수
function drawBlock(ctx, block, cellSize, offsetX = 0, offsetY = 0, ghost = false) {
    const shape = block.getCurrentShape();
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const x = (block.x + col) * cellSize + offsetX;
                const y = (block.y + row) * cellSize + offsetY;
                
                if (ghost) {
                    // 고스트 블록은 제거됨 - 빈 함수로 유지
                } else {
                    draw3DBlock(ctx, x, y, cellSize, block.color);
                }
            }
        }
    }
}

// 3D 입체감 블록 그리기
function draw3DBlock(ctx, x, y, size, color) {
    // 크기 유효성 검사
    if (size <= 0 || !isFinite(size)) {
        console.warn('잘못된 블록 크기:', size);
        size = 30; // 기본값
    }
    
    const bevelSize = Math.max(1, Math.min(size * 0.15, 5)); // 베벨 크기 제한
    
    // 메인 블록 면
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    
    // 상단 하이라이트 (밝은 면)
    const lightColor = lightenColor(color, 0.3);
    ctx.fillStyle = lightColor;
    ctx.fillRect(x, y, size, bevelSize);
    ctx.fillRect(x, y, bevelSize, size);
    
    // 하단/우측 그림자 (어두운 면)
    const shadowColor = darkenColor(color, 0.3);
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x, y + size - bevelSize, size, bevelSize);
    ctx.fillRect(x + size - bevelSize, y, bevelSize, size);
    
    // 테두리
    ctx.strokeStyle = darkenColor(color, 0.5);
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);
    
    // 내부 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + bevelSize, y + bevelSize, size - bevelSize * 2, 1);
    ctx.fillRect(x + bevelSize, y + bevelSize, 1, size - bevelSize * 2);
}

// 전역 색상 유틸리티 함수들
window.ColorUtils = {
    lighten: function(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    },
    
    darken: function(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.floor(r * (1 - factor));
        const newG = Math.floor(g * (1 - factor));
        const newB = Math.floor(b * (1 - factor));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
};

// 하위 호환성을 위한 전역 함수들
function lightenColor(color, factor) {
    return window.ColorUtils.lighten(color, factor);
}

function darkenColor(color, factor) {
    return window.ColorUtils.darken(color, factor);
}

// 미니 블록 렌더링 (다음 블록 표시용)
function drawMiniBlock(ctx, block, cellSize, centerX, centerY) {
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
    
    for (let row = minY; row <= maxY; row++) {
        for (let col = minX; col <= maxX; col++) {
            if (shape[row][col]) {
                const x = startX + (col - minX) * cellSize;
                const y = startY + (row - minY) * cellSize;
                
                draw3DBlock(ctx, x, y, cellSize, block.color);
            }
        }
    }
}
