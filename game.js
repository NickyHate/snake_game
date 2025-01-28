"use strict";
class SnakeGame {
    constructor() {
        var _a, _b, _c, _d, _e, _f;
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = 'right';
        this.gameInterval = null;
        this.score = 0;
        this.gridSize = 20;
        this.gameSpeed = 100;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30; // Минимальное расстояние для свайпа
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.speedRange = document.getElementById('speedRange');
        this.speedValue = document.getElementById('speedValue');
        // Инициализация скорости из ползунка
        this.gameSpeed = 200 - parseInt(this.speedRange.value); // Инвертируем значение
        // Event Listeners
        (_a = document.getElementById('startButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.startGame());
        (_b = document.getElementById('restartButton')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.reset());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        // Добавляем слушатель для изменения скорости
        this.speedRange.addEventListener('input', () => this.updateSpeed());
        // Добавляем обработчики для мобильных кнопок
        (_c = document.getElementById('upButton')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.handleMobileControl('up'));
        (_d = document.getElementById('downButton')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.handleMobileControl('down'));
        (_e = document.getElementById('leftButton')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => this.handleMobileControl('left'));
        (_f = document.getElementById('rightButton')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => this.handleMobileControl('right'));
        this.reset();
    }
    updateSpeed() {
        // Инвертируем значение, чтобы большее значение ползунка
        // соответствовало большей скорости
        this.gameSpeed = 200 - parseInt(this.speedRange.value);
        this.speedValue.textContent = this.speedRange.value;
        // Если игра запущена, перезапускаем с новой скоростью
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = window.setInterval(() => this.gameLoop(), this.gameSpeed);
        }
    }
    reset() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = 'right';
        this.score = 0;
        this.updateScore();
        this.generateFood();
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.draw();
    }
    startGame() {
        if (this.gameInterval)
            return;
        this.gameInterval = window.setInterval(() => this.gameLoop(), this.gameSpeed);
    }
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    }
    handleKeyPress(event) {
        // Используем code вместо key для независимости от раскладки
        const keyCode = event.code.toLowerCase();
        const directions = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'keyw': 'up',
            'keys': 'down',
            'keya': 'left',
            'keyd': 'right' // code для клавиши D
        };
        const newDirection = directions[keyCode];
        if (newDirection) {
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            if (this.direction !== opposites[newDirection]) {
                this.direction = newDirection;
            }
        }
    }
    handleMobileControl(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        if (this.direction !== opposites[direction]) {
            this.direction = direction;
        }
    }
    gameLoop() {
        const head = Object.assign({}, this.snake[0]);
        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        // Check collision with walls
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        this.snake.unshift(head);
        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        }
        else {
            this.snake.pop();
        }
        this.draw();
    }
    checkCollision(position) {
        return this.snake.some(segment => segment.x === position.x && segment.y === position.y);
    }
    gameOver() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.fillText('Game Over!', this.canvas.width / 2 - 70, this.canvas.height / 2);
    }
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }
    }
    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1f2937');
        gradient.addColorStop(1, '#111827');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw grid (subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        // Draw snake with gradient and glow effect
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            // Create gradient for snake segments
            const segmentGradient = this.ctx.createLinearGradient(segment.x * this.gridSize, segment.y * this.gridSize, (segment.x + 1) * this.gridSize, (segment.y + 1) * this.gridSize);
            if (isHead) {
                segmentGradient.addColorStop(0, '#4f46e5');
                segmentGradient.addColorStop(1, '#3b82f6');
            }
            else {
                segmentGradient.addColorStop(0, '#3b82f6');
                segmentGradient.addColorStop(1, '#2563eb');
            }
            // Add glow effect
            this.ctx.shadowColor = '#3b82f6';
            this.ctx.shadowBlur = isHead ? 15 : 10;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            // Draw segment
            this.ctx.fillStyle = segmentGradient;
            this.ctx.beginPath();
            this.ctx.roundRect(segment.x * this.gridSize + 1, segment.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2, isHead ? 8 : 4);
            this.ctx.fill();
            // Reset shadow
            this.ctx.shadowBlur = 0;
            // Add eyes for head
            if (isHead) {
                this.drawSnakeEyes(segment);
            }
        });
        // Draw food with pulsing effect
        const time = Date.now() * 0.001; // Convert to seconds
        const pulse = Math.sin(time * 4) * 0.1 + 0.9; // Pulsing between 0.8 and 1.0
        const foodSize = this.gridSize * pulse;
        const foodGradient = this.ctx.createRadialGradient(this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, 0, this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, foodSize / 2);
        foodGradient.addColorStop(0, '#ef4444');
        foodGradient.addColorStop(1, '#dc2626');
        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = foodGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, foodSize / 2 - 1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    drawSnakeEyes(head) {
        const eyeSize = this.gridSize / 6;
        const eyeOffset = this.gridSize / 4;
        // Определяем позиции глаз в зависимости от направления
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        switch (this.direction) {
            case 'right':
                leftEyeX = (head.x + 0.7) * this.gridSize;
                leftEyeY = (head.y + 0.3) * this.gridSize;
                rightEyeX = (head.x + 0.7) * this.gridSize;
                rightEyeY = (head.y + 0.7) * this.gridSize;
                break;
            case 'left':
                leftEyeX = (head.x + 0.3) * this.gridSize;
                leftEyeY = (head.y + 0.3) * this.gridSize;
                rightEyeX = (head.x + 0.3) * this.gridSize;
                rightEyeY = (head.y + 0.7) * this.gridSize;
                break;
            case 'up':
                leftEyeX = (head.x + 0.3) * this.gridSize;
                leftEyeY = (head.y + 0.3) * this.gridSize;
                rightEyeX = (head.x + 0.7) * this.gridSize;
                rightEyeY = (head.y + 0.3) * this.gridSize;
                break;
            case 'down':
                leftEyeX = (head.x + 0.3) * this.gridSize;
                leftEyeY = (head.y + 0.7) * this.gridSize;
                rightEyeX = (head.x + 0.7) * this.gridSize;
                rightEyeY = (head.y + 0.7) * this.gridSize;
                break;
            default:
                return;
        }
        // Рисуем глаза
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        // Рисуем зрачки
        this.ctx.fillStyle = '#1a1c20';
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize / 2, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
// Initialize game when window loads
window.onload = () => {
    new SnakeGame();
};
//# sourceMappingURL=game.js.map