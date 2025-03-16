// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get score element
const scoreElement = document.getElementById('score');

// Get sound elements
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

// Define grid size
let grid = 20;

// Initialize game variables
let snake = [
    {x: 160, y: 200},
    {x: 140, y: 200},
    {x: 120, y: 200}
];
let direction = 'RIGHT';
let changingDirection = false;
let food = getRandomFood();
let gameInterval = null;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// Update initial high score display
updateScore();

// Event listeners for buttons and keyboard
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('stopButton').addEventListener('click', stopGame);
document.addEventListener("keydown", changeDirection);

// Event listeners for touch controls
document.getElementById('up').addEventListener('click', () => changeDirectionByButton('UP'));
document.getElementById('down').addEventListener('click', () => changeDirectionByButton('DOWN'));
document.getElementById('left').addEventListener('click', () => changeDirectionByButton('LEFT'));
document.getElementById('right').addEventListener('click', () => changeDirectionByButton('RIGHT'));

// Function to start the game
function startGame() {
    if (gameInterval) return; // Prevent multiple intervals
    // Reset game variables
    direction = 'RIGHT';
    snake = [
        {x: 160, y: 200},
        {x: 140, y: 200},
        {x: 120, y: 200}
    ];
    food = getRandomFood();
    score = 0;
    updateScore();
    clearCanvas();
    drawFood();
    drawSnake();
    // Start the game loop
    gameInterval = setInterval(gameLoop, 100);
}

// Function to stop the game
function stopGame() {
    clearInterval(gameInterval);
    gameInterval = null;
}

// Main game loop
function gameLoop() {
    if (didGameEnd()) {
        stopGame();
        gameOverSound.play();
        setTimeout(() => {
            alert('🎮 Game Over! Your final score is ' + score + ' 🎮');
        }, 100);
        return;
    }
    changingDirection = false;
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
}

// Clear the canvas
function clearCanvas() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Draw the snake on the canvas
function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#00FF00' : '#8FBC8F'; // Head is brighter
        ctx.fillRect(part.x, part.y, grid - 2, grid - 2);
        ctx.strokeStyle = '#006400';
        ctx.strokeRect(part.x, part.y, grid - 2, grid - 2);
    });
}

// Move the snake in the current direction
function moveSnake() {
    const head = {x: snake[0].x, y: snake[0].y};
    switch(direction) {
        case 'LEFT':
            head.x -= grid;
            break;
        case 'UP':
            head.y -= grid;
            break;
        case 'RIGHT':
            head.x += grid;
            break;
        case 'DOWN':
            head.y += grid;
            break;
    }
    snake.unshift(head);

    // Check if snake has eaten the food
    if (head.x === food.x && head.y === food.y) {
        score += 10; // Increment score by 10
        eatSound.play();
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
        }
        updateScore();
        food = getRandomFood();
    } else {
        snake.pop(); // Remove the tail if no food eaten
    }
}

// Update the score display
function updateScore() {
    scoreElement.textContent = '🏆 Score: ' + score + ' | 🥇 High Score: ' + highScore;
}

// Change direction based on key press
function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;
    const keyPressed = event.key;
    const LEFT = 'ArrowLeft';
    const UP = 'ArrowUp';
    const RIGHT = 'ArrowRight';
    const DOWN = 'ArrowDown';

    if (keyPressed === LEFT && direction !== 'RIGHT') {
        direction = 'LEFT';
    }
    if (keyPressed === UP && direction !== 'DOWN') {
        direction = 'UP';
    }
    if (keyPressed === RIGHT && direction !== 'LEFT') {
        direction = 'RIGHT';
    }
    if (keyPressed === DOWN && direction !== 'UP') {
        direction = 'DOWN';
    }
}

// Change direction via touch buttons
function changeDirectionByButton(newDirection) {
    if (changingDirection) return;
    changingDirection = true;

    if (newDirection === 'LEFT' && direction !== 'RIGHT') {
        direction = 'LEFT';
    }
    if (newDirection === 'UP' && direction !== 'DOWN') {
        direction = 'UP';
    }
    if (newDirection === 'RIGHT' && direction !== 'LEFT') {
        direction = 'RIGHT';
    }
    if (newDirection === 'DOWN' && direction !== 'UP') {
        direction = 'DOWN';
    }
}

// Draw the food on the canvas
function drawFood() {
    ctx.fillStyle = '#FF4C4C';
    ctx.fillRect(food.x, food.y, grid - 2, grid - 2);
    ctx.strokeStyle = '#8B0000';
    ctx.strokeRect(food.x, food.y, grid - 2, grid - 2);
}

// Generate random position for food
function getRandomFood() {
    const x = Math.floor(Math.random() * (canvas.width / grid)) * grid;
    const y = Math.floor(Math.random() * (canvas.height / grid)) * grid;
    // Ensure food does not appear on the snake
    for (let part of snake) {
        if (part.x === x && part.y === y) {
            return getRandomFood();
        }
    }
    return {x, y};
}

// Check if the game has ended
function didGameEnd() {
    // Check if snake has collided with itself
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    // Check if snake has hit the wall
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;
    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

// Adjust grid size based on canvas size
function adjustGridSize() {
    const canvasWidth = canvas.clientWidth;
    grid = Math.floor(canvasWidth / 20); // Adjust the number of grid cells
    canvas.width = grid * 20;
    canvas.height = grid * 20;
}

// Initialize the game on load
window.onload = () => {
    adjustGridSize();
    clearCanvas();
    drawFood();
    drawSnake();
};

// Adjust grid size on window resize
window.onresize = () => {
    adjustGridSize();
    clearCanvas();
    drawFood();
    drawSnake();
};
