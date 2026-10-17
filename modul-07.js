/**
 * MODUL-07: CYBER-COMMANDER Engine & Dual-Plane IDE Controller
 * High-Fidelity Cyberpunk Combat Graphics + Split Screen Editor
 * 
 * Sisi Kiri : Editor Kode JavaScript (modul-07.js)
 * Sisi Kanan: Game Canvas CYBER-COMMANDER dengan Grafis Tingkat Tinggi
 */

// ========================================================
// 1. TERMINAL & LOGGING SUBSYSTEM
// ========================================================
const terminalLogs = document.getElementById('terminalLogs');

function addTerminalLog(type, message) {
    if (!terminalLogs) return;
    const now = new Date();
    const time = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;

    let prefix = 'LOG';
    if (type === 'error') prefix = 'ERR';
    if (type === 'warn') prefix = 'WRN';
    if (type === 'info') prefix = 'SYS';

    entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-prefix">${prefix}</span> <span class="log-msg">${escapeHtml(message)}</span>`;
    terminalLogs.appendChild(entry);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

function clearTerminal() {
    if (terminalLogs) {
        terminalLogs.innerHTML = '<div class="log-entry log-info"><span class="log-time">[00:00:00]</span> <span class="log-prefix">SYS</span> <span class="log-msg">Terminal dibersihkan. Siap menerima log baru.</span></div>';
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

document.getElementById('btnClearTerminal')?.addEventListener('click', clearTerminal);

// Intercept global console
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    addTerminalLog('log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};
console.warn = function(...args) {
    originalConsoleWarn.apply(console, args);
    addTerminalLog('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};
console.error = function(...args) {
    originalConsoleError.apply(console, args);
    addTerminalLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

addTerminalLog('info', 'CYBER-COMMANDER Engine v2.4 (Ultra HD Graphics) diinisialisasi.');

// ========================================================
// 2. CANVAS & WEB AUDIO INITIALIZATION (RETINA / HIGH-DPI SHARPNESS)
// ========================================================
let canvas = document.getElementById('gameCanvas');
let ctx = canvas ? canvas.getContext('2d') : null;
let miniCanvas = document.getElementById('miniMapCanvas');
let miniCtx = miniCanvas ? miniCanvas.getContext('2d') : null;

let gameWidth = 800;
let gameHeight = 600;

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

function resizeCanvas() {
    ensureElements();
    if (!canvas) return;
    const container = canvas.parentElement;
    const w = container && container.clientWidth > 0 ? container.clientWidth : window.innerWidth;
    const h = container && container.clientHeight > 0 ? container.clientHeight : window.innerHeight;

    gameWidth = Math.max(320, w);
    gameHeight = Math.max(240, h);

    // High-DPI scaling for ultra-crisp neon vector rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(gameWidth * dpr);
    canvas.height = Math.round(gameHeight * dpr);
    canvas.style.width = gameWidth + 'px';
    canvas.style.height = gameHeight + 'px';

    if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 30);

// Web Audio API Synthesizer
let audioCtx = null;
let isMuted = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx || isMuted) return;
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

// ========================================================
// 3. GAME STATE & INPUTS
// ========================================================
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

const keys = {};
const mouse = { x: 400, y: 300, down: false };

window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    keys[e.code] = true;
    if (e.code === 'Space' && gameState === 'PLAYING') {
        e.preventDefault();
        switchWeapon();
    }
});
window.addEventListener('keyup', e => {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    keys[e.code] = false;
});

if (canvas) {
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', e => {
        initAudio();
        if (e.button === 0) mouse.down = true;
    });
    window.addEventListener('mouseup', () => {
        mouse.down = false;
    });
}

// ========================================================
// 4. WEAPONS ARSENAL
// ========================================================
let weapons = [
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

// ========================================================
// 5. HIGH-FIDELITY GRAPHIC ENTITIES (ORIGINAL ULTRA DETAILED GRAPHICS)
// ========================================================

// Spark Particle with velocity damping and neon blur
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
        if (!ctx || this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// Laser Bolt with dual-layer neon outer aura + razor-sharp white beam core + spark tail
class LaserBolt {
    constructor(x, y, angle, outerColor, innerColor, speed = 22) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.length = 22;
        this.width = 2.6;
        this.outerColor = outerColor;
        this.innerColor = innerColor;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (Math.random() < 0.35) {
            particles.push(new SparkParticle(
                this.x, this.y,
                -this.dx * 0.08 + (Math.random() - 0.5),
                -this.dy * 0.08 + (Math.random() - 0.5),
                this.outerColor, 1.5, 0.15
            ));
        }
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Outer vibrant glow aura
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.outerColor;
        ctx.beginPath();
        ctx.moveTo(-this.length, 0);
        ctx.lineTo(0, 0);
        ctx.strokeStyle = this.outerColor;
        ctx.lineWidth = this.width + 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Inner pure white beam core
        ctx.beginPath();
        ctx.moveTo(-this.length * 0.85, 0);
        ctx.lineTo(0, 0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.width;
        ctx.stroke();

        ctx.restore();
    }
}

// Player Ship: Sleek interceptor fighter jet with swept wings, canopy, lights & twin thruster sparks
class PlayerShip {
    constructor() {
        this.x = gameWidth / 2;
        this.y = gameHeight / 2;
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

        this.x = Math.max(16, Math.min(gameWidth - 16, this.x));
        this.y = Math.max(16, Math.min(gameHeight - 16, this.y));

        if (overheat > 0) {
            overheat = Math.max(0, overheat - 0.75);
            if (isOverheated && overheat < 30) {
                isOverheated = false;
            }
        }

        if (ammo < maxAmmo && Math.random() < 0.2) {
            ammo++;
        }

        // Engine twin-thruster physical sparks
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
            // Twin Plasma Cannon
            bullets.push(new LaserBolt(this.x + perpX * 7.5, this.y + perpY * 7.5, facing, '#ff00aa', '#00f3ff'));
            bullets.push(new LaserBolt(this.x - perpX * 7.5, this.y - perpY * 7.5, facing, '#00f3ff', '#ff00aa'));

            for (let k = 0; k < 4; k++) {
                particles.push(new SparkParticle(this.x + perpX * 7.5, this.y + perpY * 7.5, Math.cos(facing + (Math.random()-0.5)*0.5)*7, Math.sin(facing + (Math.random()-0.5)*0.5)*7, '#00f3ff', 2, 0.2));
                particles.push(new SparkParticle(this.x - perpX * 7.5, this.y - perpY * 7.5, Math.cos(facing + (Math.random()-0.5)*0.5)*7, Math.sin(facing + (Math.random()-0.5)*0.5)*7, '#ff00aa', 2, 0.2));
            }
        } else if (currentWeaponIndex === 1) {
            // Beam Laser Cascade
            bullets.push(new LaserBolt(this.x, this.y, facing, '#00f3ff', '#ffffff', 26));
        } else {
            // Quantum Tri-Burst
            bullets.push(new LaserBolt(this.x, this.y, facing, '#ff00aa', '#00f3ff'));
            bullets.push(new LaserBolt(this.x + perpX * 7, this.y + perpY * 7, facing - 0.12, '#00f3ff', '#ffffff'));
            bullets.push(new LaserBolt(this.x - perpX * 7, this.y - perpY * 7, facing + 0.12, '#00f3ff', '#ffffff'));
        }
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        const facing = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        ctx.rotate(facing + Math.PI / 2);

        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00f3ff';

        // Outer wing accents
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, this.length * 0.25);
        ctx.lineTo(-this.width * 0.25, -this.length * 0.1);
        ctx.lineTo(this.width * 0.25, -this.length * 0.1);
        ctx.lineTo(this.width / 2, this.length * 0.25);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.7)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Main stealth fighter hull
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

        // Glowing cyan energy cockpit canopy
        ctx.beginPath();
        ctx.moveTo(0, -this.length * 0.38);
        ctx.lineTo(this.width * 0.1, -this.length * 0.08);
        ctx.lineTo(0, this.length * 0.05);
        ctx.lineTo(-this.width * 0.1, -this.length * 0.08);
        ctx.closePath();
        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00f3ff';
        ctx.fill();

        // Wingtip navigation running lights
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffffff';
        ctx.fillRect(-this.width * 0.28, this.length * 0.35, 4, 3);
        ctx.fillRect(this.width * 0.28 - 4, this.length * 0.35, 4, 3);

        ctx.restore();
    }
}

// Enemy Cyber Drone: Quad-rotor combat drone with 4 glowing red rotor pods and scanning target eye
class CyberDrone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
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
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        // Angled rotor struts
        ctx.strokeStyle = 'rgba(255, 30, 80, 0.6)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-11, -11); ctx.lineTo(11, 11);
        ctx.moveTo(11, -11); ctx.lineTo(-11, 11);
        ctx.stroke();

        // 4 Glowing Rotor Pod Orbs
        const pods = [
            [-11, -11], [11, -11],
            [-11, 11], [11, 11]
        ];
        pods.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, 3.4, 0, Math.PI * 2);
            ctx.fillStyle = '#ff1e50';
            ctx.shadowBlur = 9;
            ctx.shadowColor = '#ff1e50';
            ctx.fill();
        });

        // Armored Center Spherical Pod
        ctx.beginPath();
        ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = '#100508';
        ctx.fill();
        ctx.strokeStyle = '#ff1e50';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glowing Target Eye with White Pupil
        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0033';
        ctx.fill();

        ctx.restore();
    }
}

// Cyber Supply Crate: Amber holographic tech cube with glowing braces & central energy crystal
class CyberCrate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.health = 30;
        this.rotation = Math.random() * Math.PI;
        this.pulse = Math.random() * 5;
    }

    update() {
        this.pulse += 0.04;
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + Math.sin(this.pulse) * 0.06);

        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff8800';

        ctx.fillStyle = '#180a02';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.beginPath();
        ctx.moveTo(-this.size / 2, 0); ctx.lineTo(this.size / 2, 0);
        ctx.moveTo(0, -this.size / 2); ctx.lineTo(0, this.size / 2);
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Central pulsating energy crystal
        const s = 6 + Math.sin(this.pulse * 2) * 1.5;
        ctx.fillStyle = '#ffbb00';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffbb00';
        ctx.fillRect(-s / 2, -s / 2, s, s);

        ctx.restore();
    }
}

// Explosions: High-energy particle bursts with multi-color palette
function createReferenceExplosion(x, y, color = '#ff00aa', count = 26) {
    playSound('explosion');
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6.5 + 1.5;
        const chosenColor = Math.random() < 0.35 ? '#ffffff' : (Math.random() < 0.5 ? '#ff00aa' : (Math.random() < 0.5 ? '#00f3ff' : '#ffbb00'));
        particles.push(new SparkParticle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            chosenColor,
            Math.random() * 2.8 + 1,
            Math.random() * 0.03 + 0.02
        ));
    }
}

// Background Twinkling Stars
const stars = [];
for (let i = 0; i < 110; i++) {
    stars.push({
        x: Math.random() * 2400,
        y: Math.random() * 1800,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() < 0.25 ? '#00f3ff' : (Math.random() < 0.4 ? '#ff00aa' : '#ffffff')
    });
}

function drawTechFloor() {
    if (!ctx) return;
    const tileSize = 64;
    ctx.save();

    // Twinkling starfield
    for (let s of stars) {
        s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.01;
        const a = Math.max(0.18, Math.min(0.85, s.alpha));
        ctx.fillStyle = s.color;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(s.x % gameWidth, s.y % gameHeight, s.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Cybernetic coordinate grid
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.07)';
    ctx.lineWidth = 1;

    for (let x = 0; x < gameWidth; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, gameHeight);
        ctx.stroke();
    }
    for (let y = 0; y < gameHeight; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(gameWidth, y);
        ctx.stroke();
    }

    // Coordinate junction dots
    ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
    for (let x = 0; x < gameWidth; x += tileSize * 2) {
        for (let y = 0; y < gameHeight; y += tileSize * 2) {
            ctx.fillRect(x - 1, y - 1, 2, 2);
        }
    }
    ctx.restore();
}

// Tactical Circular Radar Minimap
function updateMiniMap() {
    if (!miniCtx || !player || !canvas) return;
    miniCtx.clearRect(0, 0, 70, 70);

    miniCtx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    miniCtx.lineWidth = 1;
    miniCtx.beginPath();
    miniCtx.arc(35, 35, 32, 0, Math.PI * 2);
    miniCtx.stroke();
    miniCtx.beginPath();
    miniCtx.arc(35, 35, 18, 0, Math.PI * 2);
    miniCtx.stroke();

    const scaleX = 58 / Math.max(1, gameWidth);
    const scaleY = 58 / Math.max(1, gameHeight);

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
    miniCtx.shadowBlur = 6;
    miniCtx.shadowColor = '#00f3ff';
    miniCtx.beginPath();
    miniCtx.arc(6 + player.x * scaleX, 6 + player.y * scaleY, 2.8, 0, Math.PI * 2);
    miniCtx.fill();
}

// Game Collections
let player = null;
let bullets = [];
let enemies = [];
let crates = [];
let particles = [];
let spawnTimer = 0;

function startGame() {
    console.log("MODUL-07 Mission Initialized (Ultra HD Graphics).");
    initAudio();
    ensureElements();
    resizeCanvas();

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
            Math.random() * (gameWidth - 150) + 75,
            Math.random() * (gameHeight - 150) + 75
        ));
    }

    for (let i = 0; i < 8; i++) {
        const ex = Math.random() < 0.5 ? -30 : gameWidth + 30;
        const ey = Math.random() * gameHeight;
        enemies.push(new CyberDrone(ex, ey));
    }

    document.getElementById('startScreen')?.classList.add('hidden');
    document.getElementById('gameOverScreen')?.classList.add('hidden');
    document.getElementById('hud')?.classList.remove('hidden');
    gameState = 'PLAYING';
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
    if (!ctx || !canvas) {
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, gameWidth, gameHeight);
    drawTechFloor();

    if (gameState === 'PLAYING' && player) {
        spawnTimer++;
        if (spawnTimer > 70 && enemies.length < 16) {
            spawnTimer = 0;
            const side = Math.floor(Math.random() * 4);
            let sx, sy;
            if (side === 0) { sx = Math.random() * gameWidth; sy = -30; }
            else if (side === 1) { sx = gameWidth + 30; sy = Math.random() * gameHeight; }
            else if (side === 2) { sx = Math.random() * gameWidth; sy = gameHeight + 30; }
            else { sx = -30; sy = Math.random() * gameHeight; }

            enemies.push(new CyberDrone(sx, sy));

            if (crates.length < 10 && Math.random() < 0.3) {
                crates.push(new CyberCrate(
                    Math.random() * (gameWidth - 150) + 75,
                    Math.random() * (gameHeight - 150) + 75
                ));
            }
        }

        // Crates
        for (let i = crates.length - 1; i >= 0; i--) {
            crates[i].update();
            crates[i].draw();
        }

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.update();
            b.draw();

            // Hit crates
            for (let c = crates.length - 1; c >= 0; c--) {
                let crate = crates[c];
                const dist = Math.hypot(b.x - crate.x, b.y - crate.y);
                if (dist < crate.size * 0.8) {
                    crate.health -= 15;
                    bullets.splice(i, 1);
                    createReferenceExplosion(crate.x, crate.y, '#ff8800', 14);

                    if (crate.health <= 0) {
                        createReferenceExplosion(crate.x, crate.y, '#ffbb00', 28);
                        crates.splice(c, 1);
                        score += 500;
                        ammo = Math.min(maxAmmo, ammo + 100);
                    }
                    break;
                }
            }

            // Hit enemies
            if (bullets[i]) {
                for (let e = enemies.length - 1; e >= 0; e--) {
                    let enemy = enemies[e];
                    const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
                    if (dist < enemy.radius + 5) {
                        enemy.health -= 20;
                        bullets.splice(i, 1);
                        createReferenceExplosion(b.x, b.y, '#ff00aa', 10);

                        if (enemy.health <= 0) {
                            createReferenceExplosion(enemy.x, enemy.y, '#ff00aa', 30);
                            enemies.splice(e, 1);
                            score += 250;
                            ammo = Math.min(maxAmmo, ammo + 30);
                        }
                        break;
                    }
                }
            }

            // Boundary removal
            if (bullets[i] && (b.x < -40 || b.x > gameWidth + 40 || b.y < -40 || b.y > gameHeight + 40)) {
                bullets.splice(i, 1);
            }
        }

        // Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            let enemy = enemies[i];
            enemy.update(player.x, player.y);
            enemy.draw();

            const pDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (pDist < player.width * 0.45 + enemy.radius) {
                playSound('hit');
                createReferenceExplosion(enemy.x, enemy.y, '#ff1e50', 22);
                enemies.splice(i, 1);
                player.health -= 15;

                if (player.health <= 0) {
                    lives--;
                    if (lives <= 0) {
                        gameState = 'GAMEOVER';
                        document.getElementById('hud')?.classList.add('hidden');
                        const fScore = document.getElementById('finalScore');
                        if (fScore) fScore.innerText = Number(score).toLocaleString();

                        if (score > highScore) {
                            highScore = score;
                            localStorage.setItem('cybercommander_score', highScore);
                            document.getElementById('newHighScoreNotice')?.classList.remove('hidden');
                        }
                        document.getElementById('gameOverScreen')?.classList.remove('hidden');
                    } else {
                        player.health = player.maxHealth;
                        player.x = gameWidth / 2;
                        player.y = gameHeight / 2;
                    }
                }
            }
        }

        // Particles
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

// Start loop & bind screen buttons
requestAnimationFrame(gameLoop);

document.getElementById('startBtn')?.addEventListener('click', startGame);
document.getElementById('restartBtn')?.addEventListener('click', startGame);

// Quick Toolbar buttons
document.getElementById('btnMuteAudio')?.addEventListener('click', () => {
    isMuted = !isMuted;
    const btn = document.getElementById('btnMuteAudio');
    if (btn) btn.innerText = isMuted ? '🔇 Audio Mati' : '🔊 Audio Aktif';
    console.log(isMuted ? "Audio dimatikan." : "Audio diaktifkan.");
});

document.getElementById('btnRestartGame')?.addEventListener('click', () => {
    startGame();
});

// ========================================================
// 6. DUAL-PLANE IDE CONTROLLER & CODE EDITOR SYNC
// ========================================================
const codePane = document.getElementById('codePane');
const gamePane = document.getElementById('gamePane');
const splitDivider = document.getElementById('splitDivider');
const codeTextarea = document.getElementById('codeTextarea');
const lineNumbers = document.getElementById('lineNumbers');
const syntaxStatus = document.getElementById('syntaxStatus');
const floatingRestoreBar = document.getElementById('floatingRestoreBar');
const btnFloatingRestore = document.getElementById('btnFloatingRestore');
const enlargeDropdown = document.getElementById('enlargeDropdown');
const btnEnlargeGame = document.getElementById('btnEnlargeGame');

// Canon Script template for the editor with clear instructions
const CANONICAL_JS_CODE = `/**
 * MODUL-07: CYBER-COMMANDER Game Engine
 * Grafis Ultra-HD: Jet Interceptor, Laser Bolt, Drone Quad-Rotor, Partikel Ledakan
 */

// 1. PENGATURAN KAPAL TEMPUR (PLAYER SHIP)
if (typeof player !== 'undefined' && player) {
    player.speed = 6.2;         // Kecepatan gerak kapal (coba ganti ke 14.5!)
    player.maxHealth = 100;     // Darah maksimum kapal
    player.health = 100;        // Pulihkan darah penuh
}

// 2. ARSENAL SENJATA (WEAPONS CONFIGURATION)
weapons = [
    { name: 'Twin Plasma Cannon', cooldown: 6, heatRate: 2.2, ammoCost: 2 },
    { name: 'Beam Laser Cascade', cooldown: 4, heatRate: 3.5, ammoCost: 1 },
    { name: 'Quantum Tri-Burst',  cooldown: 9, heatRate: 4.5, ammoCost: 3 }
];

// 3. AMUNISI & NYAWA
ammo = 850;                     // Tambah amunisi
lives = 3;                      // Jumlah nyawa

console.log("✓ Konfigurasi MODUL-07 berhasil diterapkan ke kapal tempur!");
`;

// Populate editor
if (codeTextarea) {
    codeTextarea.value = CANONICAL_JS_CODE;
    updateLineNumbers();

    // Tab key support
    codeTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeTextarea.selectionStart;
            const end = codeTextarea.selectionEnd;
            codeTextarea.value = codeTextarea.value.substring(0, start) + '    ' + codeTextarea.value.substring(end);
            codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 4;
            updateLineNumbers();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            executeUserCode();
        }
    });

    codeTextarea.addEventListener('input', () => {
        updateLineNumbers();
        checkSyntax();
    });

    codeTextarea.addEventListener('scroll', () => {
        if (lineNumbers) {
            lineNumbers.scrollTop = codeTextarea.scrollTop;
        }
    });
}

function updateLineNumbers() {
    if (!lineNumbers || !codeTextarea) return;
    const lines = codeTextarea.value.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= lines; i++) {
        numbersHtml += `<div>${i}</div>`;
    }
    lineNumbers.innerHTML = numbersHtml;
}

function checkSyntax() {
    if (!syntaxStatus || !codeTextarea) return;
    try {
        new Function(codeTextarea.value);
        syntaxStatus.className = 'syntax-badge ok';
        syntaxStatus.innerText = '✓ Syntax OK';
    } catch (err) {
        syntaxStatus.className = 'syntax-badge error';
        syntaxStatus.innerText = '✕ Syntax Error';
    }
}

// Execute user code
function executeUserCode() {
    if (!codeTextarea) return;
    const code = codeTextarea.value;
    console.log("Mengeksekusi kode JavaScript...");
    try {
        // Run code with direct engine scope
        const runFn = new Function('player', 'weapons', 'canvas', code);
        runFn(player, weapons, canvas);
        console.log("✓ Kode berhasil dijalankan dan disinkronkan ke Game!");
        if (syntaxStatus) {
            syntaxStatus.className = 'syntax-badge ok';
            syntaxStatus.innerText = '✓ Syntax OK';
        }
        if (gameState === 'START') {
            startGame();
        }
    } catch (err) {
        console.error("Gagal mengeksekusi kode: " + err.message);
        if (syntaxStatus) {
            syntaxStatus.className = 'syntax-badge error';
            syntaxStatus.innerText = '✕ ' + err.message;
        }
    }
}

// Global & Local Run buttons
document.getElementById('btnRunGlobal')?.addEventListener('click', executeUserCode);
document.getElementById('btnRunCode')?.addEventListener('click', executeUserCode);

// Reset Code button
document.getElementById('btnResetCode')?.addEventListener('click', () => {
    if (confirm("Kembalikan kode ke template standar default?")) {
        codeTextarea.value = CANONICAL_JS_CODE;
        updateLineNumbers();
        checkSyntax();
        executeUserCode();
        console.log("Kode berhasil di-reset ke Standar Default.");
    }
});

// Copy Code button
document.getElementById('btnCopyCode')?.addEventListener('click', () => {
    if (!codeTextarea) return;
    navigator.clipboard.writeText(codeTextarea.value).then(() => {
        const btn = document.getElementById('btnCopyCode');
        if (btn) {
            const original = btn.innerText;
            btn.innerText = '✓ Tersalin!';
            setTimeout(() => { btn.innerText = original; }, 1800);
        }
    });
});

// Quick Presets
const PRESETS = {
    default: CANONICAL_JS_CODE,
    speed_demon: `/**
 * PRESET: SPEED DEMON (Kecepatan Super)
 */
if (typeof player !== 'undefined' && player) {
    player.speed = 14.5;        // Kecepatan Super
    player.maxHealth = 250;
    player.health = 250;
}
weapons = [
    { name: 'Twin Plasma Cannon (Gatling)', cooldown: 1, heatRate: 0.1, ammoCost: 0 },
    { name: 'Beam Laser Cascade (Overcharged)', cooldown: 1, heatRate: 0.2, ammoCost: 0 },
    { name: 'Quantum Tri-Burst (Hyper)', cooldown: 2, heatRate: 0.3, ammoCost: 0 }
];
ammo = 9999;
lives = 5;
console.log("⚡ Mode Speed Demon Aktif: Kecepatan 14.5 & Gatling tanpa jeda!");`,

    quantum: `/**
 * PRESET: QUANTUM STORM & LEDAKAN MASIF
 */
weapons = [
    { name: 'Quantum Tri-Burst (Max Spread)', cooldown: 2, heatRate: 0.5, ammoCost: 1 }
];
currentWeaponIndex = 0;
ammo = 5000;
console.log("🌌 Mode Quantum Storm Aktif: Semburan partikel laser masif!");`,

    tank: `/**
 * PRESET: BENTENG BAJA (ARMOR 999)
 */
if (typeof player !== 'undefined' && player) {
    player.speed = 5.0;
    player.maxHealth = 999;
    player.health = 999;
}
lives = 10;
ammo = 3000;
console.log("🛡️ Mode Benteng Baja Aktif: Armor 999 HP dan 10 nyawa!");`,

    horde: `/**
 * PRESET: KAWANAN DRONE MASIF
 */
if (typeof enemies !== 'undefined') {
    for (let i = 0; i < 20; i++) {
        enemies.push(new CyberDrone(Math.random() * gameWidth, -30));
    }
}
console.log("👾 Horde Musuh Dipanggil: 20 Cyber-Drone tempur!");`
};

document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const pKey = chip.getAttribute('data-preset');
        if (PRESETS[pKey] && codeTextarea) {
            codeTextarea.value = PRESETS[pKey];
            updateLineNumbers();
            checkSyntax();
            executeUserCode();
        }
    });
});

// ========================================================
// 7. SPLIT RESIZE & ENLARGE GAME SCREEN CONTROLS
// ========================================================
let isDragging = false;

function setSplitLayout(codePercent) {
    if (!codePane || !gamePane) return;
    
    // Clear custom active styles
    document.querySelectorAll('.btn-ctrl').forEach(b => b.classList.remove('active'));

    if (codePercent <= 0) {
        // 100% Game view
        codePane.style.display = 'none';
        if (splitDivider) splitDivider.style.display = 'none';
        gamePane.style.flex = '1 1 100%';
        if (floatingRestoreBar) floatingRestoreBar.classList.remove('hidden');
        document.getElementById('btnGameMax')?.classList.add('active');
    } else {
        codePane.style.display = 'flex';
        if (splitDivider) splitDivider.style.display = 'flex';
        codePane.style.flex = `0 0 ${codePercent}%`;
        gamePane.style.flex = `0 0 ${100 - codePercent}%`;
        if (floatingRestoreBar) floatingRestoreBar.classList.add('hidden');
        document.getElementById('btnGameMax')?.classList.remove('active');

        if (Math.round(codePercent) === 50) {
            document.getElementById('btnSplit50')?.classList.add('active');
        } else if (Math.round(codePercent) === 30) {
            document.getElementById('btnSplit3070')?.classList.add('active');
        } else if (Math.round(codePercent) === 70) {
            document.getElementById('btnSplit7030')?.classList.add('active');
        }
    }

    // Trigger canvas resize
    setTimeout(resizeCanvas, 30);
}

// Split header buttons
document.getElementById('btnSplit50')?.addEventListener('click', () => setSplitLayout(50));
document.getElementById('btnSplit3070')?.addEventListener('click', () => setSplitLayout(30));
document.getElementById('btnSplit7030')?.addEventListener('click', () => setSplitLayout(70));

// Game Toolbar Maximize/Restore button
document.getElementById('btnGameMax')?.addEventListener('click', () => {
    if (codePane && codePane.style.display === 'none') {
        setSplitLayout(50);
    } else {
        setSplitLayout(0);
    }
});

// Floating restore button in full game mode
btnFloatingRestore?.addEventListener('click', () => {
    setSplitLayout(50);
});

// Enlarge Game Dropdown toggle
btnEnlargeGame?.addEventListener('click', (e) => {
    e.stopPropagation();
    enlargeDropdown?.classList.toggle('hidden');
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    if (enlargeDropdown && !enlargeDropdown.contains(e.target) && e.target !== btnEnlargeGame) {
        enlargeDropdown.classList.add('hidden');
    }
});

// Dropdown item clicks
document.querySelectorAll('.enlarge-dropdown .dropdown-item[data-size]').forEach(btn => {
    btn.addEventListener('click', () => {
        const gameSize = parseInt(btn.getAttribute('data-size') || '50', 10);
        if (gameSize === 100) {
            setSplitLayout(0);
        } else {
            setSplitLayout(100 - gameSize);
        }
        enlargeDropdown?.classList.add('hidden');
    });
});

// Native F11 Fullscreen toggle
document.getElementById('btnNativeFullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
    enlargeDropdown?.classList.add('hidden');
});

// Drag to resize split divider
if (splitDivider) {
    splitDivider.addEventListener('mousedown', (e) => {
        isDragging = true;
        splitDivider.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const workspace = document.getElementById('workspace');
        if (!workspace) return;
        const rect = workspace.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        let percent = (offsetX / rect.width) * 100;
        percent = Math.max(15, Math.min(85, percent));
        setSplitLayout(percent);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            splitDivider.classList.remove('dragging');
            document.body.style.cursor = 'default';
        }
    });

    // Double-click divider to reset to 50:50
    splitDivider.addEventListener('dblclick', () => {
        setSplitLayout(50);
    });
}

// Help Modal
const helpModal = document.getElementById('helpModal');
document.getElementById('btnShowHelp')?.addEventListener('click', () => {
    helpModal?.classList.remove('hidden');
});
document.getElementById('btnCloseHelp')?.addEventListener('click', () => {
    helpModal?.classList.add('hidden');
});
document.getElementById('btnDismissHelp')?.addEventListener('click', () => {
    helpModal?.classList.add('hidden');
});
document.getElementById('btnClearLogs')?.addEventListener('click', clearTerminal);
