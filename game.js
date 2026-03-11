/**
 * Zombie Art Studio - Core Logic
 */

const Game = {
    coins: 200,
    targetCoins: 1000,
    timeLeft: 150, // 2:30 minutos iniciais para a primeira tarefa
    drawTime: 120, // 2 minutos para desenhar
    isDrawing: false,
    currentTool: 'pencil',
    brushColor: '#000000',
    brushSize: 5,

    // Imagens de Referência
    references: [
        { name: 'Montanha', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80' },
        { name: 'Girassol', url: 'https://images.unsplash.com/photo-1597424216785-447475760331?auto=format&fit=crop&w=300&q=80' },
        { name: 'Gato', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80' }
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
        this.startMainTimer();
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

        const startPosition = (e) => {
            painting = true;
            draw(e);
        };

        const finishedPosition = () => {
            painting = false;
            ctx.beginPath();
        };

        const draw = (e) => {
            if (!painting) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.lineWidth = this.brushSize;
            ctx.lineCap = 'round';

            if (this.currentTool === 'eraser') {
                ctx.strokeStyle = '#ffffff';
            } else {
                ctx.strokeStyle = this.brushColor;
            }

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', finishedPosition);
        canvas.addEventListener('mousemove', draw);

        this.canvas = canvas;
        this.ctx = ctx;
    },

    bindEvents() {
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
        setInterval(() => {
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
        alert("O chefe chegou e você não entregou a arte! Descontado 30 moedas e nova tarefa atribuída.");
        this.loadNewReference();
        this.updateUI();
    },

    deliverArt() {
        const score = this.calculateSimilarity();

        if (score > 0.45) { // Limiar de aceitação
            this.coins += 200;
            alert(`O chefe adorou seu estilo cartunesco! Ganhou 200 moedas!`);
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

        // Simulação de análise de composição: verifica se há desenho em áreas chave
        for (let i = 0; i < playerData.length; i += 4) {
            // Se o pixel não é transparente e não é branco puro
            if (playerData[i + 3] > 0 && (playerData[i] < 250 || playerData[i + 1] < 250 || playerData[i + 2] < 250)) {
                coloredPixels++;
            }
        }

        const coverage = coloredPixels / (this.canvas.width * this.canvas.height);

        // Lógica: se o jogador desenhou entre 5% e 40% do canvas, consideramos um "esforço cartunesco" válido
        // Isso evita ganhar moedas sem desenhar nada ou apenas pintando tudo de uma cor.
        if (coverage > 0.05 && coverage < 0.6) {
            return 0.5 + Math.random() * 0.3; // Score alto
        }
        return coverage * 0.5; // Score baixo
    }
};

window.onload = () => Game.init();
