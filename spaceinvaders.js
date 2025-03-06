/**
 * Space Invaders Game
 * Triggered as an Easter Egg via Konami Code
 */

class SpaceInvadersGame {
    constructor() {
        // Create game container
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'easter-egg-game';
        this.gameContainer.innerHTML = `
            <div class="game-header">
                <h2>SPACE INVADERS</h2>
                <p>Score: <span id="game-score">0</span></p>
                <button id="close-game">&times;</button>
            </div>
            <canvas id="game-canvas"></canvas>
            <div class="game-controls">
                <p>Arrow keys to move, Space to shoot</p>
            </div>
        `;
        document.body.appendChild(this.gameContainer);
        
        // Get game elements
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 480;
        this.canvas.height = 320;
        this.scoreElement = document.getElementById('game-score');
        
        // Set up close button
        document.getElementById('close-game').addEventListener('click', () => {
            this.gameContainer.remove();
            this.running = false;
            this.removeEventListeners();
        });
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.running = true;
        
        // Player
        this.player = {
            x: this.canvas.width / 2 - 15,
            y: this.canvas.height - 30,
            width: 30,
            height: 15,
            speed: 5,
            color: '#ff6d00',
            dx: 0
        };
        
        // Player bullet
        this.bullet = {
            width: 3,
            height: 10,
            speed: 7,
            color: '#fff',
            active: false,
            x: 0,
            y: 0
        };
        
        // Enemies
        this.enemyRows = 4;
        this.enemyCols = 8;
        this.enemies = [];
        this.enemyWidth = 30;
        this.enemyHeight = 20;
        this.enemyPadding = 10;
        this.enemyOffsetTop = 40;
        this.enemyOffsetLeft = 60;
        this.enemyDirection = 1;
        this.enemySpeed = 1;
        
        // Enemy bullets
        this.enemyBullets = [];
        this.maxEnemyBullets = 3;
        
        // Controls
        this.keys = {
            right: false,
            left: false,
            space: false
        };
        
        // Bind event handlers to maintain context
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        
        // Initialize game
        this.init();
    }
    
    init() {
        // Add event listeners
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        // Create enemies
        this.createEnemies();
        
        // Start game loop
        this.gameLoop();
    }
    
    removeEventListeners() {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    }
    
    keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            this.keys.right = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            this.keys.left = true;
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            this.keys.space = true;
            e.preventDefault(); // Prevent page scrolling
        }
    }
    
    keyUpHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            this.keys.right = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            this.keys.left = false;
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            this.keys.space = false;
        }
    }
    
    createEnemies() {
        this.enemies = [];
        for (let r = 0; r < this.enemyRows; r++) {
            this.enemies[r] = [];
            for (let c = 0; c < this.enemyCols; c++) {
                this.enemies[r][c] = {
                    x: c * (this.enemyWidth + this.enemyPadding) + this.enemyOffsetLeft,
                    y: r * (this.enemyHeight + this.enemyPadding) + this.enemyOffsetTop,
                    width: this.enemyWidth,
                    height: this.enemyHeight,
                    alive: true,
                    color: r === 0 ? '#ff0000' : r === 1 ? '#00ff00' : '#0000ff'
                };
            }
        }
    }
    
    movePlayer() {
        this.player.dx = 0;
        
        // Move player left and right
        if (this.keys.right) {
            this.player.dx = this.player.speed;
        } else if (this.keys.left) {
            this.player.dx = -this.player.speed;
        }
        
        // Update player position
        this.player.x += this.player.dx;
        
        // Wall detection
        if (this.player.x < 0) {
            this.player.x = 0;
        } else if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        
        // Shoot bullet
        if (this.keys.space && !this.bullet.active) {
            this.bullet.active = true;
            this.bullet.x = this.player.x + this.player.width / 2 - this.bullet.width / 2;
            this.bullet.y = this.player.y - this.bullet.height;
        }
    }
    
    moveBullet() {
        if (this.bullet.active) {
            this.bullet.y -= this.bullet.speed;
            
            // Check if bullet leaves screen
            if (this.bullet.y < 0) {
                this.bullet.active = false;
            }
            
            // Check collision with enemies
            for (let r = 0; r < this.enemyRows; r++) {
                for (let c = 0; c < this.enemyCols; c++) {
                    const enemy = this.enemies[r][c];
                    if (enemy.alive && 
                        this.bullet.x < enemy.x + enemy.width &&
                        this.bullet.x + this.bullet.width > enemy.x &&
                        this.bullet.y < enemy.y + enemy.height &&
                        this.bullet.y + this.bullet.height > enemy.y) {
                        // Collision detected
                        enemy.alive = false;
                        this.bullet.active = false;
                        this.score += (this.enemyRows - r) * 10; // Higher rows worth more
                        this.scoreElement.textContent = this.score;
                        
                        // Check if all enemies are destroyed
                        if (this.checkLevelComplete()) {
                            this.level++;
                            this.enemySpeed += 0.5;
                            this.createEnemies();
                        }
                    }
                }
            }
        }
    }
    
    moveEnemies() {
        let moveDown = false;
        
        // Check if any enemy has reached the edge
        for (let r = 0; r < this.enemyRows; r++) {
            for (let c = 0; c < this.enemyCols; c++) {
                const enemy = this.enemies[r][c];
                if (enemy.alive) {
                    if (enemy.x + enemy.width > this.canvas.width - 10) {
                        moveDown = true;
                        this.enemyDirection = -1;
                    } else if (enemy.x < 10) {
                        moveDown = true;
                        this.enemyDirection = 1;
                    }
                }
            }
        }
        
        // Move enemies
        for (let r = 0; r < this.enemyRows; r++) {
            for (let c = 0; c < this.enemyCols; c++) {
                const enemy = this.enemies[r][c];
                if (enemy.alive) {
                    if (moveDown) {
                        enemy.y += 20;
                    }
                    enemy.x += this.enemyDirection * this.enemySpeed;
                    
                    // Check if enemy has reached player level
                    if (enemy.y + enemy.height > this.player.y) {
                        this.gameOver();
                        return;
                    }
                    
                    // Random enemy shooting
                    if (Math.random() < 0.001 * this.level && this.enemyBullets.length < this.maxEnemyBullets) {
                        this.enemyBullets.push({
                            x: enemy.x + enemy.width / 2,
                            y: enemy.y + enemy.height,
                            width: 3,
                            height: 10,
                            speed: 3,
                            color: '#ff0000'
                        });
                    }
                }
            }
        }
    }
    
    moveEnemyBullets() {
        for (let i = 0; i < this.enemyBullets.length; i++) {
            const b = this.enemyBullets[i];
            b.y += b.speed;
            
            // Remove bullets that go off screen
            if (b.y > this.canvas.height) {
                this.enemyBullets.splice(i, 1);
                i--;
                continue;
            }
            
            // Check collision with player
            if (b.x < this.player.x + this.player.width &&
                b.x + b.width > this.player.x &&
                b.y < this.player.y + this.player.height &&
                b.y + b.height > this.player.y) {
                // Player hit
                this.lives--;
                this.enemyBullets.splice(i, 1);
                i--;
                
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    checkLevelComplete() {
        for (let r = 0; r < this.enemyRows; r++) {
            for (let c = 0; c < this.enemyCols; c++) {
                if (this.enemies[r][c].alive) {
                    return false;
                }
            }
        }
        return true;
    }
    
    gameOver() {
        this.running = false;
        
        // Display game over text
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '30px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '16px "Press Start 2P", monospace';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        // Remove event listeners
        this.removeEventListeners();
        
        // Option to restart
        setTimeout(() => {
            if (confirm('Game Over! Play again?')) {
                this.resetGame();
            } else {
                this.gameContainer.remove();
            }
        }, 1000);
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemySpeed = 1;
        this.running = true;
        this.bullet.active = false;
        this.enemyBullets = [];
        this.scoreElement.textContent = '0';
        this.createEnemies();
        
        // Re-add event listeners
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        // Restart game loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    drawPlayer() {
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player cannon
        this.ctx.fillRect(this.player.x + this.player.width / 2 - 2, this.player.y - 8, 4, 8);
    }
    
    drawBullet() {
        if (this.bullet.active) {
            this.ctx.fillStyle = this.bullet.color;
            this.ctx.fillRect(this.bullet.x, this.bullet.y, this.bullet.width, this.bullet.height);
        }
    }
    
    drawEnemies() {
        for (let r = 0; r < this.enemyRows; r++) {
            for (let c = 0; c < this.enemyCols; c++) {
                const enemy = this.enemies[r][c];
                if (enemy.alive) {
                    this.ctx.fillStyle = enemy.color;
                    this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                    
                    // Draw enemy features (eyes, etc)
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
                    this.ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 5, 5, 5);
                    
                    // Draw mouth based on row for variety
                    if (r % 2 === 0) {
                        this.ctx.fillRect(enemy.x + 10, enemy.y + 15, 10, 2);
                    } else {
                        this.ctx.beginPath();
                        this.ctx.arc(enemy.x + enemy.width/2, enemy.y + 15, 5, 0, Math.PI, false);
                        this.ctx.fill();
                    }
                }
            }
        }
    }
    
    drawEnemyBullets() {
        this.ctx.fillStyle = '#ff0000';
        for (let i = 0; i < this.enemyBullets.length; i++) {
            const b = this.enemyBullets[i];
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        }
    }
    
    drawLives() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 20);
    }
    
    drawLevel() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Level: ${this.level}`, 10, 40);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game elements
        this.drawPlayer();
        this.drawBullet();
        this.drawEnemies();
        this.drawEnemyBullets();
        this.drawLives();
        this.drawLevel();
        
        // Draw stars in background
        this.drawStars();
    }
    
    drawStars() {
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            // Use hash function to ensure stars are always in the same place
            const x = (Math.sin(i * 3547.53) * 0.5 + 0.5) * this.canvas.width;
            const y = (Math.cos(i * 8677.37) * 0.5 + 0.5) * this.canvas.height;
            
            // Twinkle effect
            const size = (Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5) * 2 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    gameLoop() {
        if (!this.running) return;
        
        this.movePlayer();
        this.moveBullet();
        this.moveEnemies();
        this.moveEnemyBullets();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Function to start the game
function startSpaceInvaders() {
    new SpaceInvadersGame();
}