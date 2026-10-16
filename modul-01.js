// ==============================================================
// MODUL-01: RAIDEN (1990) 16-BIT RETRO ARCADE - JAVASCRIPT ENGINE
// File: modul-01.js
// Berisi: Engine Game Raiden Canvas 2D Mandiri, Controller Editor,
// dan Sistem Download File Mandiri (HTML, CSS, JS, & ZIP).
// ==============================================================

const defaultGameCode = `// ==============================================================
// RAIDEN (1990) ARCADES - NATIVE 16-BIT RETRO ENGINE
// Rekonstruksi GDD Seibu Kaihatsu:
// - Peta Stage 1 Lengkap: Persawahan Emas, Sungai Berkelok, Jembatan,
//   Pangkalan Udara Runway & Helipad, Perumahan, Hutan Pinus, Bayangan Awan
// - Fighting Thunder: 36x36 Sprite, Core Hitbox 6x6 (Bullet Grazing)
// - Senjata: Wide Vulcan (Level 1-8), Plasma Laser (Level 1-8)
// - Sub-Weapon: Nuclear Missile (M) & Homing (H), Megabomb (B)
// - Musuh: Panzer Tanks (Kubah Putar), Interceptor Jets, Gunships, Boss Goliath
// - Audio: Web Audio API FM-synth tanpa file eksternal
// ==============================================================

const CANVAS_W = 450;
const CANVAS_H = 600;

// Parameter Pemain Sesuai GDD Raiden
const player = {
  x: CANVAS_W / 2,
  y: CANVAS_H - 90,
  speed: 280, // Kecepatan digital konstan
  coreHitbox: 6, // 6x6 pixel hitbox di tengah
  hp: 100,
  maxHp: 100,
  lives: 3,
  bombs: 3,
  score: 0,
  bankAngle: 0, // Animasi miring sayap (-1 kiri, 0 tengah, 1 kanan)
  invulnerableTime: 0,
  mainWeapon: 'VULCAN', // 'VULCAN' atau 'LASER'
  weaponLevel: 1,       // 1 - 8
  subWeapon: 'HOMING',   // 'NONE', 'NUCLEAR', 'HOMING'
  subLevel: 1,          // 1 - 4
  medalsCollected: 0
};

// Pengaturan Peta & Scrolling
let mapScrollY = 0;
const SCROLL_SPEED = 0.95; // Kecepatan scroll autentik Seibu Kaihatsu
let mapCacheCanvas = null;

// Entitas Game
let bullets = [];
let enemyBullets = [];
let missiles = [];
let activeBombs = [];
let aoeClouds = [];
let enemies = [];
let tanks = [];
let powerups = [];
let medals = [];
let particles = [];
let craters = [];
let clouds = [];
let floatingTexts = [];

let boss = null;
let stageTime = 0;
let lastFireTime = 0;
let lastSubFireTime = 0;
let itemCycleTimer = 0;
let secretFairySpawned = false;
let secretFairyHits = 0;
let fairyActive = false;
let fairyX = 0, fairyY = 0;

// Input State
const keys = {};
let mouseX = player.x, mouseY = player.y, isMouseDown = false;

// --------------------------------------------------------------
// 1. GENERATOR PETA STAGE 1 RETRO 16-BIT (2400px Multi-Biome Map)
// --------------------------------------------------------------
function generateRaidenMap() {
  const mapW = CANVAS_W;
  const mapH = 2400; // Panjang peta gulir bertahap
  const mc = document.createElement('canvas');
  mc.width = mapW;
  mc.height = mapH;
  const ctx = mc.getContext('2d');

  // Base Tanah Hijau Tua Bertekstur (Grassland Stippling)
  ctx.fillStyle = '#234a1e';
  ctx.fillRect(0, 0, mapW, mapH);
  ctx.fillStyle = '#1a3a16';
  for (let y = 0; y < mapH; y += 6) {
    for (let x = 0; x < mapW; x += 6) {
      if ((x * 7 + y * 13) % 11 === 0) ctx.fillRect(x, y, 4, 4);
    }
  }

  // Bintik Bunga Liar & Rerumputan
  for (let i = 0; i < 300; i++) {
    let fx = (i * 37) % mapW;
    let fy = (i * 71) % mapH;
    ctx.fillStyle = (i % 3 === 0) ? '#fef08a' : (i % 3 === 1 ? '#f472b6' : '#ffffff');
    ctx.fillRect(fx, fy, 2, 2);
  }

  // 1A. Petak-Petak Persawahan Emas & Hijau (Agricultural Patchwork)
  const drawFarmland = (x, y, w, h, baseColor, stripeColor, isHorizontal = true) => {
    ctx.fillStyle = '#1c2e17'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8); // Pematang tanah gelap
    ctx.fillStyle = baseColor; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = stripeColor;
    if (isHorizontal) {
      for (let ly = y + 6; ly < y + h - 4; ly += 7) {
        ctx.fillRect(x + 4, ly, w - 8, 2);
      }
    } else {
      for (let lx = x + 6; lx < x + w - 4; lx += 8) {
        ctx.fillRect(lx, y + 4, 3, h - 8);
      }
    }
  };

  // Ladang Gandum Kuning Emas
  drawFarmland(230, 200, 190, 220, '#854d0e', '#facc15', true);
  drawFarmland(240, 750, 180, 180, '#92400e', '#fbbf24', true);
  drawFarmland(30, 1500, 170, 230, '#854d0e', '#facc15', false);

  // Kebun Buah & Perkebunan Zaitun Hijau
  drawFarmland(260, 480, 160, 190, '#365314', '#84cc16', false);
  drawFarmland(30, 980, 180, 200, '#3f4f1a', '#65a30d', true);

  // Petak Sayuran Subur Cokelat-Hijau
  drawFarmland(240, 1820, 180, 220, '#451a03', '#15803d', true);

  // 1B. Sungai Alami Berkelok & Pulau Pasir
  const riverPoints = [
    { y: 0, x: 70, w: 100 },
    { y: 300, x: 130, w: 90 },
    { y: 650, x: 90, w: 110 },
    { y: 1100, x: 140, w: 95 },
    { y: 1600, x: 80, w: 120 },
    { y: 2000, x: 130, w: 105 },
    { y: 2400, x: 90, w: 100 }
  ];

  // Garis Tepi Sungai Berpasir (Sandbank)
  ctx.fillStyle = '#a88e63';
  ctx.beginPath();
  ctx.moveTo(riverPoints[0].x - 12, 0);
  for (let p of riverPoints) ctx.lineTo(p.x - 12, p.y);
  for (let i = riverPoints.length - 1; i >= 0; i--) {
    let p = riverPoints[i];
    ctx.lineTo(p.x + p.w + 12, p.y);
  }
  ctx.closePath();
  ctx.fill();

  // Air Sungai Biru Bergradasi
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.moveTo(riverPoints[0].x, 0);
  for (let p of riverPoints) ctx.lineTo(p.x, p.y);
  for (let i = riverPoints.length - 1; i >= 0; i--) {
    let p = riverPoints[i];
    ctx.lineTo(p.x + p.w, p.y);
  }
  ctx.closePath();
  ctx.fill();

  // Arus Air & Buih Ombak Putih
  ctx.fillStyle = '#93c5fd';
  for (let ry = 40; ry < mapH; ry += 50) {
    let p = riverPoints[Math.min(riverPoints.length - 1, Math.floor(ry / 400))];
    ctx.fillRect(p.x + 15, ry, p.w - 30, 2);
  }

  // 1C. Jembatan Melintasi Sungai (y: 540 dan y: 1320)
  const drawBridge = (by) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, by + 12, 230, 8); // Bayangan di air
    ctx.fillStyle = '#1e293b'; ctx.fillRect(10, by - 14, 230, 28);
    ctx.fillStyle = '#475569'; ctx.fillRect(12, by - 12, 226, 24);
    ctx.fillStyle = '#64748b'; ctx.fillRect(14, by - 8, 222, 16);
    // Marka jalan jembatan
    ctx.fillStyle = '#f8fafc';
    for (let bx = 20; bx < 230; bx += 24) ctx.fillRect(bx, by - 1, 12, 2);
    // Pagar pengaman
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(12, by - 13, 226, 2); ctx.fillRect(12, by + 11, 226, 2);
  };
  drawBridge(540);
  drawBridge(1320);

  // 1D. Pangkalan Udara Militer Tarmac, Runway & Helipad (y: 1100 - 1450)
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(226, 1106, 220, 348);
  ctx.fillStyle = '#334155'; ctx.fillRect(220, 1100, 230, 340);
  ctx.fillStyle = '#475569'; ctx.fillRect(224, 1104, 222, 332);
  
  // Grid Ubin Beton Landasan
  ctx.fillStyle = '#1e293b';
  for (let gx = 224; gx < mapW; gx += 32) ctx.fillRect(gx, 1104, 1, 332);
  for (let gy = 1104; gy < 1436; gy += 30) ctx.fillRect(224, gy, 222, 1);

  // Garis Runway Markings Kuning-Putih
  ctx.fillStyle = '#eab308'; ctx.fillRect(234, 1270, 180, 4);
  for (let rx = 240; rx < 410; rx += 36) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx, 1262, 16, 3);
    ctx.fillRect(rx, 1279, 16, 3);
  }

  // Helipad Militer Berhuruf "H"
  ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.arc(330, 1180, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(330, 1180, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(322, 1170, 4, 20); ctx.fillRect(334, 1170, 4, 20); ctx.fillRect(322, 1178, 16, 4);

  // Hanggar Pesawat Baja (Bunker)
  ctx.fillStyle = '#0f172a'; ctx.fillRect(360, 1340, 75, 55);
  ctx.fillStyle = '#334155'; ctx.fillRect(362, 1342, 71, 51);
  ctx.fillStyle = '#020617'; ctx.fillRect(372, 1362, 51, 31); // Pintu hanggar terbuka

  // 1E. Kompleks Pedesaan & Rumah Atap Merah Terracotta (y: 1950 - 2200)
  const drawVillageHouse = (hx, hy) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(hx + 4, hy + 6, 46, 34);
    ctx.fillStyle = '#78350f'; ctx.fillRect(hx, hy, 42, 30);
    ctx.fillStyle = '#dc2626'; ctx.fillRect(hx - 2, hy - 4, 46, 14); // Atap genteng
    ctx.fillStyle = '#f87171'; ctx.fillRect(hx - 2, hy - 2, 46, 2); // Highlight genteng
    ctx.fillStyle = '#fef08a'; ctx.fillRect(hx + 8, hy + 14, 8, 8); // Jendela bercahaya
  };
  drawVillageHouse(250, 1980);
  drawVillageHouse(320, 2010);
  drawVillageHouse(280, 2080);

  // Silo Gandum Rahasia (Secret Fairy Location)
  ctx.fillStyle = '#71717a'; ctx.beginPath(); ctx.arc(360, 1720, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e4e4e7'; ctx.beginPath(); ctx.arc(360, 1720, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.fillRect(356, 1716, 8, 8); // Marka silang

  // 1F. Pepohonan Pinus Rimbun dengan Bayangan Jatuh (Over 80 Trees)
  const drawPineTree = (tx, ty, r = 16) => {
    ctx.fillStyle = 'rgba(10, 25, 10, 0.4)';
    ctx.beginPath(); ctx.ellipse(tx + 4, ty + 6, r + 2, r - 2, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f2910'; ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(tx - 1, ty - 1, r * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(tx - 2, ty - 2, r * 0.45, 0, Math.PI * 2); ctx.fill();
  };

  for (let y = 30; y < mapH; y += 45) {
    drawPineTree(420 + Math.sin(y * 0.05) * 15, y, 16);
    drawPineTree(25 + Math.cos(y * 0.04) * 15, y, 15);
  }
  drawPineTree(220, 360, 18);
  drawPineTree(230, 920, 17);
  drawPineTree(215, 1740, 18);

  return mc;
}

// Inisialisasi Cloud Shadows
for (let i = 0; i < 6; i++) {
  clouds.push({
    x: Math.random() * CANVAS_W,
    y: Math.random() * CANVAS_H,
    w: 120 + Math.random() * 80,
    h: 60 + Math.random() * 40,
    speed: 0.35 + Math.random() * 0.25
  });
}

// --------------------------------------------------------------
// 2. AUDIO SYNTHESIZER 1990 RETRO (Web Audio API Mandiri)
// --------------------------------------------------------------
const AudioFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  playVulcan() {
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(640, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.07);
  },
  playLaser() {
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(580, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.05);
  },
  playMissile() {
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.16);
  },
  playBomb() {
    if (!this.ctx) return;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 1.2);
  },
  playExplode(big = false) {
    if (!this.ctx) return;
    let dur = big ? 0.35 : 0.16;
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(big ? 110 : 180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + dur);
    gain.gain.setValueAtTime(big ? 0.35 : 0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  },
  playPowerup() {
    if (!this.ctx) return;
    [523, 659, 783, 1046].forEach((f, i) => {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      let t = this.ctx.currentTime + i * 0.04;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(t); osc.stop(t + 0.09);
    });
  }
};

// --------------------------------------------------------------
// 3. LOGIKA ENTITAS & SPAWNER
// --------------------------------------------------------------
function spawnEnemy(type, x, y) {
  if (type === 'JET') {
    enemies.push({
      type: 'JET', x, y, hp: 4, maxHp: 4, w: 26, h: 26,
      vx: (Math.random() - 0.5) * 60, vy: 140, fireTimer: 0
    });
  } else if (type === 'TANK') {
    tanks.push({
      type: 'TANK', x, y, hp: 12, maxHp: 12, w: 32, h: 32,
      vy: SCROLL_SPEED * 60, turretAngle: Math.PI / 2, fireTimer: 0
    });
  } else if (type === 'GUNSHIP') {
    enemies.push({
      type: 'GUNSHIP', x, y, hp: 24, maxHp: 24, w: 46, h: 42,
      vx: Math.sin(stageTime) * 40, vy: 55, fireTimer: 0
    });
  }
}

function spawnBoss() {
  boss = {
    x: CANVAS_W / 2, y: -70, targetY: 100, hp: 350, maxHp: 350,
    w: 110, h: 64, phase: 1, fireTimer: 0, spiralAngle: 0,
    leftWingHp: 80, rightWingHp: 80
  };
}

// --------------------------------------------------------------
// 4. SISTEM TEMBAKAN & SENJATA RAIDEN LENGKAP
// --------------------------------------------------------------
function fireWeapons() {
  if (player.mainWeapon === 'VULCAN') {
    AudioFX.playVulcan();
    let lvl = player.weaponLevel;
    if (lvl <= 2) {
      bullets.push({ x: player.x - 7, y: player.y - 18, vx: 0, vy: -520, w: 4, h: 10, dmg: 4 });
      bullets.push({ x: player.x + 7, y: player.y - 18, vx: 0, vy: -520, w: 4, h: 10, dmg: 4 });
    } else if (lvl <= 4) {
      bullets.push({ x: player.x, y: player.y - 20, vx: 0, vy: -520, w: 4, h: 10, dmg: 4 });
      bullets.push({ x: player.x - 9, y: player.y - 16, vx: -120, vy: -500, w: 4, h: 10, dmg: 3.5 });
      bullets.push({ x: player.x + 9, y: player.y - 16, vx: 120, vy: -500, w: 4, h: 10, dmg: 3.5 });
    } else if (lvl <= 6) {
      [-0.3, -0.15, 0, 0.15, 0.3].forEach(ang => {
        bullets.push({
          x: player.x, y: player.y - 18,
          vx: Math.sin(ang) * 520, vy: -Math.cos(ang) * 520,
          w: 4, h: 10, dmg: 3.5
        });
      });
    } else {
      [-0.52, -0.32, -0.15, 0, 0.15, 0.32, 0.52].forEach(ang => {
        bullets.push({
          x: player.x, y: player.y - 18,
          vx: Math.sin(ang) * 540, vy: -Math.cos(ang) * 540,
          w: 4, h: 10, dmg: 3.5
        });
      });
    }
  } else if (player.mainWeapon === 'LASER') {
    AudioFX.playLaser();
    let lvl = player.weaponLevel;
    let beamW = lvl <= 2 ? 6 : (lvl <= 5 ? 12 : 22);
    bullets.push({
      x: player.x, y: player.y - 24, vx: 0, vy: -800,
      w: beamW, h: 36, isLaser: true, dmg: 6 + lvl * 1.5
    });
  }

  // Sub-Weapon Tembak Bersamaan (Salvo Rudal Seibu Raiden Otentik)
  if (player.subWeapon !== 'NONE' && stageTime - lastSubFireTime > (player.subWeapon === 'NUCLEAR' ? 0.6 : 0.38)) {
    lastSubFireTime = stageTime;
    if (player.subWeapon === 'NUCLEAR') {
      AudioFX.playMissile();
      // Efek Asap Peluncuran dari Pylon Sayap
      particles.push({ x: player.x - 14, y: player.y + 4, vx: -20, vy: 15, r: 4, life: 0.28, color: '#94a3b8' });
      particles.push({ x: player.x + 14, y: player.y + 4, vx: 20, vy: 15, r: 4, life: 0.28, color: '#94a3b8' });

      missiles.push({
        x: player.x - 14, y: player.y - 12, vx: -25, vy: -420,
        ang: -Math.PI / 2, type: 'NUCLEAR', w: 10, h: 22, dmg: 32
      });
      missiles.push({
        x: player.x + 14, y: player.y - 12, vx: 25, vy: -420,
        ang: -Math.PI / 2, type: 'NUCLEAR', w: 10, h: 22, dmg: 32
      });

      if (player.subLevel >= 2) {
        missiles.push({
          x: player.x - 22, y: player.y - 6, vx: -65, vy: -400,
          ang: -Math.PI / 2 - 0.12, type: 'NUCLEAR', w: 10, h: 22, dmg: 32
        });
        missiles.push({
          x: player.x + 22, y: player.y - 6, vx: 65, vy: -400,
          ang: -Math.PI / 2 + 0.12, type: 'NUCLEAR', w: 10, h: 22, dmg: 32
        });
      }
    } else if (player.subWeapon === 'HOMING') {
      AudioFX.playMissile();
      particles.push({ x: player.x - 16, y: player.y + 2, vx: -40, vy: 12, r: 3, life: 0.22, color: '#cbd5e1' });
      particles.push({ x: player.x + 16, y: player.y + 2, vx: 40, vy: 12, r: 3, life: 0.22, color: '#cbd5e1' });

      missiles.push({
        x: player.x - 16, y: player.y - 10, vx: -180, vy: -300,
        ang: Math.atan2(-300, -180), type: 'HOMING', w: 8, h: 18, dmg: 16
      });
      missiles.push({
        x: player.x + 16, y: player.y - 10, vx: 180, vy: -300,
        ang: Math.atan2(-300, 180), type: 'HOMING', w: 8, h: 18, dmg: 16
      });

      if (player.subLevel >= 2) {
        missiles.push({
          x: player.x - 24, y: player.y - 6, vx: -250, vy: -240,
          ang: Math.atan2(-240, -250), type: 'HOMING', w: 8, h: 18, dmg: 16
        });
        missiles.push({
          x: player.x + 24, y: player.y - 6, vx: 250, vy: -240,
          ang: Math.atan2(-240, 250), type: 'HOMING', w: 8, h: 18, dmg: 16
        });
      }
    }
  }
}

function dropMegabomb() {
  if (player.bombs <= 0) return;
  player.bombs--;
  AudioFX.playBomb();

  // Luncurkan Bom Fisik yang Menukik Jatuh
  activeBombs.push({
    x: player.x,
    y: player.y - 15,
    vy: -150,
    scale: 1.1,
    timer: 0.58
  });

  addFloatingText(player.x, player.y - 30, 'TACTICAL MEGABOMB!', '#facc15');
}

function createExplosion(x, y, big = false) {
  AudioFX.playExplode(big);
  let count = big ? 35 : 16;
  for (let i = 0; i < count; i++) {
    let ang = Math.random() * Math.PI * 2;
    let spd = 40 + Math.random() * (big ? 200 : 120);
    particles.push({
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      r: 2 + Math.random() * (big ? 6 : 4),
      life: 1.0,
      color: (i % 2 === 0) ? '#f97316' : '#facc15'
    });
  }
  // Kawah hitam di tanah jika dekat permukaan
  craters.push({ x, y, r: big ? 16 : 9, life: 1.0 });
}

function addFloatingText(x, y, text, color = '#facc15') {
  floatingTexts.push({ x, y, text, color, life: 1.0 });
}

// --------------------------------------------------------------
// 5. UPDATE LOOP (Fisika, Tabrakan, & Grazing)
// --------------------------------------------------------------
let lastTime = performance.now();

function updateGame(dt) {
  stageTime += dt;

  // Gulir Peta
  mapScrollY += SCROLL_SPEED * 60 * dt;
  if (mapScrollY >= 2400 - CANVAS_H) mapScrollY = 0;

  // Kontrol Gerakan Pemain Digital Murni
  let moveX = 0, moveY = 0;
  if (keys['ArrowLeft'] || keys['KeyA']) moveX -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) moveX += 1;
  if (keys['ArrowUp'] || keys['KeyW']) moveY -= 1;
  if (keys['ArrowDown'] || keys['KeyS']) moveY += 1;

  // Mouse / Touch Follow jika digerakkan
  if (isMouseDown) {
    let dx = mouseX - player.x;
    let dy = mouseY - player.y;
    let dist = Math.hypot(dx, dy);
    if (dist > 4) {
      moveX = dx / dist;
      moveY = dy / dist;
    }
  }

  // Terapkan kecepatan
  player.x += moveX * player.speed * dt;
  player.y += moveY * player.speed * dt;
  player.bankAngle = moveX < -0.2 ? -1 : (moveX > 0.2 ? 1 : 0);

  // Clamp player boundary
  player.x = Math.max(20, Math.min(CANVAS_W - 20, player.x));
  player.y = Math.max(30, Math.min(CANVAS_H - 30, player.y));

  // Tembak Otomatis Pemain
  if (stageTime - lastFireTime > (player.mainWeapon === 'LASER' ? 0.06 : 0.12)) {
    fireWeapons();
    lastFireTime = stageTime;
  }

  // Siklus Warna Powerup (Merah <-> Biru setiap 2.5 Detik Sesuai GDD)
  itemCycleTimer += dt;
  if (itemCycleTimer >= 2.5) {
    itemCycleTimer = 0;
    powerups.forEach(p => {
      if (p.type === 'VULCAN') p.type = 'LASER';
      else if (p.type === 'LASER') p.type = 'VULCAN';
    });
  }

  // Trigger Peri Rahasia (Secret Fairy) saat Silo ditembak
  if (!secretFairySpawned) {
    let siloScreenY = (1720 - mapScrollY + 2400) % 2400;
    if (siloScreenY > 0 && siloScreenY < CANVAS_H) {
      bullets.forEach(b => {
        if (Math.hypot(b.x - 360, b.y - siloScreenY) < 22) {
          secretFairyHits++;
          if (secretFairyHits >= 8) {
            secretFairySpawned = true;
            fairyActive = true;
            fairyX = 360; fairyY = siloScreenY;
            AudioFX.playPowerup();
            addFloatingText(360, siloScreenY, 'SECRET FAIRY UNLOCKED!', '#f472b6');
            player.score += 10000;
          }
        }
      });
    }
  }

  if (fairyActive) {
    fairyX += (player.x - 26 - fairyX) * 0.1;
    fairyY += (player.y + 10 - fairyY) * 0.1;
  }

  // Update Peluru Pemain
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.y < -30 || b.y > CANVAS_H + 30 || b.x < -20 || b.x > CANVAS_W + 20) {
      bullets.splice(i, 1);
    }
  }

  // Update Rudal Pemain (Trajectory & Partikel Asap Khas Raiden)
  for (let i = missiles.length - 1; i >= 0; i--) {
    let m = missiles[i];
    if (m.type === 'HOMING') {
      let target = enemies[0] || tanks[0] || boss;
      if (target) {
        let desiredAng = Math.atan2(target.y - m.y, target.x - m.x);
        let diff = desiredAng - m.ang;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        m.ang += diff * Math.min(1.0, 14.0 * dt);
        m.vx = Math.cos(m.ang) * 460;
        m.vy = Math.sin(m.ang) * 460;
      }
    } else {
      m.ang = Math.atan2(m.vy, m.vx);
    }
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    // Jejak Asap Roket Khas Arkade 1990
    if (Math.random() < 0.7) {
      let backX = m.x - Math.cos(m.ang) * (m.h / 2);
      let backY = m.y - Math.sin(m.ang) * (m.h / 2);
      particles.push({
        x: backX, y: backY,
        vx: -Math.cos(m.ang) * 35 + (Math.random() - 0.5) * 20,
        vy: -Math.sin(m.ang) * 35 + (Math.random() - 0.5) * 20,
        r: m.type === 'NUCLEAR' ? (2.5 + Math.random() * 2) : (1.8 + Math.random() * 1.5),
        life: 0.32,
        color: m.type === 'NUCLEAR' ? (Math.random() < 0.5 ? '#94a3b8' : '#64748b') : (Math.random() < 0.5 ? '#f1f5f9' : '#fef08a')
      });
    }

    if (m.y < -35 || m.y > CANVAS_H + 35 || m.x < -30 || m.x > CANVAS_W + 30) {
      missiles.splice(i, 1);
    }
  }

  // Update Bom Fisik yang Sedang Menukik Jatuh
  for (let i = activeBombs.length - 1; i >= 0; i--) {
    let b = activeBombs[i];
    b.y += b.vy * dt;
    b.vy += 120 * dt; // Gravitasi
    b.scale += 0.9 * dt;
    b.timer -= dt;

    // Asap Ekor Bom
    particles.push({
      x: b.x, y: b.y + 12,
      vx: (Math.random() - 0.5) * 20, vy: 40,
      r: 3.5, life: 0.3, color: '#475569'
    });

    if (b.timer <= 0) {
      // Ledakan Raksasa Layar Penuh!
      enemyBullets = [];
      for (let p = 0; p < 95; p++) {
        let ang = Math.random() * Math.PI * 2;
        let spd = 60 + Math.random() * 280;
        particles.push({
          x: b.x, y: b.y,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          r: 4 + Math.random() * 9, life: 1.1, color: (p % 2 === 0 ? '#f59e0b' : '#ef4444')
        });
      }
      aoeClouds.push({ x: b.x, y: b.y, radius: 130, maxRadius: 130, life: 1.2, isNuclear: false });
      enemies.forEach(e => e.hp -= 95);
      tanks.forEach(t => t.hp -= 95);
      if (boss) boss.hp -= 75;
      activeBombs.splice(i, 1);
    }
  }

  // Update Gelombang Kejut AoE (Nuclear Mushroom / Megabomb Shockwave)
  for (let i = aoeClouds.length - 1; i >= 0; i--) {
    let cloud = aoeClouds[i];
    cloud.life -= dt * 1.5;
    if (cloud.life <= 0) aoeClouds.splice(i, 1);
  }

  // Spawner Berkala
  if (Math.random() < 0.035 && enemies.length < 8) {
    spawnEnemy(Math.random() < 0.25 ? 'GUNSHIP' : 'JET', 40 + Math.random() * (CANVAS_W - 80), -30);
  }
  if (Math.random() < 0.02 && tanks.length < 5) {
    spawnEnemy('TANK', 60 + Math.random() * (CANVAS_W - 120), -35);
  }

  // Munculkan Boss setelah 35 detik
  if (stageTime > 35 && !boss) {
    spawnBoss();
  }

  // Update Musuh Jet
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.fireTimer += dt;
    if (e.fireTimer > 1.4 && e.y < player.y) {
      e.fireTimer = 0;
      let ang = Math.atan2(player.y - e.y, player.x - e.x);
      enemyBullets.push({
        x: e.x, y: e.y + 10,
        vx: Math.cos(ang) * 190, vy: Math.sin(ang) * 190,
        r: 3
      });
    }
    if (e.y > CANVAS_H + 40) enemies.splice(i, 1);
  }

  // Update Musuh Tank (Kubah Berputar Membidik Pemain)
  for (let i = tanks.length - 1; i >= 0; i--) {
    let t = tanks[i];
    t.y += t.vy * dt;
    t.turretAngle = Math.atan2(player.y - t.y, player.x - t.x);
    t.fireTimer += dt;
    if (t.fireTimer > 1.8 && t.y > 40 && t.y < player.y) {
      t.fireTimer = 0;
      enemyBullets.push({
        x: t.x, y: t.y,
        vx: Math.cos(t.turretAngle) * 210, vy: Math.sin(t.turretAngle) * 210,
        r: 3.5
      });
    }
    if (t.y > CANVAS_H + 40) tanks.splice(i, 1);
  }

  // Update Boss Goliath
  if (boss) {
    if (boss.y < boss.targetY) boss.y += 40 * dt;
    else {
      boss.x = CANVAS_W / 2 + Math.sin(stageTime * 1.2) * 120;
      boss.fireTimer += dt;
      if (boss.fireTimer > 0.8) {
        boss.fireTimer = 0;
        // Serangan Spiral Ganda Khas Raiden
        boss.spiralAngle += 0.35;
        for (let s = -2; s <= 2; s++) {
          let ang = Math.PI / 2 + s * 0.22 + Math.sin(boss.spiralAngle) * 0.3;
          enemyBullets.push({
            x: boss.x + s * 18, y: boss.y + 24,
            vx: Math.cos(ang) * 220, vy: Math.sin(ang) * 220,
            r: 3.5
          });
        }
      }
    }
  }

  // Update Peluru Musuh & GRAZING CHECK
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let eb = enemyBullets[i];
    eb.x += eb.vx * dt;
    eb.y += eb.vy * dt;

    // Hitbox Presisi: Hanya Core Hitbox 6x6 Pemain!
    let dist = Math.hypot(eb.x - player.x, eb.y - player.y);
    if (dist < player.coreHitbox) {
      enemyBullets.splice(i, 1);
      if (player.invulnerableTime <= 0) {
        player.hp -= 25;
        player.invulnerableTime = 1.5;
        createExplosion(player.x, player.y, true);
        if (player.hp <= 0) {
          player.lives--;
          player.hp = 100;
          player.weaponLevel = Math.max(1, player.weaponLevel - 1);
          addFloatingText(player.x, player.y, 'RESPAWN!', '#ef4444');
        }
      }
      continue;
    } else if (dist < 22 && !eb.grazed) {
      // BULLET GRAZING BONUS! (Ciri Khas Shmup Legendaris)
      eb.grazed = true;
      player.score += 100;
      addFloatingText(player.x, player.y - 12, 'GRAZE +100', '#38bdf8');
    }

    if (eb.y > CANVAS_H + 20 || eb.y < -20 || eb.x < -20 || eb.x > CANVAS_W + 20) {
      enemyBullets.splice(i, 1);
    }
  }

  // Tabrakan Peluru Pemain vs Musuh
  bullets.forEach((b, bi) => {
    // Musuh Jet
    enemies.forEach((e, ei) => {
      if (Math.abs(b.x - e.x) < e.w / 2 && Math.abs(b.y - e.y) < e.h / 2) {
        e.hp -= b.dmg;
        if (!b.isLaser) bullets.splice(bi, 1);
        if (e.hp <= 0) {
          createExplosion(e.x, e.y, e.type === 'GUNSHIP');
          player.score += e.type === 'GUNSHIP' ? 800 : 300;
          if (Math.random() < 0.4) spawnPowerup(e.x, e.y);
          enemies.splice(ei, 1);
        }
      }
    });

    // Musuh Tank
    tanks.forEach((t, ti) => {
      if (Math.abs(b.x - t.x) < t.w / 2 && Math.abs(b.y - t.y) < t.h / 2) {
        t.hp -= b.dmg;
        if (!b.isLaser) bullets.splice(bi, 1);
        if (t.hp <= 0) {
          createExplosion(t.x, t.y, true);
          player.score += 500;
          if (Math.random() < 0.5) spawnPowerup(t.x, t.y);
          tanks.splice(ti, 1);
        }
      }
    });

    // Boss Goliath
    if (boss && Math.abs(b.x - boss.x) < boss.w / 2 && Math.abs(b.y - boss.y) < boss.h / 2) {
      boss.hp -= b.dmg;
      if (!b.isLaser) bullets.splice(bi, 1);
      if (boss.hp <= 0) {
        for (let k = 0; k < 6; k++) {
          createExplosion(boss.x + (Math.random() - 0.5) * 80, boss.y + (Math.random() - 0.5) * 40, true);
        }
        player.score += 25000;
        addFloatingText(boss.x, boss.y, 'STAGE CLEAR! +25000', '#facc15');
        boss = null;
      }
    }
  });

  // Tabrakan Rudal Pemain vs Musuh (Jet, Tank, & Boss)
  for (let mi = missiles.length - 1; mi >= 0; mi--) {
    let m = missiles[mi];
    let hit = false;

    // Cek Musuh Jet & Gunship
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      let e = enemies[ei];
      if (Math.hypot(m.x - e.x, m.y - e.y) < (e.w / 2 + 8)) {
        e.hp -= m.dmg;
        hit = true;
        if (e.hp <= 0) {
          createExplosion(e.x, e.y, e.type === 'GUNSHIP');
          player.score += e.type === 'GUNSHIP' ? 800 : 300;
          if (Math.random() < 0.45) spawnPowerup(e.x, e.y);
          enemies.splice(ei, 1);
        }
        break;
      }
    }

    // Cek Panzer Tank Darat
    if (!hit) {
      for (let ti = tanks.length - 1; ti >= 0; ti--) {
        let t = tanks[ti];
        if (Math.hypot(m.x - t.x, m.y - t.y) < (t.w / 2 + 8)) {
          t.hp -= m.dmg;
          hit = true;
          if (t.hp <= 0) {
            createExplosion(t.x, t.y, true);
            player.score += 500;
            if (Math.random() < 0.5) spawnPowerup(t.x, t.y);
            tanks.splice(ti, 1);
          }
          break;
        }
      }
    }

    // Cek Boss Goliath Dreadnought
    if (!hit && boss && Math.hypot(m.x - boss.x, m.y - boss.y) < (boss.w / 2)) {
      boss.hp -= m.dmg;
      hit = true;
      if (boss.hp <= 0) {
        for (let k = 0; k < 6; k++) {
          createExplosion(boss.x + (Math.random() - 0.5) * 80, boss.y + (Math.random() - 0.5) * 40, true);
        }
        player.score += 25000;
        addFloatingText(boss.x, boss.y, 'STAGE CLEAR! +25000', '#facc15');
        boss = null;
      }
    }

    if (hit) {
      createExplosion(m.x, m.y, m.type === 'NUCLEAR');
      if (m.type === 'NUCLEAR') {
        // AoE Shockwave Radiasi Nuklir
        aoeClouds.push({ x: m.x, y: m.y, maxRadius: 52, life: 0.85, isNuclear: true });
        // Kerusakan Area Sekitar
        enemies.forEach(ne => { if (Math.hypot(ne.x - m.x, ne.y - m.y) < 55) ne.hp -= 18; });
        tanks.forEach(nt => { if (Math.hypot(nt.x - m.x, nt.y - m.y) < 55) nt.hp -= 18; });
        if (boss && Math.hypot(boss.x - m.x, boss.y - m.y) < 65) boss.hp -= 15;
      }
      missiles.splice(mi, 1);
    }
  }

  // Update Powerup & Koleksi
  for (let i = powerups.length - 1; i >= 0; i--) {
    let p = powerups[i];
    p.y += 65 * dt;
    if (Math.hypot(p.x - player.x, p.y - player.y) < 24) {
      AudioFX.playPowerup();
      if (p.type === 'VULCAN') {
        player.mainWeapon = 'VULCAN';
        player.weaponLevel = Math.min(8, player.weaponLevel + 1);
        addFloatingText(player.x, player.y - 15, 'VULCAN LV ' + player.weaponLevel, '#ef4444');
      } else if (p.type === 'LASER') {
        player.mainWeapon = 'LASER';
        player.weaponLevel = Math.min(8, player.weaponLevel + 1);
        addFloatingText(player.x, player.y - 15, 'LASER LV ' + player.weaponLevel, '#38bdf8');
      } else if (p.type === 'NUCLEAR') {
        player.subWeapon = 'NUCLEAR';
        addFloatingText(player.x, player.y - 15, 'SUB: NUCLEAR MISSILE (M)', '#22c55e');
      } else if (p.type === 'HOMING') {
        player.subWeapon = 'HOMING';
        addFloatingText(player.x, player.y - 15, 'SUB: HOMING MISSILE (H)', '#eab308');
      } else if (p.type === 'BOMB') {
        player.bombs = Math.min(6, player.bombs + 1);
        addFloatingText(player.x, player.y - 15, '+1 MEGABOMB', '#ea580c');
      }
      player.score += 500;
      powerups.splice(i, 1);
      continue;
    }
    if (p.y > CANVAS_H + 20) powerups.splice(i, 1);
  }

  // Update Partikel & Kawah
  for (let i = particles.length - 1; i >= 0; i--) {
    let pt = particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.life -= dt * 2.2;
    if (pt.life <= 0) particles.splice(i, 1);
  }

  for (let i = craters.length - 1; i >= 0; i--) {
    let c = craters[i];
    c.y += SCROLL_SPEED * 60 * dt; // Bergerak bersama peta
    c.life -= dt * 0.08;
    if (c.y > CANVAS_H + 30 || c.life <= 0) craters.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];
    ft.y -= 30 * dt;
    ft.life -= dt * 1.5;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }

  // Cloud shadows
  clouds.forEach(c => {
    c.y += (SCROLL_SPEED * 60 + c.speed * 20) * dt;
    if (c.y > CANVAS_H + 80) {
      c.y = -80;
      c.x = Math.random() * CANVAS_W;
    }
  });

  if (player.invulnerableTime > 0) player.invulnerableTime -= dt;
}

function spawnPowerup(x, y) {
  const r = Math.random();
  let type = 'VULCAN';
  if (r < 0.45) type = (Math.random() < 0.5 ? 'VULCAN' : 'LASER');
  else if (r < 0.75) type = (Math.random() < 0.5 ? 'NUCLEAR' : 'HOMING');
  else type = 'BOMB';

  powerups.push({ x, y, type });
}

// --------------------------------------------------------------
// 6. RENDER ENGINE 16-BIT RETRO MURNI (Canvas 2D)
// --------------------------------------------------------------
function drawGame(ctx) {
  ctx.imageSmoothingEnabled = false;

  // 1. Gambar Gulir Peta Stage 1
  if (mapCacheCanvas) {
    let sy = Math.floor(mapScrollY);
    let viewH = CANVAS_H;
    ctx.drawImage(mapCacheCanvas, 0, 2400 - sy - viewH, CANVAS_W, viewH, 0, 0, CANVAS_W, viewH);
  }

  // 2. Kawah Tanah Bekas Ledakan
  craters.forEach(c => {
    ctx.fillStyle = 'rgba(15, 23, 42, ' + (c.life * 0.75) + ')';
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(2, 6, 23, ' + (c.life * 0.9) + ')';
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 0.6, 0, Math.PI * 2); ctx.fill();
  });

  // 3. Tank Darat (Sasis + Kubah Turret Membidik)
  tanks.forEach(t => {
    // Sasis Rantai Tank (Khaki Baja)
    ctx.fillStyle = '#18181b'; ctx.fillRect(t.x - 14, t.y - 14, 28, 28);
    ctx.fillStyle = '#713f12'; ctx.fillRect(t.x - 11, t.y - 12, 22, 24);
    ctx.fillStyle = '#a16207'; ctx.fillRect(t.x - 9, t.y - 10, 18, 20);

    // Kubah Meriam Berputar
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.turretAngle);
    ctx.fillStyle = '#334155'; ctx.fillRect(0, -3, 16, 6); // Laras
    ctx.fillStyle = '#1e293b'; ctx.fillRect(14, -4, 3, 8); // Moncong
    ctx.fillStyle = '#854d0e'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  // 4. Musuh Jet & Gunship
  enemies.forEach(e => {
    if (e.type === 'JET') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(e.x, e.y + 12); ctx.lineTo(e.x - 12, e.y - 10);
      ctx.lineTo(e.x, e.y - 6); ctx.lineTo(e.x + 12, e.y - 10);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#15803d'; ctx.fillRect(e.x - 3, e.y - 4, 6, 8);
      ctx.fillStyle = '#f97316'; ctx.fillRect(e.x - 1, e.y + 1, 2, 4); // Cockpit
    } else if (e.type === 'GUNSHIP') {
      ctx.fillStyle = '#18181b'; ctx.fillRect(e.x - 22, e.y - 18, 44, 36);
      ctx.fillStyle = '#3f3f46'; ctx.fillRect(e.x - 19, e.y - 15, 38, 30);
      ctx.fillStyle = '#0284c7'; ctx.fillRect(e.x - 6, e.y - 4, 12, 12);
    }
  });

  // 5. Boss Goliath Dreadnought
  if (boss) {
    // Sasis Utama
    ctx.fillStyle = '#18181b'; ctx.fillRect(boss.x - 55, boss.y - 30, 110, 60);
    ctx.fillStyle = '#3f3f46'; ctx.fillRect(boss.x - 50, boss.y - 26, 100, 52);
    ctx.fillStyle = '#52525b'; ctx.fillRect(boss.x - 45, boss.y - 22, 90, 44);

    // Hazard Stripes
    for (let x = boss.x - 40; x < boss.x + 40; x += 14) {
      ctx.fillStyle = '#eab308'; ctx.fillRect(x, boss.y - 20, 7, 4);
    }

    // Reaktor Inti Glowing
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath(); ctx.arc(boss.x, boss.y + 2, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath(); ctx.arc(boss.x, boss.y + 2, 6, 0, Math.PI * 2); ctx.fill();

    // Health Bar Boss
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(75, 48, 300, 7);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(75, 48, 300 * Math.max(0, boss.hp / boss.maxHp), 7);
  }

  // 6. Peluru & Rudal Pemain
  bullets.forEach(b => {
    if (b.isLaser) {
      // Beam Laser Biru Terang Seibu Raiden
      ctx.fillStyle = '#0284c7'; ctx.fillRect(b.x - b.w / 2, b.y, b.w, b.h);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(b.x - b.w / 4, b.y, b.w / 2, b.h);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x - 1, b.y, 2, b.h);
    } else {
      // Vulcan Peluru Merah-Kuning
      ctx.fillStyle = '#ef4444'; ctx.fillRect(b.x - 2, b.y - 5, b.w, b.h);
      ctx.fillStyle = '#fef08a'; ctx.fillRect(b.x - 1, b.y - 4, 2, b.h - 2);
    }
  });

  // 6B. Gelombang Kejut AoE (Mushroom Shockwave & Fire Blast)
  aoeClouds.forEach(c => {
    let progress = 1.0 - c.life;
    let r = c.maxRadius * (0.25 + 0.75 * Math.sin(progress * Math.PI / 2));
    if (c.isNuclear) {
      // Emerald Green Nuclear Radiation Shockwave
      ctx.fillStyle = 'rgba(34, 197, 94, ' + (c.life * 0.42) + ')';
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(187, 247, 208, ' + (c.life * 0.9) + ')';
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke();
    } else {
      // Fiery Megabomb Hellstorm Shockwave
      ctx.fillStyle = 'rgba(239, 68, 68, ' + (c.life * 0.4) + ')';
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(254, 240, 138, ' + (c.life * 0.95) + ')';
      ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke();
    }
  });

  // 6C. Bom Fisik Megabomb Sedang Menukik Jatuh
  activeBombs.forEach(b => {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.scale, b.scale);
    // Bayangan Bom
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(6, 8, 8, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Bodi Bom Silinder Baja Gelap
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-5, -10, 10, 20);
    ctx.fillStyle = '#334155'; ctx.fillRect(-4, -9, 8, 18);
    ctx.fillStyle = '#64748b'; ctx.fillRect(-2, -9, 3, 18); // Highlight
    ctx.fillStyle = '#eab308'; ctx.fillRect(-4, -2, 8, 3); // Hazard Yellow Band
    ctx.fillStyle = '#18181b'; ctx.fillRect(-2, -2, 2, 3); ctx.fillRect(2, -2, 2, 3);

    // Sirip Stabilisator Ekor
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.moveTo(-8, 9); ctx.lineTo(-4, 4); ctx.lineTo(-4, 10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, 9); ctx.lineTo(4, 4); ctx.lineTo(4, 10); ctx.closePath(); ctx.fill();

    // Moncong Hulu Ledak Merah
    ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(0, -9, 4.5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fef08a'; ctx.fillRect(-1, -12, 2, 3);
    ctx.restore();
  });

  // 6D. Rudal Pemain (16-Bit Handcrafted Pixel Art Seibu Kaihatsu)
  missiles.forEach(m => {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.ang + Math.PI / 2); // Putar menghadap arah vektor terbang

    // Bayangan Rudal di Tanah
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(4, 5, m.w, m.h);

    if (m.type === 'NUCLEAR') {
      // ==========================================
      // RUDAL NUKLIR (M - GREEN HEAVY MISSILE)
      // Dimensi Visual: 10x24px, Hulu Ledak Runcing, Sabuk Hazard, Api Pendorong
      // ==========================================
      let flamePulsing = 7 + (Math.sin(stageTime * 45 + m.x) * 4 + 4);

      // Api Pendorong Belakang (Exhaust Thruster Flame)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-3, 11); ctx.lineTo(3, 11); ctx.lineTo(0, 11 + flamePulsing);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-1.5, 11); ctx.lineTo(1.5, 11); ctx.lineTo(0, 11 + flamePulsing * 0.6);
      ctx.closePath(); ctx.fill();

      // Sirip Stabilisator Sayap Delta (Dark Green Fins)
      ctx.fillStyle = '#052e16';
      ctx.beginPath();
      ctx.moveTo(-7, 10); ctx.lineTo(-2, 3); ctx.lineTo(-2, 11);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(7, 10); ctx.lineTo(2, 3); ctx.lineTo(2, 11);
      ctx.closePath(); ctx.fill();

      // Nozzle Roket Baja Gelap
      ctx.fillStyle = '#1e293b'; ctx.fillRect(-3, 9, 6, 2);

      // Bodi Tabung Rudal Hijau Militer (Shaded 16-Bit)
      ctx.fillStyle = '#14532d'; ctx.fillRect(-4, -6, 8, 15); // Shadow
      ctx.fillStyle = '#16a34a'; ctx.fillRect(-2, -6, 5, 15); // Base
      ctx.fillStyle = '#4ade80'; ctx.fillRect(-1, -6, 2, 15); // Highlight

      // Sabuk Peringatan Hazard Kuning-Hitam
      ctx.fillStyle = '#eab308'; ctx.fillRect(-4, 0, 8, 2);
      ctx.fillStyle = '#18181b'; ctx.fillRect(-2, 0, 2, 2); ctx.fillRect(2, 0, 2, 2);

      // Lambang Nuklir / Radiasi Merah di Tengah
      ctx.fillStyle = '#dc2626'; ctx.fillRect(-1, 4, 2, 2);

      // Moncong Kerucut Aerodinamis (Olive Warhead Cone)
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, -15); ctx.lineTo(-4, -6); ctx.lineTo(4, -6);
      ctx.closePath(); ctx.fill();

      // Kilau Cahaya Moncong
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, -15); ctx.lineTo(-1, -6); ctx.lineTo(1, -6);
      ctx.closePath(); ctx.fill();

      // Ujung Perak Titanium
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(-1, -14, 2, 3);

    } else {
      // ==========================================
      // RUDAL HOMING (H - SLEEK GOLD/YELLOW INTERCEPTOR)
      // Profil Ramping Aerodinamis, Sensor Dome Cyan, Api Jet Biru Supersonik
      // ==========================================
      let flamePulsing = 7 + (Math.sin(stageTime * 50 + m.x) * 3 + 3);

      // Api Pendorong Jet Biru-Putih Supersonik
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(-2.5, 9); ctx.lineTo(2.5, 9); ctx.lineTo(0, 9 + flamePulsing);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-1, 9); ctx.lineTo(1, 9); ctx.lineTo(0, 9 + flamePulsing * 0.55);
      ctx.closePath(); ctx.fill();

      // Sirip Ekor Belakang Lancip (Swept Tail Fins)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-6, 8); ctx.lineTo(-2, 2); ctx.lineTo(-2, 9);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, 8); ctx.lineTo(2, 2); ctx.lineTo(2, 9);
      ctx.closePath(); ctx.fill();

      // Nozzle Ekor
      ctx.fillStyle = '#1e293b'; ctx.fillRect(-2, 7, 4, 2);

      // Bodi Emas / Kuning Aerodinamis
      ctx.fillStyle = '#b45309'; ctx.fillRect(-3, -5, 6, 12); // Shadow
      ctx.fillStyle = '#f59e0b'; ctx.fillRect(-2, -5, 4, 12); // Base gold
      ctx.fillStyle = '#fef08a'; ctx.fillRect(-1, -5, 2, 12); // Specular highlight

      // Cincin Aksen Merah Raiden di Belakang
      ctx.fillStyle = '#dc2626'; ctx.fillRect(-3, 2, 6, 2);

      // Sirip Kemudi Canard Depan (Forward Canards)
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-4, -4, 2, 2); ctx.fillRect(2, -4, 2, 2);

      // Kubah Sensor Pelacak Inframerah (Cyan Seeker Lens)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(-3, -5); ctx.lineTo(3, -5);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(-1, -5); ctx.lineTo(1, -5);
      ctx.closePath(); ctx.fill();

      // Glint Putih Lensa Sensor
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-0.5, -11, 1, 2);
    }

    ctx.restore();
  });

  // 7. Peluru Musuh Oranye Terang
  enemyBullets.forEach(eb => {
    ctx.fillStyle = '#c2410c'; ctx.beginPath(); ctx.arc(eb.x, eb.y, eb.r + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fef08a'; ctx.fillRect(eb.x - 1, eb.y - 1, 2, 2);
  });

  // 8. Powerup Badges
  powerups.forEach(p => {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
    let col = p.type === 'VULCAN' ? '#dc2626' : (p.type === 'LASER' ? '#2563eb' : (p.type === 'NUCLEAR' ? '#16a34a' : (p.type === 'HOMING' ? '#ca8a04' : '#ea580c')));
    ctx.fillStyle = col; ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let char = p.type === 'VULCAN' ? 'P' : (p.type === 'LASER' ? 'L' : (p.type === 'NUCLEAR' ? 'M' : (p.type === 'HOMING' ? 'H' : 'B')));
    ctx.fillText(char, p.x, p.y);
  });

  // 9. Peri Rahasia (Secret Fairy) jika aktif
  if (fairyActive) {
    ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(fairyX, fairyY, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fairyX - 3, fairyY - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fairyX + 3, fairyY - 2, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // 10. Pesawat Pemain "Fighting Thunder" (16-Bit Sprite Murni)
  if (player.invulnerableTime <= 0 || Math.floor(stageTime * 12) % 2 === 0) {
    let px = player.x, py = player.y;
    let b = player.bankAngle;

    // Semburan Pendorong Api (Twin Thrusters)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px - 5, py + 14, 3, 6 + Math.random() * 4);
    ctx.fillRect(px + 2, py + 14, 3, 6 + Math.random() * 4);

    // Bayangan Jet
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(px + 10, py + 15, 14, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Garis Luar Hitam Sayap Delta
    ctx.fillStyle = '#180404';
    ctx.beginPath();
    ctx.moveTo(px, py - 18);
    ctx.lineTo(px + 17 + b * 2, py + 12);
    ctx.lineTo(px + 12 + b * 2, py + 15);
    ctx.lineTo(px, py + 18);
    ctx.lineTo(px - 12 + b * 2, py + 15);
    ctx.lineTo(px - 17 + b * 2, py + 12);
    ctx.closePath(); ctx.fill();

    // Bodi Sayap Merah Crimson (Raiden Red)
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(px, py - 16);
    ctx.lineTo(px + 15 + b * 2, py + 10);
    ctx.lineTo(px, py + 15);
    ctx.lineTo(px - 15 + b * 2, py + 10);
    ctx.closePath(); ctx.fill();

    // Bodi Armor Merah Terang
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(px, py - 14);
    ctx.lineTo(px + 8, py + 4);
    ctx.lineTo(px + 12, py + 10);
    ctx.lineTo(px, py + 12);
    ctx.lineTo(px - 12, py + 10);
    ctx.lineTo(px - 8, py + 4);
    ctx.closePath(); ctx.fill();

    // Ujung Meriam Sayap Kuning
    ctx.fillStyle = '#eab308';
    ctx.fillRect(px - 17 + b * 2, py + 4, 2, 8);
    ctx.fillRect(px + 15 + b * 2, py + 4, 2, 8);

    // Kokpit Kaca Biru Langit
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(px, py - 12); ctx.lineTo(px + 4, py - 2); ctx.lineTo(px - 4, py - 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 1, py - 9, 2, 3);

    // Titik Core Hitbox Visual 6x6 (Bullet Grazing Reference)
    ctx.fillStyle = '#facc15'; ctx.fillRect(px - 3, py - 3, 6, 6);
    ctx.fillStyle = '#dc2626'; ctx.fillRect(px - 1, py - 1, 2, 2);
  }

  // 11. Bayangan Awan Parallax (Cloud Shadows)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  clouds.forEach(c => {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 12. Partikel Ledakan
  particles.forEach(pt => {
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * pt.life, 0, Math.PI * 2); ctx.fill();
  });

  // 13. Teks Melayang (Score Popups)
  floatingTexts.forEach(ft => {
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  });

  // 14. HUD Tate-Mode Otentik 1990
  ctx.fillStyle = '#facc15'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left';
  ctx.fillText('1P: ' + String(player.score).padStart(6, '0'), 14, 20);

  ctx.fillStyle = '#ef4444'; ctx.font = '12px monospace';
  ctx.fillText('HP: ' + player.hp + '% [' + '♥'.repeat(Math.max(0, player.lives)) + ']', 14, 36);

  ctx.fillStyle = player.mainWeapon === 'VULCAN' ? '#ef4444' : '#38bdf8';
  ctx.font = 'bold 12px monospace'; ctx.textAlign = 'right';
  ctx.fillText(player.mainWeapon + ' LV' + player.weaponLevel + '/8', CANVAS_W - 14, 20);

  ctx.fillStyle = player.subWeapon === 'NUCLEAR' ? '#22c55e' : (player.subWeapon === 'HOMING' ? '#facc15' : '#64748b');
  ctx.font = 'bold 11px monospace';
  ctx.fillText('SUB: ' + player.subWeapon + ' [LV' + Math.max(1, player.subLevel) + ']', CANVAS_W - 14, 36);

  ctx.fillStyle = '#eab308'; ctx.textAlign = 'left';
  ctx.fillText('BOMB: ' + '● '.repeat(player.bombs), 14, 52);

  ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'center'; ctx.font = 'bold 12px monospace';
  ctx.fillText(boss ? 'WARNING: BOSS' : 'STAGE 1', CANVAS_W / 2, 20);
}

// --------------------------------------------------------------
// 7. INITIALIZE ENGINE RUNNER
// --------------------------------------------------------------
function initRaidenEngine() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  mapCacheCanvas = generateRaidenMap();

  // Input Listeners
  window.addEventListener('keydown', e => {
    AudioFX.init();
    keys[e.code] = true;
    if (e.code === 'KeyB') dropMegabomb();
    if (e.code === 'KeyX' || e.code === 'KeyM') {
      player.subWeapon = player.subWeapon === 'HOMING' ? 'NUCLEAR' : 'HOMING';
      AudioFX.playPowerup();
      addFloatingText(player.x, player.y - 25, 'SUB: ' + player.subWeapon + ' MISSILE', player.subWeapon === 'NUCLEAR' ? '#22c55e' : '#facc15');
    }
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
  });
  canvas.addEventListener('mousedown', e => {
    AudioFX.init();
    isMouseDown = true;
    if (e.button === 2) {
      e.preventDefault();
      dropMegabomb();
    }
  });
  canvas.addEventListener('mouseup', () => { isMouseDown = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // Touch Support
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    mouseX = (e.touches[0].clientX - rect.left) * scaleX;
    mouseY = (e.touches[0].clientY - rect.top) * scaleY;
    isMouseDown = true;
  }, { passive: false });
  canvas.addEventListener('touchstart', e => {
    AudioFX.init();
    isMouseDown = true;
  });
  canvas.addEventListener('touchend', () => { isMouseDown = false; });

  // Main 60 FPS Loop
  function loop(currentTime) {
    let dt = (currentTime - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1; // Cap spiral of death
    lastTime = currentTime;

    updateGame(dt);
    drawGame(ctx);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

window.onload = initRaidenEngine;
`;

// --------------------------------------------------------------
// SETUP EDITOR KODE & LINE NUMBERS
// --------------------------------------------------------------
const codeEditor = document.getElementById('code-editor');
const lineNumbers = document.getElementById('line-numbers');

function updateLineNumbers() {
  if (!codeEditor || !lineNumbers) return;
  const lines = codeEditor.value.split('\n').length;
  let lineHtml = '';
  for (let i = 1; i <= lines; i++) {
    lineHtml += i + '<br>';
  }
  lineNumbers.innerHTML = lineHtml;
}

if (codeEditor) {
  codeEditor.value = defaultGameCode;
  updateLineNumbers();

  codeEditor.addEventListener('input', updateLineNumbers);
  codeEditor.addEventListener('scroll', () => {
    if (lineNumbers) lineNumbers.scrollTop = codeEditor.scrollTop;
  });

  // Support Tab Key in Textarea
  codeEditor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2;
      updateLineNumbers();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runGameCode();
    }
  });
}

// --------------------------------------------------------------
// EKSEKUSI GAME KE IFRAME PREVIEW (ZERO CDN - 100% RELIABLE)
// --------------------------------------------------------------
function runGameCode() {
  if (!codeEditor) return;
  const userCode = codeEditor.value;
  const iframe = document.getElementById('game-iframe');
  if (!iframe) return;

  const iframeHtml = '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '  <meta charset="UTF-8">' +
    '  <style>' +
    '    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }' +
    '    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }' +
    '    canvas {' +
    '      width: 100%; height: 100%; object-fit: contain;' +
    '      image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;' +
    '      background: #000; cursor: crosshair;' +
    '    }' +
    '    #error-overlay {' +
    '      display: none; position: absolute; inset: 10px; background: rgba(15, 23, 42, 0.95);' +
    '      border: 2px solid #ef4444; border-radius: 6px; color: #f87171; padding: 16px;' +
    '      font-family: monospace; font-size: 12px; line-height: 1.5; overflow: auto; z-index: 99;' +
    '    }' +
    '  </style>' +
    '</head>' +
    '<body>' +
    '  <canvas id="game-canvas" width="450" height="600"></canvas>' +
    '  <div id="error-overlay"></div>' +
    '  <script>' +
    '    window.onerror = function(msg, url, line, col, err) {' +
    '      const errBox = document.getElementById("error-overlay");' +
    '      if (errBox) {' +
    '        errBox.style.display = "block";' +
    '        errBox.innerHTML = "<strong style=\\"color: #ffffff; font-size: 13px;\\">[KESALAHAN SINTAKS / RUNTIME]</strong><br><br>" +' +
    '          "<strong>Pesan:</strong> " + msg + "<br>" +' +
    '          "<strong>Baris:</strong> " + line + " : Kolom: " + col + "<br><br>" +' +
    '          "<span style=\\"color: #94a3b8;\\">" + (err && err.stack ? err.stack : "") + "</span>";' +
    '      }' +
    '    };' +
    '    try {' +
    userCode +
    '    } catch(err) {' +
    '      window.onerror(err.message, "", 0, 0, err);' +
    '    }' +
    '  <' + '/script>' +
    '</body>' +
    '</html>';

  iframe.srcdoc = iframeHtml;
}

// --------------------------------------------------------------
// SISTEM DOWNLOAD FILE MANDIRI (HTML, CSS, JS, & ZIP)
// --------------------------------------------------------------
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadTextFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

// CRC32 Table Generator untuk zip
const crcTable = (() => {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }
  return table;
})();

function computeCRC32(bytes) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createZipArchive(files) {
  const encoder = new TextEncoder();
  const fileRecords = [];
  const chunks = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = computeCRC32(dataBytes);
    const size = dataBytes.length;

    // Local Header (30 bytes + name)
    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    header.set(nameBytes, 30);

    fileRecords.push({ nameBytes, crc, size, offset });
    chunks.push(header);
    chunks.push(dataBytes);
    offset += header.length + dataBytes.length;
  }

  // Central Directory
  const cdStart = offset;
  let cdSize = 0;
  for (const rec of fileRecords) {
    const cdHeader = new Uint8Array(46 + rec.nameBytes.length);
    const view = new DataView(cdHeader.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, rec.crc, true);
    view.setUint32(20, rec.size, true);
    view.setUint32(24, rec.size, true);
    view.setUint16(28, rec.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, rec.offset, true);
    cdHeader.set(rec.nameBytes, 46);

    chunks.push(cdHeader);
    cdSize += cdHeader.length;
  }

  // End of Central Directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, fileRecords.length, true);
  eocdView.setUint16(10, fileRecords.length, true);
  eocdView.setUint32(12, cdSize, true);
  eocdView.setUint32(16, cdStart, true);
  eocdView.setUint16(20, 0, true);
  chunks.push(eocd);

  return new Blob(chunks, { type: 'application/zip' });
}

// Data Konten File Modul-01 untuk Download Langsung
async function fetchFileContent(path, fallback) {
  try {
    const res = await fetch(path);
    if (res.ok) return await res.text();
  } catch (e) {
    // fallback
  }
  return fallback;
}

const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modul 01: Raiden (1990) 16-Bit Retro Arcade - Workbench</title>
  <!-- Menghubungkan CSS Terpisah: modul-01.css -->
  <link rel="stylesheet" href="modul-01.css">
</head>
<body>
  <div class="app-container">
    
    <!-- Top Header Bar -->
    <header class="app-header">
      <div class="header-left">
        <div class="status-dot"></div>
        <span class="app-title">RAIDEN (1990) ARCADES</span>
        <span class="badge-module">MODUL-01</span>
        <span class="badge-retro">16-BIT RETRO ENGINE</span>
      </div>
      <div class="header-actions">
        <button id="download-btn" class="btn btn-download" title="Download berkas modul-01 (HTML, JS, CSS, atau ZIP)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Modul-01
        </button>
        <button id="reset-btn" class="btn btn-secondary" title="Kembalikan kode ke pengaturan default GDD">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reset Kode GDD
        </button>
        <button id="run-btn" class="btn btn-primary" title="Eksekusi dan mulai game (Ctrl+Enter)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z"/>
          </svg>
          Jalankan &amp; Tembak!
        </button>
      </div>
    </header>

    <!-- Split Screen Workspace -->
    <main class="workspace">
      
      <!-- Sisi Kiri: Code Editor (50%) -->
      <section class="panel-editor">
        <div class="editor-tab-bar">
          <div class="editor-tab">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            game.js
          </div>
          <div class="editor-hints">Native Canvas 2D · Zero CDN · Ctrl+Enter untuk Eksekusi</div>
        </div>
        <div class="editor-wrapper">
          <div id="line-numbers" class="line-numbers"></div>
          <textarea id="code-editor" spellcheck="false" wrap="off"></textarea>
        </div>
      </section>

      <!-- Sisi Kanan: Game Preview (50%) -->
      <section class="panel-preview">
        <div class="preview-tab-bar">
          <span class="preview-info">Tate-Mode 3:4 Arcade Screen (Crisp Pixel-Art 60FPS)</span>
          <span style="color: #4ade80;">WASD/Mouse · Spasi Tembak · [X] Ganti Roket M/H · [B] Bom</span>
        </div>
        <div class="arcade-cabinet-viewport">
          <div class="arcade-bezel">
            <div class="crt-overlay"></div>
            <iframe id="game-iframe" sandbox="allow-scripts" title="Raiden Game Canvas"></iframe>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- Menghubungkan JS Terpisah: modul-01.js -->
  <script src="modul-01.js"></script>
</body>
</html>`;

// Setup Event Listeners saat DOM Siap
document.addEventListener('DOMContentLoaded', () => {
  // Tombol Run & Reset
  const runBtn = document.getElementById('run-btn');
  const resetBtn = document.getElementById('reset-btn');
  if (runBtn) runBtn.addEventListener('click', runGameCode);
  if (resetBtn && codeEditor) {
    resetBtn.addEventListener('click', () => {
      codeEditor.value = defaultGameCode;
      updateLineNumbers();
      runGameCode();
    });
  }

  // Modal Download
  const downloadBtn = document.getElementById('download-btn');
  const downloadModal = document.getElementById('download-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (downloadBtn && downloadModal) {
    downloadBtn.addEventListener('click', () => {
      downloadModal.classList.add('active');
    });
  }

  if (modalCloseBtn && downloadModal) {
    modalCloseBtn.addEventListener('click', () => {
      downloadModal.classList.remove('active');
    });
  }

  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) downloadModal.classList.remove('active');
    });
  }

  // Tombol Download Masing-Masing File
  const dlHtmlBtn = document.getElementById('dl-html-btn');
  const dlCssBtn = document.getElementById('dl-css-btn');
  const dlJsBtn = document.getElementById('dl-js-btn');
  const dlZipBtn = document.getElementById('dl-zip-btn');

  if (dlHtmlBtn) {
    dlHtmlBtn.addEventListener('click', async () => {
      const content = await fetchFileContent('modul-01.html', htmlTemplate);
      downloadTextFile(content, 'modul-01.html', 'text/html');
    });
  }

  if (dlCssBtn) {
    dlCssBtn.addEventListener('click', async () => {
      const content = await fetchFileContent('modul-01.css', '/* modul-01.css */');
      downloadTextFile(content, 'modul-01.css', 'text/css');
    });
  }

  if (dlJsBtn) {
    dlJsBtn.addEventListener('click', async () => {
      const content = await fetchFileContent('modul-01.js', '// modul-01.js');
      downloadTextFile(content, 'modul-01.js', 'text/javascript');
    });
  }

  if (dlZipBtn) {
    dlZipBtn.addEventListener('click', async () => {
      const htmlContent = await fetchFileContent('modul-01.html', htmlTemplate);
      const cssContent = await fetchFileContent('modul-01.css', '/* modul-01.css */');
      const jsContent = await fetchFileContent('modul-01.js', '// modul-01.js');

      const readme = `==============================================================
MODUL 01: RAIDEN (1990) 16-BIT RETRO ARCADE WORKBENCH
==============================================================

Folder ini berisi 3 file yang sudah dipecah secara modular:
1. modul-01.html - Struktur halaman antarmuka web & layar arkade
2. modul-01.css  - Desain layout split-screen, editor, & bezel arkade
3. modul-01.js   - Logika engine game Raiden Canvas 2D murni & editor

CARA MENJALANKAN DI KOMPUTER LOKAL:
- Cukup klik dua kali (double click) pada file "modul-01.html".
- Game dan editor akan langsung terbuka dan berjalan mulus 60 FPS
  di semua peramban (Chrome, Edge, Firefox, Safari) tanpa perlu
  koneksi internet ataupun server khusus (Zero CDN / Zero Dependencies).

KONTROL GAME:
- WASD / Tombol Panah: Gerak Pesawat Fighting Thunder
- Mouse / Sentuh Layar: Mengarahkan pesawat
- Spasi / Klik Kiri: Menembakkan Senjata Utama & Rudal
- [X] atau [M]: Berganti Rudal (Nuclear Missile M <-> Homing Missile H)
- [B] atau Klik Kanan: Meluncurkan Tactical Megabomb (Screen Clear)
`;

      const files = [
        { name: 'modul-01.html', content: htmlContent },
        { name: 'modul-01.css', content: cssContent },
        { name: 'modul-01.js', content: jsContent },
        { name: 'README.txt', content: readme }
      ];

      const zipBlob = createZipArchive(files);
      downloadBlob(zipBlob, 'modul-01.zip');
    });
  }

  // Jalankan game otomatis
  setTimeout(runGameCode, 150);
});
