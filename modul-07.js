/**
 * MODUL-07: CYBER-COMMANDER Engine
 * Dual-plane IDE Game Logic
 */

console.log("MODUL-07 Engine loaded successfully.");

let canvas = document.getElementById('gameCanvas');
let ctx = canvas ? canvas.getContext('2d') : null;
let miniCanvas = document.getElementById('miniMapCanvas');
let miniCtx = miniCanvas ? miniCanvas.getContext('2d') : null;

function ensureElements() {
    if (!canvas) {
        canvas = document.getElementById('gameCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!miniCanvas) {
        miniCanvas = document.getElementById('miniMapCanvas');
        if (miniCanvas) miniCtx = miniCanvas.getContext('2d');
    }
}

// Responsive Canvas
function resizeCanvas() {
    ensureElements();
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Audio Synthesizer
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'plasma') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
            gain.gain.setValueAtTime(0.16, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'explosion') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.linearRampToValueAtTime(25, now + 0.4);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'crate') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.18);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
        }
    } catch (e) {}
}

// Game State Variables
let gameState = 'START';
let score = 145900;
let wave = 12;
let maxWave = 20;
let lives = 3;
let ammo = 850;
const maxAmmo = 900;
let overheat = 0;
let isOverheated = false;
let highScore = localStorage.getItem('cybercommander_score') || 145900;
const highScoreEl = document.getElementById('highScoreText');
if (highScoreEl) {
    highScoreEl.innerText = 'RECORD SCORE: ' + Number(highScore).toLocaleString();
}

// Inputs
const keys = {};
const mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space' && gameState === 'PLAYING') {
        e.preventDefault();
        switchWeapon();
    }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mousedown', () => { mouse.down = true; });
window.addEventListener('mouseup', () => { mouse.down = false; });

// Weapons
const weapons = [
    { name: 'Twin Plasma Cannon', cooldown: 6, heatRate: 2.2, ammoCost: 2 },
    { name: 'Beam Laser Cascade', cooldown: 4, heatRate: 3.5, ammoCost: 1 },
    { name: 'Quantum Tri-Burst', cooldown: 9, heatRate: 4.5, ammoCost: 3 },
];
let currentWeaponIndex = 0;

function switchWeapon() {
    currentWeaponIndex = (currentWeaponIndex + 1) % weapons.length;
    const el = document.getElementById('weaponName');
    if (el) el.innerText = weapons[currentWeaponIndex].name;
    playSound('crate');
}

// Player Ship Class
class PlayerShip {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.length = 28;
        this.width = 22;
        this.speed = 6.2;
        this.health = 100;
        this.maxHealth = 100;
        this.shootCooldown = 0;
    }

    update() {
        let dx = 0;
        let dy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        this.x = Math.max(16, Math.min(canvas.width - 16, this.x));
        this.y = Math.max(16, Math.min(canvas.height - 16, this.y));

        if (overheat > 0) {
            overheat = Math.max(0, overheat - 0.75);
            if (isOverheated && overheat < 30) {
                isOverheated = false;
            }
        }

        if (ammo < maxAmmo && Math.random() < 0.2) {
            ammo++;
        }

        // Thruster sparks
        const facing = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        const backX = this.x - Math.cos(facing) * (this.length * 0.45);
        const backY = this.y - Math.sin(facing) * (this.length * 0.45);

        for (let i = 0; i < 2; i++) {
            const offsetAngle = facing + (Math.PI / 2) * (i === 0 ? 1 : -1);
            const engineX = backX + Math.cos(offsetAngle) * 5.5;
            const engineY = backY + Math.sin(offsetAngle) * 5.5;

            particles.push(new SparkParticle(
                engineX, engineY,
                -Math.cos(facing) * (Math.random() * 3.5 + 3.5) + (Math.random() - 0.5) * 1.5,
                -Math.sin(facing) * (Math.random() * 3.5 + 3.5) + (Math.random() - 0.5) * 1.5,
                '#00f3ff', 2.2, 0.12
            ));
        }

        // Shooting
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (mouse.down && this.shootCooldown <= 0 && !isOverheated && ammo > 0) {
            this.fireWeapons(facing);
            const w = weapons[currentWeaponIndex];
            this.shootCooldown = w.cooldown;
            overheat += w.heatRate;
            ammo = Math.max(0, ammo - w.ammoCost);

            if (overheat >= 100) {
                overheat = 100;
                isOverheated = true;
            }
        }
    }

    fireWeapons(facing) {
        playSound('plasma');
        const perpX = Math.cos(facing + Math.PI / 2);
        const perpY = Math.sin(facing + Math.PI / 2);

        if (currentWeaponIndex === 0) {
            bullets.push(new LaserBolt(this.x + perpX * 7.5, this.y + perpY * 7.5, facing, '#ff00aa', '#00f3ff'));
            bullets.push(new LaserBolt(this.x - perpX * 7.5, this.y - perpY * 7.5, facing, '#00f3ff', '#ff00aa'));

            for (let k = 0; k < 4; k++) {
                particles.push(new SparkParticle(this.x + perpX * 7.5, this.y + perpY * 7.5, Math.cos(facing + (Math.random()-0.5)*0.5)*7, Math.sin(facing + (Math.random()-0.5)*0.5)*7, '#00f3ff', 2, 0.2));
                particles.push(new SparkParticle(this.x - perpX * 7.5, this.y - perpY * 7.5, Math.cos(facing + (Math.random()-0.5)*0.5)*7, Math.sin(facing + (Math.random()-0.5)*0.5)*7, '#ff00aa', 2, 0.2));
            }
        } else if (currentWeaponIndex === 1) {
            bullets.push(new LaserBolt(this.x, this.y, facing, '#00f3ff', '#ffffff', 24));
        } else {
            bullets.push(new LaserBolt(this.x, this.y, facing, '#ff00aa', '#00f3ff'));
            bullets.push(new LaserBolt(this.x + perpX * 7, this.y + perpY * 7, facing - 0.12, '#00f3ff', '#ffffff'));
            bullets.push(new LaserBolt(this.x - perpX * 7, this.y - perpY * 7, facing + 0.12, '#00f3ff', '#ffffff'));
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        const facing = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        ctx.rotate(facing + Math.PI / 2);

        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00f3ff';

        ctx.beginPath();
        ctx.moveTo(-this.width / 2, this.length * 0.25);
        ctx.lineTo(-this.width * 0.25, -this.length * 0.1);
        ctx.lineTo(this.width * 0.25, -this.length * 0.1);
        ctx.lineTo(this.width / 2, this.length * 0.25);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.7)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -this.length * 0.55);
        ctx.lineTo(this.width * 0.22, -this.length * 0.2);
        ctx.lineTo(this.width * 0.48, this.length * 0.25);
        ctx.lineTo(this.width * 0.32, this.length * 0.45);
        ctx.lineTo(this.width * 0.16, this.length * 0.35);
        ctx.lineTo(0, this.length * 0.28);
        ctx.lineTo(-this.width * 0.16, this.length * 0.35);
        ctx.lineTo(-this.width * 0.32, this.length * 0.45);
        ctx.lineTo(-this.width * 0.48, this.length * 0.25);
        ctx.lineTo(-this.width * 0.22, -this.length * 0.2);
        ctx.closePath();

        ctx.fillStyle = '#060b14';
        ctx.fill();
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -this.length * 0.38);
        ctx.lineTo(this.width * 0.1, -this.length * 0.08);
        ctx.lineTo(0, this.length * 0.05);
        ctx.lineTo(-this.width * 0.1, -this.length * 0.08);
        ctx.closePath();
        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.width * 0.28, this.length * 0.35, 4, 3);
        ctx.fillRect(this.width * 0.28 - 4, this.length * 0.35, 4, 3);

        ctx.restore();
    }
}

// Projectile
class LaserBolt {
    constructor(x, y, angle, outerColor, innerColor, speed = 22) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.length = 20;
        this.width = 2.5;
        this.outerColor = outerColor;
        this.innerColor = innerColor;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (Math.random() < 0.3) {
            particles.push(new SparkParticle(
                this.x, this.y,
                -this.dx * 0.08 + (Math.random() - 0.5),
                -this.dy * 0.08 + (Math.random() - 0.5),
                this.outerColor, 1.4, 0.15
            ));
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.outerColor;
        ctx.beginPath();
        ctx.moveTo(-this.length, 0);
        ctx.lineTo(0, 0);
        ctx.strokeStyle = this.outerColor;
        ctx.lineWidth = this.width + 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-this.length * 0.85, 0);
        ctx.lineTo(0, 0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.width;
        ctx.stroke();

        ctx.restore();
    }
}

// Enemy Drone
class CyberDrone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 11;
        this.speed = 2.1 + Math.random() * 0.8;
        this.health = 35;
        this.maxHealth = 35;
        this.rotorSpin = 0;
    }

    update(targetX, targetY) {
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
        this.rotorSpin += 0.35;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.strokeStyle = 'rgba(255, 30, 80, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-11, -11); ctx.lineTo(11, 11);
        ctx.moveTo(11, -11); ctx.lineTo(-11, 11);
        ctx.stroke();

        const pods = [
            [-11, -11], [11, -11],
            [-11, 11], [11, 11]
        ];
        pods.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = '#ff1e50';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff1e50';
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#100508';
        ctx.fill();
        ctx.strokeStyle = '#ff1e50';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff0033';
        ctx.fill();

        ctx.restore();
    }
}

// Cyber Crate
class CyberCrate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 18;
        this.health = 30;
        this.rotation = Math.random() * Math.PI;
        this.pulse = Math.random() * 5;
    }

    update() {
        this.pulse += 0.04;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + Math.sin(this.pulse) * 0.05);

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff8800';

        ctx.fillStyle = '#180a02';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.beginPath();
        ctx.moveTo(-this.size / 2, 0); ctx.lineTo(this.size / 2, 0);
        ctx.moveTo(0, -this.size / 2); ctx.lineTo(0, this.size / 2);
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffbb00';
        ctx.fillRect(-3, -3, 6, 6);

        ctx.restore();
    }
}

// Particle
class SparkParticle {
    constructor(x, y, dx, dy, color, radius, decay = 0.035) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.radius = radius;
        this.alpha = 1;
        this.decay = decay;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dx *= 0.94;
        this.dy *= 0.94;
        this.alpha -= this.decay;
    }

    draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

let player = null;
let bullets = [];
let enemies = [];
let crates = [];
let particles = [];
let spawnTimer = 0;

function createReferenceExplosion(x, y, color = '#ff00aa', count = 22) {
    playSound('explosion');
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 1.5;
        const chosenColor = Math.random() < 0.4 ? '#ffffff' : (Math.random() < 0.5 ? '#ff00aa' : '#00f3ff');
        particles.push(new SparkParticle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            chosenColor,
            Math.random() * 2.5 + 1,
            Math.random() * 0.03 + 0.025
        ));
    }
}

function startGame() {
    console.log("MODUL-07 Mission Initialized.");
    initAudio();
    player = new PlayerShip();
    bullets = [];
    enemies = [];
    crates = [];
    particles = [];
    score = 145900;
    wave = 12;
    lives = 3;
    ammo = 850;
    overheat = 0;
    isOverheated = false;

    for (let i = 0; i < 9; i++) {
        crates.push(new CyberCrate(
            Math.random() * (canvas.width - 150) + 75,
            Math.random() * (canvas.height - 150) + 75
        ));
    }

    for (let i = 0; i < 8; i++) {
        const ex = Math.random() < 0.5 ? -30 : canvas.width + 30;
        const ey = Math.random() * canvas.height;
        enemies.push(new CyberDrone(ex, ey));
    }

    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.classList.add('hidden');
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    const hud = document.getElementById('hud');
    if (hud) hud.classList.remove('hidden');
    gameState = 'PLAYING';
}

function bindControlListeners() {
    ensureElements();
    const startBtn = document.getElementById('startBtn');
    if (startBtn && !startBtn.dataset.bound) {
        startBtn.dataset.bound = 'true';
        startBtn.addEventListener('click', startGame);
    }
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn && !restartBtn.dataset.bound) {
        restartBtn.dataset.bound = 'true';
        restartBtn.addEventListener('click', startGame);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bindControlListeners();
        resizeCanvas();
    });
} else {
    bindControlListeners();
}

if (new URLSearchParams(window.location.search).get('autostart') === '1') {
    startGame();
}

function drawTechFloor() {
    const tileSize = 70;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
    for (let x = 0; x < canvas.width; x += tileSize * 2) {
        for (let y = 0; y < canvas.height; y += tileSize * 2) {
            ctx.fillRect(x - 1, y - 1, 2, 2);
        }
    }
    ctx.restore();
}

function updateMiniMap() {
    if (!miniCtx || !player) return;
    miniCtx.clearRect(0, 0, 70, 70);

    miniCtx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
    miniCtx.lineWidth = 1;
    miniCtx.beginPath();
    miniCtx.arc(35, 35, 32, 0, Math.PI * 2);
    miniCtx.stroke();
    miniCtx.beginPath();
    miniCtx.arc(35, 35, 18, 0, Math.PI * 2);
    miniCtx.stroke();

    const scaleX = 58 / canvas.width;
    const scaleY = 58 / canvas.height;

    crates.forEach(c => {
        miniCtx.fillStyle = '#ff8800';
        miniCtx.fillRect(6 + c.x * scaleX - 1, 6 + c.y * scaleY - 1, 2, 2);
    });

    enemies.forEach(e => {
        miniCtx.fillStyle = '#ff0055';
        miniCtx.beginPath();
        miniCtx.arc(6 + e.x * scaleX, 6 + e.y * scaleY, 1.8, 0, Math.PI * 2);
        miniCtx.fill();
    });

    miniCtx.fillStyle = '#00f3ff';
    miniCtx.shadowBlur = 5;
    miniCtx.shadowColor = '#00f3ff';
    miniCtx.beginPath();
    miniCtx.arc(6 + player.x * scaleX, 6 + player.y * scaleY, 2.8, 0, Math.PI * 2);
    miniCtx.fill();
}

function updateHudDisplay() {
    if (!player) return;

    const totalSegs = 10;
    const filledSegs = Math.max(0, Math.round((player.health / player.maxHealth) * totalSegs));
    const healthStr = '[' + '='.repeat(filledSegs) + '-'.repeat(totalSegs - filledSegs) + ']';
    
    const hSegs = document.getElementById('healthSegments');
    if (hSegs) hSegs.innerText = healthStr;
    const hPct = document.getElementById('healthPercent');
    if (hPct) hPct.innerText = Math.round(player.health) + '%';
    const hFill = document.getElementById('healthFill');
    if (hFill) hFill.style.width = Math.max(0, player.health) + '%';

    const ammoDisp = document.getElementById('ammoDisplay');
    if (ammoDisp) ammoDisp.innerText = ammo + '/' + maxAmmo;
    const scoreDisp = document.getElementById('scoreDisplay');
    if (scoreDisp) scoreDisp.innerText = Number(score).toLocaleString();
    const waveDisp = document.getElementById('waveDisplay');
    if (waveDisp) waveDisp.innerText = String(wave).padStart(2, '0') + '/' + maxWave;
    const livesDisp = document.getElementById('livesDisplay');
    if (livesDisp) livesDisp.innerText = String(lives).padStart(2, '0');

    const heatSegs = Math.min(10, Math.round((overheat / 100) * totalSegs));
    const heatStr = '[' + '='.repeat(heatSegs) + '-'.repeat(totalSegs - heatSegs) + ']';
    const oSegs = document.getElementById('overheatSegments');
    if (oSegs) oSegs.innerText = heatStr;
    const oPct = document.getElementById('overheatPercent');
    if (oPct) oPct.innerText = Math.round(overheat) + '%';
    const oFill = document.getElementById('overheatFill');
    if (oFill) oFill.style.width = overheat + '%';
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTechFloor();

    if (gameState === 'PLAYING') {
        spawnTimer++;
        if (spawnTimer > 70 && enemies.length < 16) {
            spawnTimer = 0;
            const side = Math.floor(Math.random() * 4);
            let sx, sy;
            if (side === 0) { sx = Math.random() * canvas.width; sy = -30; }
            else if (side === 1) { sx = canvas.width + 30; sy = Math.random() * canvas.height; }
            else if (side === 2) { sx = Math.random() * canvas.width; sy = canvas.height + 30; }
            else { sx = -30; sy = Math.random() * canvas.height; }

            enemies.push(new CyberDrone(sx, sy));

            if (crates.length < 10 && Math.random() < 0.3) {
                crates.push(new CyberCrate(
                    Math.random() * (canvas.width - 150) + 75,
                    Math.random() * (canvas.height - 150) + 75
                ));
            }
        }

        for (let i = crates.length - 1; i >= 0; i--) {
            crates[i].update();
            crates[i].draw();
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.update();
            b.draw();

            for (let c = crates.length - 1; c >= 0; c--) {
                let crate = crates[c];
                const dist = Math.hypot(b.x - crate.x, b.y - crate.y);
                if (dist < crate.size * 0.8) {
                    crate.health -= 15;
                    bullets.splice(i, 1);
                    createReferenceExplosion(crate.x, crate.y, '#ff8800', 12);

                    if (crate.health <= 0) {
                        createReferenceExplosion(crate.x, crate.y, '#ffbb00', 25);
                        crates.splice(c, 1);
                        score += 500;
                        ammo = Math.min(maxAmmo, ammo + 100);
                    }
                    break;
                }
            }

            if (bullets[i]) {
                for (let e = enemies.length - 1; e >= 0; e--) {
                    let enemy = enemies[e];
                    const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
                    if (dist < enemy.radius + 5) {
                        enemy.health -= 20;
                        bullets.splice(i, 1);
                        createReferenceExplosion(b.x, b.y, '#ff00aa', 8);

                        if (enemy.health <= 0) {
                            createReferenceExplosion(enemy.x, enemy.y, '#ff00aa', 28);
                            enemies.splice(e, 1);
                            score += 250;
                            ammo = Math.min(maxAmmo, ammo + 30);
                        }
                        break;
                    }
                }
            }

            if (bullets[i] && (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height)) {
                bullets.splice(i, 1);
            }
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            let enemy = enemies[i];
            enemy.update(player.x, player.y);
            enemy.draw();

            const pDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (pDist < player.width * 0.45 + enemy.radius) {
                playSound('hit');
                createReferenceExplosion(enemy.x, enemy.y, '#ff1e50', 20);
                enemies.splice(i, 1);
                player.health -= 15;

                if (player.health <= 0) {
                    lives--;
                    if (lives <= 0) {
                        gameState = 'GAMEOVER';
                        const hud = document.getElementById('hud');
                        if (hud) hud.classList.add('hidden');
                        const fScore = document.getElementById('finalScore');
                        if (fScore) fScore.innerText = Number(score).toLocaleString();

                        if (score > highScore) {
                            highScore = score;
                            localStorage.setItem('cybercommander_score', highScore);
                            const nhNotice = document.getElementById('newHighScoreNotice');
                            if (nhNotice) nhNotice.classList.remove('hidden');
                        }
                        const goScreen = document.getElementById('gameOverScreen');
                        if (goScreen) goScreen.classList.remove('hidden');
                    } else {
                        player.health = player.maxHealth;
                        player.x = canvas.width / 2;
                        player.y = canvas.height / 2;
                    }
                }
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        player.update();
        player.draw();

        updateHudDisplay();
        updateMiniMap();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
