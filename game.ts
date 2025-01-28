type Position = {
    x: number;
    y: number;
};

class SnakeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private snake: Position[] = [];
    private food: Position = { x: 0, y: 0 };
    private direction: string = 'right';
    private gameInterval: number | null = null;
    private score: number = 0;
    private gridSize: number = 20;
    private gameSpeed: number = 100;
    private speedRange: HTMLInputElement;
    private speedValue: HTMLSpanElement;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.speedRange = document.getElementById('speedRange') as HTMLInputElement;
        this.speedValue = document.getElementById('speedValue') as HTMLSpanElement;
        
        // Инициализация скорости из ползунка
        this.gameSpeed = 200 - parseInt(this.speedRange.value); // Инвертируем значение
        
        // Event Listeners
        document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
        document.getElementById('restartButton')?.addEventListener('click', () => this.reset());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Добавляем слушатель для изменения скорости
        this.speedRange.addEventListener('input', () => this.updateSpeed());
        
        this.reset();
    }

    private updateSpeed(): void {
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

    private reset(): void {
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

    private startGame(): void {
        if (this.gameInterval) return;
        this.gameInterval = window.setInterval(() => this.gameLoop(), this.gameSpeed);
    }

    private generateFood(): void {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    }

    private handleKeyPress(event: KeyboardEvent): void {
        // Используем code вместо key для независимости от раскладки
        const keyCode = event.code.toLowerCase();
        const directions: { [key: string]: string } = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'keyw': 'up',    // code для клавиши W
            'keys': 'down',  // code для клавиши S
            'keya': 'left',  // code для клавиши A
            'keyd': 'right'  // code для клавиши D
        };

        const newDirection = directions[keyCode];
        
        if (newDirection) {
            const opposites: { [key: string]: string } = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };

            if (this.direction !== opposites[newDirection as keyof typeof opposites]) {
                this.direction = newDirection;
            }
        }
    }

    private gameLoop(): void {
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
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
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    private checkCollision(position: Position): boolean {
        return this.snake.some(segment => segment.x === position.x && segment.y === position.y);
    }

    private gameOver(): void {
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

    private updateScore(): void {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }
    }

    private draw(): void {
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
            const segmentGradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );

            if (isHead) {
                segmentGradient.addColorStop(0, '#4f46e5');
                segmentGradient.addColorStop(1, '#3b82f6');
            } else {
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
            this.ctx.roundRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                isHead ? 8 : 4
            );
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

        const foodGradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            0,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            foodSize / 2
        );
        foodGradient.addColorStop(0, '#ef4444');
        foodGradient.addColorStop(1, '#dc2626');

        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = foodGradient;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            foodSize / 2 - 1,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    private drawSnakeEyes(head: Position): void {
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
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize/2, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize/2, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// Initialize game when window loads
window.onload = () => {
    new SnakeGame();
}; 