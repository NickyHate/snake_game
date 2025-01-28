var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var SnakeGame = /** @class */ (function () {
    function SnakeGame() {
        var _this = this;
        var _a, _b;
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = 'right';
        this.gameInterval = null;
        this.score = 0;
        this.gridSize = 20;
        this.gameSpeed = 100;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.speedRange = document.getElementById('speedRange');
        this.speedValue = document.getElementById('speedValue');
        // Инициализация скорости из ползунка
        this.gameSpeed = 200 - parseInt(this.speedRange.value); // Инвертируем значение
        // Event Listeners
        (_a = document.getElementById('startButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () { return _this.startGame(); });
        (_b = document.getElementById('restartButton')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () { return _this.reset(); });
        document.addEventListener('keydown', function (e) { return _this.handleKeyPress(e); });
        // Добавляем слушатель для изменения скорости
        this.speedRange.addEventListener('input', function () { return _this.updateSpeed(); });
        this.reset();
    }
    SnakeGame.prototype.updateSpeed = function () {
        var _this = this;
        // Инвертируем значение, чтобы большее значение ползунка
        // соответствовало большей скорости
        this.gameSpeed = 200 - parseInt(this.speedRange.value);
        this.speedValue.textContent = this.speedRange.value;
        // Если игра запущена, перезапускаем с новой скоростью
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = window.setInterval(function () { return _this.gameLoop(); }, this.gameSpeed);
        }
    };
    SnakeGame.prototype.reset = function () {
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
    };
    SnakeGame.prototype.startGame = function () {
        var _this = this;
        if (this.gameInterval)
            return;
        this.gameInterval = window.setInterval(function () { return _this.gameLoop(); }, this.gameSpeed);
    };
    SnakeGame.prototype.generateFood = function () {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    };
    SnakeGame.prototype.handleKeyPress = function (event) {
        // Используем code вместо key для независимости от раскладки
        var keyCode = event.code.toLowerCase();
        var directions = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'keyw': 'up',
            'keys': 'down',
            'keya': 'left',
            'keyd': 'right' // code для клавиши D
        };
        var newDirection = directions[keyCode];
        if (newDirection) {
            var opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            if (this.direction !== opposites[newDirection]) {
                this.direction = newDirection;
            }
        }
    };
    SnakeGame.prototype.gameLoop = function () {
        var head = __assign({}, this.snake[0]);
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
    };
    SnakeGame.prototype.checkCollision = function (position) {
        return this.snake.some(function (segment) { return segment.x === position.x && segment.y === position.y; });
    };
    SnakeGame.prototype.gameOver = function () {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.fillText('Game Over!', this.canvas.width / 2 - 70, this.canvas.height / 2);
    };
    SnakeGame.prototype.updateScore = function () {
        var scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }
    };
    SnakeGame.prototype.draw = function () {
        var _this = this;
        // Clear canvas with gradient background
        var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1f2937');
        gradient.addColorStop(1, '#111827');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw grid (subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 0.5;
        for (var i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (var i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        // Draw snake with gradient and glow effect
        this.snake.forEach(function (segment, index) {
            var isHead = index === 0;
            // Create gradient for snake segments
            var segmentGradient = _this.ctx.createLinearGradient(segment.x * _this.gridSize, segment.y * _this.gridSize, (segment.x + 1) * _this.gridSize, (segment.y + 1) * _this.gridSize);
            if (isHead) {
                segmentGradient.addColorStop(0, '#4f46e5');
                segmentGradient.addColorStop(1, '#3b82f6');
            }
            else {
                segmentGradient.addColorStop(0, '#3b82f6');
                segmentGradient.addColorStop(1, '#2563eb');
            }
            // Add glow effect
            _this.ctx.shadowColor = '#3b82f6';
            _this.ctx.shadowBlur = isHead ? 15 : 10;
            _this.ctx.shadowOffsetX = 0;
            _this.ctx.shadowOffsetY = 0;
            // Draw segment
            _this.ctx.fillStyle = segmentGradient;
            _this.ctx.beginPath();
            _this.ctx.roundRect(segment.x * _this.gridSize + 1, segment.y * _this.gridSize + 1, _this.gridSize - 2, _this.gridSize - 2, isHead ? 8 : 4);
            _this.ctx.fill();
            // Reset shadow
            _this.ctx.shadowBlur = 0;
            // Add eyes for head
            if (isHead) {
                _this.drawSnakeEyes(segment);
            }
        });
        // Draw food with pulsing effect
        var time = Date.now() * 0.001; // Convert to seconds
        var pulse = Math.sin(time * 4) * 0.1 + 0.9; // Pulsing between 0.8 and 1.0
        var foodSize = this.gridSize * pulse;
        var foodGradient = this.ctx.createRadialGradient(this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, 0, this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, foodSize / 2);
        foodGradient.addColorStop(0, '#ef4444');
        foodGradient.addColorStop(1, '#dc2626');
        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = foodGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.food.x * this.gridSize + this.gridSize / 2, this.food.y * this.gridSize + this.gridSize / 2, foodSize / 2 - 1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    };
    SnakeGame.prototype.drawSnakeEyes = function (head) {
        var eyeSize = this.gridSize / 6;
        var eyeOffset = this.gridSize / 4;
        // Определяем позиции глаз в зависимости от направления
        var leftEyeX, leftEyeY, rightEyeX, rightEyeY;
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
    };
    return SnakeGame;
}());
// Initialize game when window loads
window.onload = function () {
    new SnakeGame();
};
