// 게임 상수 정의
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

// 테트리스 블록 모양 정의
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]]  // S
];

// 게임 상태 변수
let canvas;
let ctx;
let board = [];
let currentPiece;
let score = 0;
let gameLoop;
let isPaused = false;

// 게임 초기화
function init() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // 게임 보드 초기화
    for (let row = 0; row < ROWS; row++) {
        board[row] = new Array(COLS).fill(0);
    }
    
    // 이벤트 리스너 설정
    document.addEventListener('keydown', handleKeyPress);
}

// 새 조각 생성
function createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    const color = COLORS[shapeIndex];
    
    return {
        shape: shape,
        color: color,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

// 게임 시작
function startGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    score = 0;
    document.getElementById('score').textContent = score;
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentPiece = createPiece();
    isPaused = false;
    gameLoop = setInterval(update, 1000);
}

// 게임 일시정지
function pauseGame() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(update, 1000);
    }
}

// 게임 업데이트
function update() {
    if (isPaused) return;
    
    if (canMove(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        placePiece();
        clearLines();
        currentPiece = createPiece();
        if (!canMove(currentPiece, 0, 0)) {
            gameOver();
        }
    }
    draw();
}

// 조각 이동 가능 여부 확인
function canMove(piece, offsetX, offsetY) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
                if (newY >= 0 && board[newY][newX]) return false;
            }
        }
    }
    return true;
}

// 조각 배치
function placePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
}

// 줄 제거
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(new Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100;
        document.getElementById('score').textContent = score;
    }
}

// 게임 오버
function gameOver() {
    clearInterval(gameLoop);
    alert('게임 오버! 점수: ' + score);
}

// 키 입력 처리
function handleKeyPress(event) {
    if (isPaused) return;
    
    switch(event.keyCode) {
        case 37: // 왼쪽
            if (canMove(currentPiece, -1, 0)) {
                currentPiece.x--;
            }
            break;
        case 39: // 오른쪽
            if (canMove(currentPiece, 1, 0)) {
                currentPiece.x++;
            }
            break;
        case 40: // 아래
            if (canMove(currentPiece, 0, 1)) {
                currentPiece.y++;
            }
            break;
        case 38: // 위 (회전)
            rotatePiece();
            break;
    }
    draw();
}

// 조각 회전
function rotatePiece() {
    const rotated = [];
    for (let i = 0; i < currentPiece.shape[0].length; i++) {
        rotated[i] = [];
        for (let j = currentPiece.shape.length - 1; j >= 0; j--) {
            rotated[i].push(currentPiece.shape[j][i]);
        }
    }
    
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (!canMove(currentPiece, 0, 0)) {
        currentPiece.shape = originalShape;
    }
}

// 게임 화면 그리기
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 보드 그리기
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    
    // 현재 조각 그리기
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            }
        }
    }
}

// 블록 그리기
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

// 게임 초기화
window.onload = init; 