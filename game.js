/**
 * Zombie Art Studio - Core Logic
 */

const Game = {
    coins: 200,
    targetCoins: 1000,
    timeLeft: 150, // 2:30 minutos iniciais
    isDrawing: false,
    currentTool: 'pencil',
    brushColor: '#000000',
    brushSize: 5,
    gameStarted: false,

    // Imagens de Referência
    references: [
        { name: 'Montanhas', url: 'assets/ref_lake.png' },
        { name: 'Girassóis', url: 'https://images.unsplash.com/photo-1597424216785-447475760331?auto=format&fit=crop&w=600&q=80' },
        { name: 'Gatinho', url: 'assets/ref_zombie.png' },
        { name: 'Floresta', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80' },
        { name: 'Deserto', url: 'assets/ref_desert.png' }
    ],
    currentRefIndex: 0,

    // Elements
    scenes: {
        factory: document.getElementById('scene-factory'),
        workspace: document.getElementById('scene-workspace')
    },
    ui: {
        coinCount: document.getElementById('coin-count'),
        timer: document.getElementById('time-left'),
        victory: document.getElementById('victory-screen')
    },

    init() {
        this.setupCanvas();
        this.bindEvents();
        this.updateUI();
        this.loadNewReference();
    },

    loadNewReference() {
        this.currentRefIndex = Math.floor(Math.random() * this.references.length);
        const ref = this.references[this.currentRefIndex];
        const container = document.getElementById('reference-image-container');
        container.innerHTML = `<img src="${ref.url}" id="ref-img" style="max-width: 100%; max-height: 100%; image-rendering: auto; border: 4px solid #4a4e69;">`;
    },

    updateUI() {
        this.ui.coinCount.innerText = this.coins;
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.ui.timer.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (this.coins >= this.targetCoins) {
            this.ui.victory.classList.remove('hidden');
            this.gameStarted = false;
        }
    },

    switchScene(sceneId) {
        Object.values(this.scenes).forEach(s => s.classList.add('hidden'));
        this.scenes[sceneId].classList.remove('hidden');
    },

    setupCanvas() {
        const canvas = document.getElementById('art-canvas');
        const ctx = canvas.getContext('2d');
        let painting = false;

        const getCoordinates = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        const startPosition = (e) => {
            if (!this.gameStarted) return;
            const pos = getCoordinates(e);

            if (this.currentTool === 'fill') {
                this.floodFill(Math.round(pos.x), Math.round(pos.y));
                return;
            }

            painting = true;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            draw(e);
        };

        const finishedPosition = () => {
            painting = false;
            ctx.beginPath();
        };

        const draw = (e) => {
            if (!painting) return;
            const pos = getCoordinates(e);

            ctx.lineWidth = this.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.strokeStyle = (this.currentTool === 'eraser') ? '#ffffff' : this.brushColor;

            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', finishedPosition);
        canvas.addEventListener('mousemove', draw);

        this.canvas = canvas;
        this.ctx = ctx;
    },

    floodFill(startX, startY) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;

        const startPos = (startY * this.canvas.width + startX) * 4;
        const startR = pixels[startPos];
        const startG = pixels[startPos + 1];
        const startB = pixels[startPos + 2];
        const startA = pixels[startPos + 3];

        const fillRGB = this.hexToRgb(this.brushColor);

        // Don't fill if it's the same color
        if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b && startA === 255) return;

        const pixelStack = [[startX, startY]];

        while (pixelStack.length > 0) {
            const newPos = pixelStack.pop();
            const x = newPos[0];
            let y = newPos[1];

            let pixelPos = (y * this.canvas.width + x) * 4;

            // Go up as long as the color matches
            while (y >= 0 && this.matchStartColor(pixels, pixelPos, startR, startG, startB, startA)) {
                y--;
                pixelPos -= this.canvas.width * 4;
            }

            pixelPos += this.canvas.width * 4;
            y++;

            let reachLeft = false;
            let reachRight = false;

            // Go down as long as the color matches
            while (y < this.canvas.height && this.matchStartColor(pixels, pixelPos, startR, startG, startB, startA)) {
                this.colorPixel(pixels, pixelPos, fillRGB.r, fillRGB.g, fillRGB.b);

                if (x > 0) {
                    if (this.matchStartColor(pixels, pixelPos - 4, startR, startG, startB, startA)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (x < this.canvas.width - 1) {
                    if (this.matchStartColor(pixels, pixelPos + 4, startR, startG, startB, startA)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }

                y++;
                pixelPos += this.canvas.width * 4;
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    },

    matchStartColor(pixels, pos, startR, startG, startB, startA) {
        return pixels[pos] === startR && pixels[pos + 1] === startG && pixels[pos + 2] === startB && pixels[pos + 3] === startA;
    },

    colorPixel(pixels, pos, r, g, b) {
        pixels[pos] = r;
        pixels[pos + 1] = g;
        pixels[pos + 2] = b;
        pixels[pos + 3] = 255;
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },

    bindEvents() {
        // Iniciar Jogo
        document.getElementById('start-game-btn').addEventListener('click', () => {
            document.getElementById('intro-screen').classList.add('hidden');
            this.gameStarted = true;
            this.startMainTimer();
        });

        // Scene Transitions
        document.getElementById('player-desk').addEventListener('click', () => {
            this.switchScene('workspace');
        });

        document.getElementById('btn-back-factory').addEventListener('click', () => {
            this.switchScene('factory');
        });

        // Tools
        document.getElementById('tool-pencil').addEventListener('click', () => this.setTool('pencil'));
        document.getElementById('tool-marker').addEventListener('click', () => this.setTool('marker'));
        document.getElementById('tool-eraser').addEventListener('click', () => this.setTool('eraser'));
        document.getElementById('tool-fill').addEventListener('click', () => this.setTool('fill'));

        document.getElementById('color-picker').addEventListener('input', (e) => {
            this.brushColor = e.target.value;
        });

        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = e.target.value;
        });

        document.getElementById('btn-deliver').addEventListener('click', () => {
            this.deliverArt();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });
    },

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tool-${tool}`).classList.add('active');

        if (tool === 'pencil') this.brushSize = 2;
        if (tool === 'marker') this.brushSize = 10;
        document.getElementById('brush-size').value = this.brushSize;
    },

    startMainTimer() {
        const timerInterval = setInterval(() => {
            if (!this.gameStarted) {
                clearInterval(timerInterval);
                return;
            }
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateUI();
            } else {
                this.handleTimeOut();
            }
        }, 1000);
    },

    handleTimeOut() {
        this.coins -= 30; // Punição por não entregar a tempo
        if (this.coins < 0) this.coins = 0;
        this.timeLeft = 150; // Novo ciclo
        alert("O chefe chegou e você não terminou! Descontado 30 moedas. Nova referência entregue.");
        this.loadNewReference();
        this.updateUI();
    },

    deliverArt() {
        const score = this.calculateSimilarity();

        if (score > 0.4) {
            this.coins += 200;
            alert(`O chefe adorou seu estilo cartunesco! +200 moedas!`);
        } else {
            alert(`O chefe achou que a arte não lembra a referência. Nenhuma moeda ganha.`);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.timeLeft = 150;
        this.loadNewReference();
        this.switchScene('factory');
        this.updateUI();
    },

    calculateSimilarity() {
        const playerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        let coloredPixels = 0;

        for (let i = 0; i < playerData.length; i += 4) {
            if (playerData[i + 3] > 0 && (playerData[i] < 250 || playerData[i + 1] < 250 || playerData[i + 2] < 250)) {
                coloredPixels++;
            }
        }

        const coverage = coloredPixels / (this.canvas.width * this.canvas.height);

        if (coverage > 0.05 && coverage < 0.7) {
            return 0.5 + Math.random() * 0.3;
        }
        return coverage * 0.5;
    }
};

window.onload = () => Game.init();
