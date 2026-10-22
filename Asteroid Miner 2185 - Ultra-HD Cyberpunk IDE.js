/**
 * Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE
 * Full-Featured Canvas 2D Arcade Engine + Web Audio Synthesizer + Live Scripting IDE
 * All 6 Visual Formulas + 100% Offline Download System (ZIP & Single-File Standalone)
 */

// ==========================================
// 1. WEB AUDIO SYNTHESIZER ENGINE
// ==========================================
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  laser(mode = 'pulse') {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (mode === 'plasma') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      } else if (mode === 'extractor') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, t);
        osc.frequency.linearRampToValueAtTime(1050, t + 0.08);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      } else if (mode === 'quad') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      } else {
        // Default Pulse Gatling
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(920, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 0.12);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      }
    } catch {}
  }

  missile() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(740, t + 0.35);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {}
  }

  singularity() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(320, t + 0.8);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.9);
    } catch {}
  }

  explosion(isBig = false) {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const dur = isBig ? 0.7 : 0.3;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isBig ? 400 : 700, t);
      filter.frequency.exponentialRampToValueAtTime(50, t + dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isBig ? 0.55 : 0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch {}
  }

  pickup() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587, t);
      osc.frequency.setValueAtTime(880, t + 0.05);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {}
  }

  powerup() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.06);
        gain.gain.setValueAtTime(0.12, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.12);
      });
    } catch {}
  }

  combo() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.linearRampToValueAtTime(1320, t + 0.15);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch {}
  }

  dock() {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(554, t + 0.1);
      osc.frequency.setValueAtTime(659, t + 0.2);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } catch {}
  }
}

const sounds = new SoundSystem();

// ==========================================
// 2. CODE PRESETS & SNIPPETS
// ==========================================
const CODE_PRESETS = {
  default: `// ASTEROID MINER 2185 - DEFAULT MINER SPECS
// Modifikasi objek player, cargo, dan laserModes secara real-time!

player.name = "Starlight-V1";
player.thrustPower = 0.20;
player.maxSpeed = 6.5;
player.rotationSpeed = 0.068;
player.friction = 0.985;
player.magnetRadius = 160;

cargo.maxCapacity = 120;

// Konfigurasi Laser Penambang
laserModes.pulse.damage = 42;
laserModes.pulse.fireRate = 130; // ms
laserModes.pulse.heatPerShot = 6;

laserModes.plasma.damage = 110;
laserModes.plasma.heatPerShot = 18;

console.log("✓ Spesifikasi Default Starlight-V1 berhasil diterapkan.");
`,

  heavy_hauler: `// PRESET: TITAN HEAVY HAULER
// Dirancang untuk penambangan berdurasi panjang dengan kargo raksasa

player.name = "Titan-Carrier 9000";
player.maxHealth = 320;
player.health = Math.min(player.health + 120, 320);
player.maxShield = 250;
player.shield = 250;
player.thrustPower = 0.14;
player.maxSpeed = 4.4;
player.friction = 0.988;
player.magnetRadius = 260; // Medan traktor super luas

cargo.maxCapacity = 500; // Kapasitas raksasa

laserModes.extractor.damage = 22;
laserModes.extractor.speed = 22;

console.log("✓ Titan Heavy Hauler siap: Kapasitas kargo 500T & Medan Magnet 260px.");
`,

  laser_master: `// PRESET: LASER MASTER OVERLOAD
// Menghilangkan batasan panas laser dan meningkatkan firerate drastis

player.name = "Photon-Wraith";
player.coolingRate = 1.4; // Pendingin laser 3x lebih cepat

laserModes.pulse.damage = 75;
laserModes.pulse.fireRate = 75;
laserModes.pulse.heatPerShot = 2; // Hampir bebas overheat!

laserModes.plasma.damage = 200;
laserModes.plasma.fireRate = 200;
laserModes.plasma.speed = 18;

console.log("✓ Modul Laser Master aktif: Firerate tinggi & Cooldown instan.");
`,

  speed_miner: `// PRESET: SPEED INTERCEPTOR
// Kecepatan supersonik dan manuver lincah menembus badai asteroid

player.name = "Hyperion-Interceptor";
player.thrustPower = 0.36;
player.maxSpeed = 11.0;
player.rotationSpeed = 0.098;
player.friction = 0.978;
player.magnetRadius = 190;

laserModes.pulse.fireRate = 90;
player.missileCooldownTime = 2000; // Misil siap setiap 2 detik

console.log("✓ Kecepatan interceptor dikalibrasi: MaxSpeed 11.0, Thrust 0.36.");
`,

  neon_overdrive: `// PRESET: CYBERPUNK NEON OVERDRIVE
// Mode tempur berdaya tinggi: Perisai 300, Misil cooldown 1 detik, Tri-shot!

player.name = "Overdrive-2185";
player.shield = 300;
player.maxShield = 300;
player.magnetRadius = 340;
player.thrustPower = 0.30;
player.maxSpeed = 9.0;

laserModes.pulse.damage = 70;
laserModes.plasma.damage = 180;
player.missileCooldownTime = 1000;

console.log("⚡ CYBERPUNK OVERDRIVE AKTIF! Perisai 300 & Misil Singularity 1s.");
`
};

const SNIPPETS = {
  afterburner: `\n// [Snippet] Hyper Afterburner\nplayer.thrustPower = 0.45;\nplayer.maxSpeed = 12.0;\nconsole.log("⚡ Hyper Afterburner aktif!");\n`,
  magnet: `\n// [Snippet] Super Quantum Magnet\nplayer.magnetRadius = 380;\nconsole.log("🧲 Medan traktor magnet ditingkatkan ke 380px!");\n`,
  godmode: `\n// [Snippet] God Mode Hull & Shield\nplayer.health = 999;\nplayer.maxHealth = 999;\nplayer.shield = 999;\nplayer.maxShield = 999;\nconsole.log("🛡️ God Mode aktif!");\n`,
  singularity: `\n// [Snippet] Infinite Singularity Missiles\nplayer.missileCooldownTime = 500;\nconsole.log("🌀 Misil Singularity siap setiap 0.5 detik!");\n`,
  overclock: `\n// [Snippet] Laser Overclock\nlaserModes.pulse.damage = 120;\nlaserModes.pulse.fireRate = 50;\nconsole.log("🌈 Laser Overclock diaktifkan!");\n`
};

// ==========================================
// 3. GAME STATE & SIMULATION CONSTANTS
// ==========================================
const ORE_TYPES = {
  iron: { name: 'Besi (Fe)', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.7)', value: 20, rarity: 0.55 },
  gold: { name: 'Emas (Au)', color: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)', value: 60, rarity: 0.25 },
  platinum: { name: 'Platina (Pt)', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.85)', value: 160, rarity: 0.14 },
  uranium: { name: 'Uranium (U)', color: '#00ff88', glow: 'rgba(0, 255, 136, 0.95)', value: 400, rarity: 0.06 }
};

const POWERUP_TYPES = [
  { type: 'triple_laser', label: 'TRIPLE LASER', duration: 10000, color: '#00f0ff', icon: '⚡' },
  { type: 'shield_boost', label: 'SHIELD OVERLOAD', duration: 8000, color: '#38bdf8', icon: '🛡️' },
  { type: 'hyper_magnet', label: 'HYPER MAGNET', duration: 12000, color: '#b026ff', icon: '🧲' },
  { type: 'nuke', label: 'QUANTUM PULSE', duration: 1000, color: '#ff2a5f', icon: '💥' }
];

const gameState = {
  started: false,
  gameOver: false,
  paused: false,
  score: 0,
  credits: 250,
  time: 0,
  screenShake: 0,
  threatLevel: 1,

  // Settings & visual toggles (from Tech Inspector)
  settings: {
    dpiScaling: true,
    dualLayerGlow: true,
    vectorPolygons: true,
    particlePhysics: true,
    cyberpunkPalette: true,
    sineOscillations: true,
    screenShakeEnabled: true,
    crtScanlines: false,
    glowBlur: 16,
    coreBrightness: 1.0,
    particleDamping: 0.94,
    sineSpeed: 1.0
  },

  // Combo system
  combo: {
    multiplier: 1,
    timer: 0,
    maxTime: 4000
  },

  // Active temporary buffs
  buffs: {},

  // Missions
  missions: [
    { id: 'fe_10', title: 'Tambang 10 Besi', target: 10, current: 0, type: 'mine_iron', reward: 300, done: false },
    { id: 'au_4', title: 'Kumpulkan 4 Emas', target: 4, current: 0, type: 'mine_gold', reward: 500, done: false },
    { id: 'raider_2', title: 'Hancurkan 2 Raider Perompak', target: 2, current: 0, type: 'kill_raider', reward: 800, done: false }
  ],

  // Entities
  player: {
    name: 'Starlight-V1',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    fuel: 100,
    maxFuel: 100,
    heat: 0,
    maxHeat: 100,
    isOverheated: false,
    coolingRate: 0.48,
    thrustPower: 0.20,
    maxSpeed: 6.5,
    rotationSpeed: 0.068,
    friction: 0.985,
    magnetRadius: 160,
    lastFired: 0,
    lastMissileFired: 0,
    missileCooldownTime: 4000,
    currentWeapon: 'pulse', // pulse, plasma, extractor, quad
    droneCount: 0,
    shieldHitAnim: 0
  },

  cargo: {
    maxCapacity: 120,
    stored: {
      iron: 0,
      gold: 0,
      platinum: 0,
      uranium: 0
    }
  },

  laserModes: {
    pulse: { name: 'BEAM PULSE GATLING', damage: 42, fireRate: 130, heatPerShot: 6, color: '#00f0ff', coreColor: '#ffffff', speed: 16 },
    plasma: { name: 'HEAVY PLASMA CANNON', damage: 110, fireRate: 260, heatPerShot: 18, color: '#ff007f', coreColor: '#ffffff', speed: 13 },
    extractor: { name: 'CRYO MINING BEAM', damage: 18, fireRate: 80, heatPerShot: 3, color: '#00ff88', coreColor: '#ffffff', speed: 19 },
    quad: { name: 'TACHYON QUAD SPLITTER', damage: 32, fireRate: 160, heatPerShot: 10, color: '#b026ff', coreColor: '#ffffff', speed: 17 }
  },

  projectiles: [],
  missiles: [],
  singularities: [],
  enemyProjectiles: [],
  asteroids: [],
  crystals: [],
  powerups: [],
  particles: [],
  floatingTexts: [],
  enemies: [],
  boss: null,
  drones: [],
  station: {
    x: 0,
    y: 0,
    radius: 95,
    rotation: 0,
    ringSpeed: 0.005
  },
  stars: []
};

// Input State
const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  mouseX: 0,
  mouseY: 0,
  mouseInCanvas: false
};

// ==========================================
// 4. DOM REFERENCES & INITIALIZATION
// ==========================================
const dom = {};

window.addEventListener('DOMContentLoaded', () => {
  const ids = [
    'appHeader', 'btnOpenTechLab', 'btnOpenDownloadModal', 'btnSplit50', 'btnSplit3565', 'btnSplit6535', 'btnSplitFull',
    'btnRunGlobal', 'btnToggleSound', 'btnShowHelp', 'workspace', 'codePane', 'syntaxStatus',
    'btnSnippetMenu', 'snippetDropdown', 'btnCopyCode', 'btnResetCode', 'btnRunCode',
    'lineNumbers', 'codeTextarea', 'terminalDrawer', 'btnClearTerminal', 'terminalLogs',
    'splitDivider', 'gamePane', 'sectorThreatLevel', 'btnDockStation', 'btnOpenMarket',
    'btnRestartGame', 'btnRestoreCode', 'gameContainer', 'gameCanvas', 'bossBarContainer',
    'bossHpPercent', 'bossHpFill', 'emergencyAlarm', 'hud', 'shieldPercent', 'shieldFill',
    'healthPercent', 'healthFill', 'fuelPercent', 'fuelFill', 'comboBanner',
    'comboMultiplierText', 'comboTimerFill', 'activeBuffsContainer', 'creditsDisplay',
    'cargoDisplay', 'scoreDisplay', 'missionWidget', 'missionsList', 'weaponNameDisplay',
    'overheatPercent', 'overheatFill', 'missileStatus', 'missileFill', 'countIron',
    'countGold', 'countPlatinum', 'countUranium', 'miniMapCanvas', 'mobileControls',
    'btnTouchThrust', 'btnTouchMissile', 'btnTouchMarket', 'btnTouchSwitch', 'btnTouchFire',
    'startScreen', 'btnStartGame', 'gameOverScreen', 'finalCreditsDisplay', 'finalScoreDisplay',
    'btnRestartAfterGameOver', 'marketModal', 'btnCloseMarket', 'marketCredits', 'marketCargoSpace',
    'btnSellAllOre', 'marketFeQty', 'marketAuQty', 'marketPtQty', 'marketUQty',
    'btnSellIron', 'btnSellGold', 'btnSellPlatinum', 'btnSellUranium', 'btnBuyRepair',
    'btnBuyFuel', 'btnBuyCargo', 'btnBuyDrone', 'btnBuyCooler', 'btnBuyMagnet',
    'btnCloseMarketBottom', 'techModal', 'tabBtnTechniques', 'tabBtnSandbox', 'btnCloseTechModal',
    'tabContentTechniques', 'btnEnableAllTech', 'techCardsGrid', 'tabContentSandbox', 'sandboxCanvas',
    'valGlowBlur', 'sliderGlowBlur', 'valCoreBrightness', 'sliderCoreBrightness',
    'valParticleDamping', 'sliderParticleDamping', 'valSineSpeed', 'sliderSineSpeed',
    'checkScreenShake', 'checkCrtScanlines', 'btnCloseTechModalBottom', 'downloadModal',
    'btnCloseDownloadModal', 'btnDownloadZip', 'btnDownloadSingleHtml', 'btnDlHtmlOnly',
    'btnDlCssOnly', 'btnDlJsOnly', 'helpModal', 'btnCloseHelp', 'btnCloseHelpBottom'
  ];

  ids.forEach(id => {
    dom[id] = document.getElementById(id);
  });

  initApp();
});

function initApp() {
  initCodeEditor();
  initTechCards();
  initDownloadHandlers();
  initCanvas();
  initEventListeners();
  initBackgroundStars();
  spawnWorldObjects();
  renderMissions();
  requestAnimationFrame(gameLoop);

  logToTerminal('System Initialized: Asteroid Miner 2185 Ultra-HD Canvas 2D.', 'info');
  logToTerminal('Offline Mode Ready: Gunakan tombol "DOWNLOAD OFFLINE" untuk mengunduh paket ZIP.', 'success');
}

// ==========================================
// 5. OFFLINE DOWNLOAD SYSTEM (ZIP & STANDALONE)
// ==========================================
function initDownloadHandlers() {
  if (dom.btnOpenDownloadModal) {
    dom.btnOpenDownloadModal.addEventListener('click', () => {
      if (dom.downloadModal) dom.downloadModal.classList.remove('hidden');
    });
  }
  if (dom.btnCloseDownloadModal) {
    dom.btnCloseDownloadModal.addEventListener('click', () => {
      if (dom.downloadModal) dom.downloadModal.classList.add('hidden');
    });
  }

  // 1. Download ZIP (containing index.html, style.css, script.js)
  if (dom.btnDownloadZip) {
    dom.btnDownloadZip.addEventListener('click', async () => {
      try {
        logToTerminal('Membuat paket ZIP offline...', 'info');
        const [html, css, js] = await Promise.all([
          fetch('./index.html').then(r => r.text()),
          fetch('./style.css').then(r => r.text()),
          fetch('./script.js').then(r => r.text())
        ]);

        const htmlWithNamedLinks = html
          .replace(/href="[^"]*style\.css"/g, 'href="./Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.css"')
          .replace(/src="[^"]*script\.js"/g, 'src="./Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.js"');

        const zipBlob = generateZip({
          'Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.html': htmlWithNamedLinks,
          'Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.css': css,
          'Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.js': js,
          'index.html': html,
          'style.css': css,
          'script.js': js
        });

        triggerFileDownload(zipBlob, 'Asteroid-Miner-2185-Offline.zip');
        logToTerminal('✓ File ZIP Asteroid-Miner-2185-Offline.zip (berisi 3 file Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE) berhasil diunduh!', 'success');
      } catch (err) {
        logToTerminal(`Gagal mengunduh ZIP: ${err.message}`, 'error');
      }
    });
  }

  // 2. Download Standalone Single-File HTML (Embedded CSS & JS)
  if (dom.btnDownloadSingleHtml) {
    dom.btnDownloadSingleHtml.addEventListener('click', async () => {
      try {
        logToTerminal('Membuat file Standalone Single-File HTML...', 'info');
        const [html, css, js] = await Promise.all([
          fetch('./index.html').then(r => r.text()),
          fetch('./style.css').then(r => r.text()),
          fetch('./script.js').then(r => r.text())
        ]);

        // Embed CSS and JS directly
        let standalone = html;
        standalone = standalone.replace(/<link rel="stylesheet"[^>]*>/, `<style>\n${css}\n</style>`);
        standalone = standalone.replace(/<script src="[^"]*"><\/script>/, `<script>\n${js}\n</script>`);

        const blob = new Blob([standalone], { type: 'text/html;charset=utf-8' });
        triggerFileDownload(blob, 'Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE (Standalone).html');
        logToTerminal('✓ File Standalone HTML berhasil diunduh! Cukup klik ganda untuk memainkannya langsung offline.', 'success');
      } catch (err) {
        logToTerminal(`Gagal membuat standalone: ${err.message}`, 'error');
      }
    });
  }

  // 3. Individual file downloads with exact requested names
  if (dom.btnDlHtmlOnly) {
    dom.btnDlHtmlOnly.addEventListener('click', () => downloadSingleFile('./Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.html', 'Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.html'));
  }
  if (dom.btnDlCssOnly) {
    dom.btnDlCssOnly.addEventListener('click', () => downloadSingleFile('./Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.css', 'Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.css'));
  }
  if (dom.btnDlJsOnly) {
    dom.btnDlJsOnly.addEventListener('click', () => downloadSingleFile('./Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.js', 'Asteroid Miner 2185 - Ultra-HD Cyberpunk IDE.js'));
  }
}

async function downloadSingleFile(url, filename) {
  try {
    const text = await fetch(url).then(r => r.text());
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerFileDownload(blob, filename);
    logToTerminal(`✓ Berkas ${filename} berhasil diunduh.`, 'success');
  } catch (err) {
    logToTerminal(`Gagal mengunduh ${filename}: ${err.message}`, 'error');
  }
}

function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Pure JavaScript PKZIP Generator (Store method, no external library required)
 * Standard PKZIP 2.0 format compatible with all operating systems.
 */
function generateZip(files) {
  const fileEntries = [];
  let offset = 0;

  // Compute CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(str) {
    let crc = 0 ^ (-1);
    const bytes = new TextEncoder().encode(str);
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  const encoder = new TextEncoder();
  const chunks = [];

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const contentBytes = encoder.encode(content);
    const crc = crc32(content);
    const size = contentBytes.length;

    // Local file header (30 bytes + name length)
    const header = new ArrayBuffer(30 + nameBytes.length);
    const view = new DataView(header);

    view.setUint32(0, 0x04034b50, true); // Local header signature
    view.setUint16(4, 20, true);         // Version needed: 2.0
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression: Store (0)
    view.setUint16(10, 0, true);         // Mod time
    view.setUint16(12, 0, true);         // Mod date
    view.setUint32(14, crc, true);       // CRC32
    view.setUint32(18, size, true);      // Compressed size
    view.setUint32(22, size, true);      // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true);         // Extra field length

    new Uint8Array(header, 30).set(nameBytes);

    chunks.push(header);
    chunks.push(contentBytes);

    fileEntries.push({
      nameBytes,
      crc,
      size,
      offset
    });

    offset += header.byteLength + contentBytes.byteLength;
  }

  // Central Directory
  const cdStartOffset = offset;
  let cdSize = 0;

  for (const entry of fileEntries) {
    const cdHeader = new ArrayBuffer(46 + entry.nameBytes.length);
    const view = new DataView(cdHeader);

    view.setUint32(0, 0x02014b50, true); // Central directory signature
    view.setUint16(4, 20, true);         // Version made by
    view.setUint16(6, 20, true);         // Version needed
    view.setUint16(8, 0, true);          // General purpose bit flag
    view.setUint16(10, 0, true);         // Compression method: 0
    view.setUint16(12, 0, true);         // Mod time
    view.setUint16(14, 0, true);         // Mod date
    view.setUint32(16, entry.crc, true); // CRC32
    view.setUint32(20, entry.size, true);// Compressed size
    view.setUint32(24, entry.size, true);// Uncompressed size
    view.setUint16(28, entry.nameBytes.length, true); // File name length
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // File comment length
    view.setUint16(34, 0, true);         // Disk number start
    view.setUint16(36, 0, true);         // Internal file attributes
    view.setUint32(38, 0, true);         // External file attributes
    view.setUint32(42, entry.offset, true); // Relative offset of local header

    new Uint8Array(cdHeader, 46).set(entry.nameBytes);

    chunks.push(cdHeader);
    cdSize += cdHeader.byteLength;
  }

  // End of Central Directory Record (22 bytes)
  const eocd = new ArrayBuffer(22);
  const viewEocd = new DataView(eocd);
  viewEocd.setUint32(0, 0x06054b50, true); // EOCD signature
  viewEocd.setUint16(4, 0, true);          // Number of this disk
  viewEocd.setUint16(6, 0, true);          // Disk with CD
  viewEocd.setUint16(8, fileEntries.length, true);  // Number of entries on this disk
  viewEocd.setUint16(10, fileEntries.length, true); // Total number of entries
  viewEocd.setUint32(12, cdSize, true);             // Size of CD
  viewEocd.setUint32(16, cdStartOffset, true);      // Offset of start of CD
  viewEocd.setUint16(20, 0, true);                  // Comment length

  chunks.push(eocd);

  return new Blob(chunks, { type: 'application/zip' });
}

// ==========================================
// 6. CODE EDITOR & TERMINAL SYSTEM
// ==========================================
function initCodeEditor() {
  if (!dom.codeTextarea) return;

  dom.codeTextarea.value = CODE_PRESETS.default;
  updateLineNumbers();

  dom.codeTextarea.addEventListener('input', () => {
    updateLineNumbers();
    validateSyntax();
  });

  dom.codeTextarea.addEventListener('scroll', () => {
    if (dom.lineNumbers) {
      dom.lineNumbers.scrollTop = dom.codeTextarea.scrollTop;
    }
  });

  dom.codeTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = dom.codeTextarea.selectionStart;
      const end = dom.codeTextarea.selectionEnd;
      dom.codeTextarea.value = dom.codeTextarea.value.substring(0, start) + '  ' + dom.codeTextarea.value.substring(end);
      dom.codeTextarea.selectionStart = dom.codeTextarea.selectionEnd = start + 2;
      updateLineNumbers();
    }
  });

  const presetChips = document.querySelectorAll('.preset-chip');
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const presetName = chip.dataset.preset;
      if (CODE_PRESETS[presetName]) {
        dom.codeTextarea.value = CODE_PRESETS[presetName];
        updateLineNumbers();
        executeUserCode();
      }
    });
  });

  if (dom.btnSnippetMenu && dom.snippetDropdown) {
    dom.btnSnippetMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.snippetDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      if (dom.snippetDropdown) dom.snippetDropdown.classList.add('hidden');
    });

    const snippetBtns = dom.snippetDropdown.querySelectorAll('.dropdown-item');
    snippetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const snippetKey = btn.dataset.snippet;
        if (SNIPPETS[snippetKey]) {
          dom.codeTextarea.value += SNIPPETS[snippetKey];
          updateLineNumbers();
          dom.snippetDropdown.classList.add('hidden');
          executeUserCode();
        }
      });
    });
  }

  if (dom.btnCopyCode) {
    dom.btnCopyCode.addEventListener('click', () => {
      navigator.clipboard.writeText(dom.codeTextarea.value).then(() => {
        logToTerminal('Kode disalin ke clipboard.', 'info');
      });
    });
  }

  if (dom.btnResetCode) {
    dom.btnResetCode.addEventListener('click', () => {
      dom.codeTextarea.value = CODE_PRESETS.default;
      updateLineNumbers();
      executeUserCode();
      logToTerminal('Script dikembalikan ke konfigurasi default.', 'info');
    });
  }

  if (dom.btnRunCode) dom.btnRunCode.addEventListener('click', executeUserCode);
  if (dom.btnRunGlobal) dom.btnRunGlobal.addEventListener('click', executeUserCode);
  if (dom.btnClearTerminal) {
    dom.btnClearTerminal.addEventListener('click', () => {
      if (dom.terminalLogs) dom.terminalLogs.innerHTML = '';
    });
  }
}

function updateLineNumbers() {
  if (!dom.lineNumbers || !dom.codeTextarea) return;
  const lines = dom.codeTextarea.value.split('\n').length;
  let nums = '';
  for (let i = 1; i <= lines; i++) {
    nums += i + '<br>';
  }
  dom.lineNumbers.innerHTML = nums;
}

function validateSyntax() {
  if (!dom.syntaxStatus || !dom.codeTextarea) return;
  try {
    new Function(dom.codeTextarea.value);
    dom.syntaxStatus.textContent = '✓ Syntax OK';
    dom.syntaxStatus.className = 'syntax-badge ok';
  } catch (err) {
    dom.syntaxStatus.textContent = '⚠ Syntax Error';
    dom.syntaxStatus.className = 'syntax-badge err';
  }
}

function logToTerminal(msg, type = 'info') {
  if (!dom.terminalLogs) return;
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  const now = new Date();
  const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
  line.textContent = `${timeStr} ${msg}`;
  dom.terminalLogs.appendChild(line);
  dom.terminalLogs.scrollTop = dom.terminalLogs.scrollHeight;
}

function executeUserCode() {
  sounds.init();
  if (!dom.codeTextarea) return;
  const code = dom.codeTextarea.value;

  try {
    const customConsole = {
      log: (...args) => logToTerminal(args.join(' '), 'info'),
      warn: (...args) => logToTerminal('⚠ ' + args.join(' '), 'warn'),
      error: (...args) => logToTerminal('✖ ' + args.join(' '), 'error')
    };

    const runner = new Function('player', 'cargo', 'laserModes', 'console', code);
    runner(gameState.player, gameState.cargo, gameState.laserModes, customConsole);

    logToTerminal('Script berhasil diterapkan ke mesin penerbangan!', 'success');
    sounds.powerup();
    validateSyntax();
  } catch (err) {
    logToTerminal(`Eksekusi gagal: ${err.message}`, 'error');
    if (dom.syntaxStatus) {
      dom.syntaxStatus.textContent = '⚠ Runtime Error';
      dom.syntaxStatus.className = 'syntax-badge err';
    }
  }
}

// ==========================================
// 7. TECH INSPECTOR MODAL & 6 FORMULAS
// ==========================================
const TECH_EXPLANATIONS = [
  {
    id: 'dpiScaling',
    title: '1. DPI Scaling (Device Pixel Ratio)',
    desc: 'Menghilangkan blur di layar Retina & HP beresolusi tinggi dengan mengalikan kanvas dengan window.devicePixelRatio dan menskalakan context.',
    formula: 'canvas.width = rect.width * dpr; ctx.scale(dpr, dpr);'
  },
  {
    id: 'dualLayerGlow',
    title: '2. Dual-Layer Glow + Lighter Blend',
    desc: 'Lapisan 1 memancarkan pendaran warna cyan/magenta foton (shadowBlur: 16) dengan mode "lighter", Lapisan 2 menggambar inti putih panas.',
    formula: 'ctx.globalCompositeOperation = "lighter"; ctx.shadowBlur = 16;'
  },
  {
    id: 'vectorPolygons',
    title: '3. Vektor Poligon Matematis (Bukan PNG)',
    desc: 'Objek tajam kristal tidak pernah pecah karena digambar murni via koordinat lokal poligon (0,0) yang di-rotate & di-translate.',
    formula: 'ctx.translate(x, y); ctx.rotate(angle); ctx.beginPath()...'
  },
  {
    id: 'particlePhysics',
    title: '4. Partikel Redaman (Damping & Trails)',
    desc: 'Semburan plasma knalpot dan pecahan batu asteroid melambat secara natural menggunakan koefisien inersia redaman.',
    formula: 'vx *= 0.94; opacity -= 0.02; radius *= 0.96;'
  },
  {
    id: 'cyberpunkPalette',
    title: '5. High-Contrast Cyberpunk Palette',
    desc: 'Ruang angkasa dingin gelap (#03050c) dengan kontras pendaran neon intens: Cyan (#00f0ff), Hot Pink (#ff007f), Emas (#ffd700), Emerald (#00ff88).',
    formula: 'Deep Space Navy (#03050c) + Neon Cyan & Hot Pink'
  },
  {
    id: 'sineOscillations',
    title: '6. Animasi Mengapung Math.sin(time)',
    desc: 'Membuat kristal mineral mengapung dan berdenyut secara alami tanpa perhitungan fisika gravitasi yang berat.',
    formula: 'yOffset = Math.sin(time * 3 + id) * 4; scale = 1 + Math.sin(time)*0.1;'
  }
];

function initTechCards() {
  if (!dom.techCardsGrid) return;
  dom.techCardsGrid.innerHTML = '';

  TECH_EXPLANATIONS.forEach(tech => {
    const card = document.createElement('div');
    card.className = 'tech-item-card';
    card.innerHTML = `
      <div class="tech-item-header">
        <span class="tech-item-title font-orbitron">${tech.title}</span>
        <label class="toggle-checkbox-label" style="font-size: 10px;">
          <input type="checkbox" id="toggle_${tech.id}" ${gameState.settings[tech.id] ? 'checked' : ''}>
          <span>Aktif</span>
        </label>
      </div>
      <p class="tech-item-desc">${tech.desc}</p>
      <div class="tech-item-formula font-mono">${tech.formula}</div>
    `;
    dom.techCardsGrid.appendChild(card);

    const checkbox = card.querySelector(`#toggle_${tech.id}`);
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        gameState.settings[tech.id] = e.target.checked;
        logToTerminal(`Teknik "${tech.title}" ${e.target.checked ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
      });
    }
  });

  if (dom.btnEnableAllTech) {
    dom.btnEnableAllTech.addEventListener('click', () => {
      TECH_EXPLANATIONS.forEach(t => {
        gameState.settings[t.id] = true;
        const cb = document.getElementById(`toggle_${t.id}`);
        if (cb) cb.checked = true;
      });
      logToTerminal('Semua 6 teknik grafis Ultra-HD aktif 100%!', 'success');
    });
  }

  if (dom.tabBtnTechniques && dom.tabBtnSandbox) {
    dom.tabBtnTechniques.addEventListener('click', () => {
      dom.tabBtnTechniques.classList.add('active');
      dom.tabBtnSandbox.classList.remove('active');
      dom.tabContentTechniques.classList.remove('hidden');
      dom.tabContentSandbox.classList.add('hidden');
    });

    dom.tabBtnSandbox.addEventListener('click', () => {
      dom.tabBtnSandbox.classList.add('active');
      dom.tabBtnTechniques.classList.remove('active');
      dom.tabContentSandbox.classList.remove('hidden');
      dom.tabContentTechniques.classList.add('hidden');
      renderSandboxCanvas();
    });
  }

  if (dom.sliderGlowBlur) {
    dom.sliderGlowBlur.addEventListener('input', (e) => {
      gameState.settings.glowBlur = parseFloat(e.target.value);
      if (dom.valGlowBlur) dom.valGlowBlur.textContent = `${gameState.settings.glowBlur} px`;
      renderSandboxCanvas();
    });
  }

  if (dom.sliderCoreBrightness) {
    dom.sliderCoreBrightness.addEventListener('input', (e) => {
      gameState.settings.coreBrightness = parseFloat(e.target.value);
      if (dom.valCoreBrightness) dom.valCoreBrightness.textContent = `${gameState.settings.coreBrightness}x`;
      renderSandboxCanvas();
    });
  }

  if (dom.sliderParticleDamping) {
    dom.sliderParticleDamping.addEventListener('input', (e) => {
      gameState.settings.particleDamping = parseFloat(e.target.value);
      if (dom.valParticleDamping) dom.valParticleDamping.textContent = `${gameState.settings.particleDamping}`;
      renderSandboxCanvas();
    });
  }

  if (dom.sliderSineSpeed) {
    dom.sliderSineSpeed.addEventListener('input', (e) => {
      gameState.settings.sineSpeed = parseFloat(e.target.value);
      if (dom.valSineSpeed) dom.valSineSpeed.textContent = `${gameState.settings.sineSpeed}x`;
      renderSandboxCanvas();
    });
  }

  if (dom.checkScreenShake) {
    dom.checkScreenShake.addEventListener('change', (e) => {
      gameState.settings.screenShakeEnabled = e.target.checked;
    });
  }

  if (dom.checkCrtScanlines) {
    dom.checkCrtScanlines.addEventListener('change', (e) => {
      gameState.settings.crtScanlines = e.target.checked;
      if (dom.gameContainer) {
        if (e.target.checked) dom.gameContainer.classList.add('crt-overlay');
        else dom.gameContainer.classList.remove('crt-overlay');
      }
    });
  }
}

function renderSandboxCanvas() {
  if (!dom.sandboxCanvas) return;
  const ctx = dom.sandboxCanvas.getContext('2d');
  const w = dom.sandboxCanvas.width;
  const h = dom.sandboxCanvas.height;
  const halfW = w / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#03050c';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(halfW, 0);
  ctx.lineTo(halfW, h);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Orbitron, sans-serif';
  ctx.fillText('STANDAR 96 DPI (FLAT & TANPA DUAL GLOW)', 20, 26);

  ctx.save();
  ctx.translate(halfW * 0.3, h * 0.55);
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(14, 15);
  ctx.lineTo(0, 8);
  ctx.lineTo(-14, 15);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(halfW * 0.45, h * 0.55);
  ctx.lineTo(halfW * 0.85, h * 0.55);
  ctx.stroke();

  // RIGHT SIDE: Ultra-HD Cyberpunk
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('ULTRA-HD CYBERPUNK (DUAL-LAYER + LIGHTER BLEND)', halfW + 20, 26);

  ctx.save();
  ctx.translate(halfW + halfW * 0.3, h * 0.55);

  const blur = gameState.settings.glowBlur;
  const core = gameState.settings.coreBrightness;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = blur;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(14, 15);
  ctx.lineTo(0, 8);
  ctx.lineTo(-14, 15);
  ctx.closePath();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2 * core;
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // Ultra-HD laser beam
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = blur;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(halfW + halfW * 0.45, h * 0.55);
  ctx.lineTo(w - 20, h * 0.55);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6 * core;
  ctx.stroke();
  ctx.restore();
}

// ==========================================
// 8. CANVAS SETUP & DPI SCALING (FORMULA 1)
// ==========================================
let canvasWidth = 800;
let canvasHeight = 600;

function initCanvas() {
  if (!dom.gameCanvas || !dom.gameContainer) return;

  const resize = () => {
    const rect = dom.gameContainer.getBoundingClientRect();
    canvasWidth = Math.floor(rect.width);
    canvasHeight = Math.floor(rect.height);

    const dpr = gameState.settings.dpiScaling ? (window.devicePixelRatio || 1) : 1;
    dom.gameCanvas.width = canvasWidth * dpr;
    dom.gameCanvas.height = canvasHeight * dpr;
    dom.gameCanvas.style.width = `${canvasWidth}px`;
    dom.gameCanvas.style.height = `${canvasHeight}px`;

    const ctx = dom.gameCanvas.getContext('2d');
    if (gameState.settings.dpiScaling) {
      ctx.scale(dpr, dpr);
    }

    if (!gameState.started) {
      gameState.player.x = canvasWidth / 2;
      gameState.player.y = canvasHeight / 2;
      gameState.station.x = canvasWidth / 2 + 200;
      gameState.station.y = canvasHeight / 2 - 140;
    }
  };

  window.addEventListener('resize', resize);
  resize();
}

// ==========================================
// 9. WORLD GENERATION & STARS
// ==========================================
function initBackgroundStars() {
  gameState.stars = [];
  const count = 160;
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(Math.random() * 3); // 0 = far, 1 = mid, 2 = near
    gameState.stars.push({
      x: Math.random() * 2600 - 600,
      y: Math.random() * 2600 - 600,
      size: layer === 2 ? Math.random() * 2.2 + 1.0 : (layer === 1 ? Math.random() * 1.5 + 0.6 : Math.random() * 0.8 + 0.3),
      alpha: Math.random() * 0.7 + 0.3,
      speed: (layer + 1) * 0.12,
      layer,
      color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#00f0ff' : '#ff007f')
    });
  }
}

function spawnWorldObjects() {
  gameState.asteroids = [];
  gameState.enemies = [];
  gameState.crystals = [];
  gameState.powerups = [];
  gameState.drones = [];
  gameState.boss = null;

  for (let i = 0; i < 10; i++) {
    spawnAsteroid();
  }

  spawnEnemy('scout');
}

function spawnAsteroid(x, y, radius = null, tier = 3) {
  const rad = radius || (tier === 3 ? 46 : (tier === 2 ? 28 : 16));
  const posX = x !== undefined ? x : (Math.random() * (canvasWidth + 240) - 120);
  const posY = y !== undefined ? y : (Math.random() * (canvasHeight + 240) - 120);

  const distPlayer = Math.hypot(posX - gameState.player.x, posY - gameState.player.y);
  if (distPlayer < 140 && x === undefined) return;

  const vertices = [];
  const numPoints = Math.floor(Math.random() * 4) + 9;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const offset = (Math.random() * 0.38 + 0.78) * rad;
    vertices.push({
      x: Math.cos(angle) * offset,
      y: Math.sin(angle) * offset
    });
  }

  const roll = Math.random();
  let oreType = 'iron';
  if (roll > 0.92) oreType = 'uranium';
  else if (roll > 0.75) oreType = 'platinum';
  else if (roll > 0.45) oreType = 'gold';

  gameState.asteroids.push({
    x: posX,
    y: posY,
    vx: (Math.random() - 0.5) * (1.3 / tier),
    vy: (Math.random() - 0.5) * (1.3 / tier),
    radius: rad,
    tier,
    angle: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 0.02,
    vertices,
    oreType,
    health: tier === 3 ? 140 : (tier === 2 ? 70 : 30),
    maxHealth: tier === 3 ? 140 : (tier === 2 ? 70 : 30)
  });
}

function spawnEnemy(type = 'scout') {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.max(canvasWidth, canvasHeight) * 0.75;
  const x = gameState.player.x + Math.cos(angle) * dist;
  const y = gameState.player.y + Math.sin(angle) * dist;

  if (type === 'boss') {
    gameState.boss = {
      x,
      y,
      vx: 0,
      vy: 0,
      angle: 0,
      health: 800,
      maxHealth: 800,
      radius: 48,
      lastFired: Date.now() + 1000,
      lastTorpedo: Date.now() + 2000
    };
    if (dom.bossBarContainer) dom.bossBarContainer.classList.remove('hidden');
    sounds.explosion(true);
    addFloatingText(canvasWidth / 2, 80, '⚠ BOSS DREADNOUGHT PIRATE ARRIVED! ⚠', '#ff2a5f');
    logToTerminal('⚠ PERINGATAN DARURAT: Dreadnought Pirate "Iron Vulture" memasuki orbit!', 'warn');
    return;
  }

  gameState.enemies.push({
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    angle: 0,
    health: type === 'gunship' ? 160 : 75,
    maxHealth: type === 'gunship' ? 160 : 75,
    radius: type === 'gunship' ? 26 : 18,
    speed: type === 'gunship' ? 1.6 : 2.5,
    lastFired: Date.now() + Math.random() * 1500,
    fireInterval: type === 'gunship' ? 1800 : 2200
  });
}

function spawnMineral(x, y, type) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 2.5 + 0.8;
  gameState.crystals.push({
    id: Math.random(),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    type,
    radius: 8,
    created: Date.now()
  });
}

function spawnPowerUp(x, y) {
  const pType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  gameState.powerups.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    type: pType.type,
    label: pType.label,
    icon: pType.icon,
    color: pType.color,
    radius: 15,
    created: Date.now()
  });
}

function createParticles(x, y, count, color, speedMul = 1, isSpark = false) {
  if (!gameState.settings.particlePhysics) return;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 3.6 + 1.0) * speedMul;
    gameState.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: isSpark ? Math.random() * 2.2 + 1 : Math.random() * 4.2 + 2,
      color,
      alpha: 1.0,
      life: 1.0,
      isSpark
    });
  }
}

function addFloatingText(x, y, text, color) {
  gameState.floatingTexts.push({
    x,
    y,
    text,
    color,
    alpha: 1.0,
    vy: -1.2
  });
}

// ==========================================
// 10. EVENT LISTENERS & SPLIT CONTROLS
// ==========================================
function initEventListeners() {
  window.addEventListener('click', () => sounds.init(), { once: true });
  window.addEventListener('keydown', () => sounds.init(), { once: true });

  if (dom.btnToggleSound) {
    dom.btnToggleSound.addEventListener('click', () => {
      sounds.muted = !sounds.muted;
      dom.btnToggleSound.textContent = sounds.muted ? '🔇' : '🔊';
      logToTerminal(`Audio ${sounds.muted ? 'dibisukan' : 'diaktifkan'}.`, 'info');
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (document.activeElement === dom.codeTextarea) return;

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') input.up = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') input.down = true;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') input.left = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') input.right = true;

    // Number keys for weapons
    if (e.key === '1') selectWeapon('pulse');
    if (e.key === '2') selectWeapon('plasma');
    if (e.key === '3') selectWeapon('extractor');
    if (e.key === '4') selectWeapon('quad');

    if (e.code === 'Space') {
      e.preventDefault();
      cycleWeapon();
    }

    if (e.key === 'e' || e.key === 'E') tryDockAtStation();
    if (e.key === 'q' || e.key === 'Q') fireQuantumMissile();
    if (e.key === 'Escape') closeAllModals();
  });

  window.addEventListener('keyup', (e) => {
    if (document.activeElement === dom.codeTextarea) return;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') input.up = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') input.down = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') input.left = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') input.right = false;
  });

  // Mouse aim & firing
  if (dom.gameCanvas) {
    dom.gameCanvas.addEventListener('mousemove', (e) => {
      const rect = dom.gameCanvas.getBoundingClientRect();
      input.mouseX = e.clientX - rect.left;
      input.mouseY = e.clientY - rect.top;
      input.mouseInCanvas = true;
    });

    dom.gameCanvas.addEventListener('mouseenter', () => { input.mouseInCanvas = true; });
    dom.gameCanvas.addEventListener('mouseleave', () => {
      input.mouseInCanvas = false;
      input.fire = false;
    });

    dom.gameCanvas.addEventListener('mousedown', (e) => {
      sounds.init();
      if (e.button === 0) {
        input.fire = true;
      } else if (e.button === 2) {
        e.preventDefault();
        fireQuantumMissile();
      }
    });

    dom.gameCanvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) input.fire = false;
    });

    dom.gameCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Mobile controls
  if (dom.btnTouchThrust) {
    dom.btnTouchThrust.addEventListener('touchstart', (e) => { e.preventDefault(); input.up = true; });
    dom.btnTouchThrust.addEventListener('touchend', (e) => { e.preventDefault(); input.up = false; });
  }
  if (dom.btnTouchFire) {
    dom.btnTouchFire.addEventListener('touchstart', (e) => { e.preventDefault(); input.fire = true; });
    dom.btnTouchFire.addEventListener('touchend', (e) => { e.preventDefault(); input.fire = false; });
  }
  if (dom.btnTouchSwitch) dom.btnTouchSwitch.addEventListener('click', cycleWeapon);
  if (dom.btnTouchMissile) dom.btnTouchMissile.addEventListener('click', fireQuantumMissile);
  if (dom.btnTouchMarket) dom.btnTouchMarket.addEventListener('click', openMarketModal);

  // Split Divider Dragging
  let isDraggingSplit = false;
  if (dom.splitDivider && dom.workspace && dom.codePane && dom.gamePane) {
    dom.splitDivider.addEventListener('mousedown', () => { isDraggingSplit = true; });
    window.addEventListener('mouseup', () => { isDraggingSplit = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDraggingSplit) return;
      const workspaceRect = dom.workspace.getBoundingClientRect();
      if (window.innerWidth > 900) {
        const offset = e.clientX - workspaceRect.left;
        const total = workspaceRect.width;
        const pct = Math.max(20, Math.min(80, (offset / total) * 100));
        dom.codePane.style.flex = `0 0 ${pct}%`;
        dom.gamePane.style.flex = `1 1 ${100 - pct}%`;
      }
    });
  }

  if (dom.btnSplit50) dom.btnSplit50.addEventListener('click', () => setSplitRatio(50));
  if (dom.btnSplit3565) dom.btnSplit3565.addEventListener('click', () => setSplitRatio(35));
  if (dom.btnSplit6535) dom.btnSplit6535.addEventListener('click', () => setSplitRatio(65));
  if (dom.btnSplitFull) dom.btnSplitFull.addEventListener('click', () => setSplitRatio(0));
  if (dom.btnRestoreCode) dom.btnRestoreCode.addEventListener('click', () => setSplitRatio(50));

  // Modals
  if (dom.btnStartGame) {
    dom.btnStartGame.addEventListener('click', () => {
      sounds.init();
      gameState.started = true;
      dom.startScreen.classList.add('hidden');
      dom.hud.classList.remove('hidden');
      logToTerminal('Misi penambangan dimulai. Selamat beroperasi di Sektor X-92!', 'success');
    });
  }

  if (dom.btnRestartGame) dom.btnRestartGame.addEventListener('click', restartGame);
  if (dom.btnRestartAfterGameOver) dom.btnRestartAfterGameOver.addEventListener('click', restartGame);

  if (dom.btnDockStation) dom.btnDockStation.addEventListener('click', tryDockAtStation);
  if (dom.btnOpenMarket) dom.btnOpenMarket.addEventListener('click', openMarketModal);
  if (dom.btnCloseMarket) dom.btnCloseMarket.addEventListener('click', () => dom.marketModal.classList.add('hidden'));
  if (dom.btnCloseMarketBottom) dom.btnCloseMarketBottom.addEventListener('click', () => dom.marketModal.classList.add('hidden'));

  if (dom.btnOpenTechLab) dom.btnOpenTechLab.addEventListener('click', () => dom.techModal.classList.remove('hidden'));
  if (dom.btnCloseTechModal) dom.btnCloseTechModal.addEventListener('click', () => dom.techModal.classList.add('hidden'));
  if (dom.btnCloseTechModalBottom) dom.btnCloseTechModalBottom.addEventListener('click', () => dom.techModal.classList.add('hidden'));

  if (dom.btnShowHelp) dom.btnShowHelp.addEventListener('click', () => dom.helpModal.classList.remove('hidden'));
  if (dom.btnCloseHelp) dom.btnCloseHelp.addEventListener('click', () => dom.helpModal.classList.add('hidden'));
  if (dom.btnCloseHelpBottom) dom.btnCloseHelpBottom.addEventListener('click', () => dom.helpModal.classList.add('hidden'));

  initMarketTrades();
}

function setSplitRatio(pctCode) {
  if (!dom.codePane || !dom.gamePane) return;
  [dom.btnSplit50, dom.btnSplit3565, dom.btnSplit6535, dom.btnSplitFull].forEach(b => {
    if (b) b.classList.remove('active');
  });

  if (pctCode === 0) {
    dom.codePane.classList.add('hidden');
    dom.splitDivider.classList.add('hidden');
    dom.gamePane.style.flex = '1 1 100%';
    if (dom.btnRestoreCode) dom.btnRestoreCode.classList.remove('hidden');
    if (dom.btnSplitFull) dom.btnSplitFull.classList.add('active');
  } else {
    dom.codePane.classList.remove('hidden');
    dom.splitDivider.classList.remove('hidden');
    dom.codePane.style.flex = `0 0 ${pctCode}%`;
    dom.gamePane.style.flex = `1 1 ${100 - pctCode}%`;
    if (dom.btnRestoreCode) dom.btnRestoreCode.classList.add('hidden');

    if (pctCode === 50 && dom.btnSplit50) dom.btnSplit50.classList.add('active');
    if (pctCode === 35 && dom.btnSplit3565) dom.btnSplit3565.classList.add('active');
    if (pctCode === 65 && dom.btnSplit6535) dom.btnSplit6535.classList.add('active');
  }

  setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
}

function closeAllModals() {
  if (dom.marketModal) dom.marketModal.classList.add('hidden');
  if (dom.techModal) dom.techModal.classList.add('hidden');
  if (dom.helpModal) dom.helpModal.classList.add('hidden');
  if (dom.downloadModal) dom.downloadModal.classList.add('hidden');
}

function restartGame() {
  gameState.gameOver = false;
  gameState.started = true;
  gameState.score = 0;
  gameState.credits = 250;
  gameState.threatLevel = 1;
  gameState.player.health = 100;
  gameState.player.shield = 100;
  gameState.player.fuel = 100;
  gameState.player.heat = 0;
  gameState.player.isOverheated = false;
  gameState.player.x = canvasWidth / 2;
  gameState.player.y = canvasHeight / 2;
  gameState.player.vx = 0;
  gameState.player.vy = 0;
  gameState.cargo.stored = { iron: 0, gold: 0, platinum: 0, uranium: 0 };
  gameState.combo.multiplier = 1;
  gameState.combo.timer = 0;
  gameState.buffs = {};
  gameState.boss = null;

  if (dom.gameOverScreen) dom.gameOverScreen.classList.add('hidden');
  if (dom.startScreen) dom.startScreen.classList.add('hidden');
  if (dom.hud) dom.hud.classList.remove('hidden');
  if (dom.emergencyAlarm) dom.emergencyAlarm.classList.add('hidden');
  if (dom.bossBarContainer) dom.bossBarContainer.classList.add('hidden');

  spawnWorldObjects();
  logToTerminal('Kapal baru diluncurkan ke Sektor X-92.', 'success');
}

// ==========================================
// 11. WEAPONS, COMBAT & SINGULARITY VORTEX
// ==========================================
function selectWeapon(key) {
  if (!gameState.laserModes[key]) return;
  gameState.player.currentWeapon = key;
  sounds.powerup();

  if (dom.weaponNameDisplay) {
    dom.weaponNameDisplay.textContent = gameState.laserModes[key].name;
    dom.weaponNameDisplay.style.color = gameState.laserModes[key].color;
  }
  logToTerminal(`Senjata aktif: ${gameState.laserModes[key].name}`, 'info');
}

function cycleWeapon() {
  const modes = Object.keys(gameState.laserModes);
  const currentIndex = modes.indexOf(gameState.player.currentWeapon);
  const nextMode = modes[(currentIndex + 1) % modes.length];
  selectWeapon(nextMode);
}

function fireLaser() {
  const p = gameState.player;
  const now = Date.now();
  const modeKey = p.currentWeapon;
  const mode = gameState.laserModes[modeKey];

  if (p.isOverheated) return;
  if (now - p.lastFired < mode.fireRate) return;

  p.lastFired = now;
  p.heat += mode.heatPerShot;
  if (p.heat >= p.maxHeat) {
    p.heat = p.maxHeat;
    p.isOverheated = true;
    logToTerminal('PERINGATAN: Laser Overheated! Mendinginkan sistem reactor...', 'warn');
  }

  sounds.laser(modeKey);

  const angle = p.angle;
  const speed = mode.speed || 16;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const noseX = p.x + cos * 24;
  const noseY = p.y + sin * 24;

  const hasTriple = !!gameState.buffs.triple_laser;

  if (modeKey === 'quad') {
    [-0.22, -0.07, 0.07, 0.22].forEach(spread => {
      const a = angle + spread;
      gameState.projectiles.push({
        x: noseX,
        y: noseY,
        vx: Math.cos(a) * speed + p.vx * 0.3,
        vy: Math.sin(a) * speed + p.vy * 0.3,
        color: mode.color,
        coreColor: mode.coreColor,
        damage: mode.damage,
        mode: modeKey,
        created: now,
        life: 1400
      });
    });
  } else if (hasTriple) {
    [-0.15, 0, 0.15].forEach(spread => {
      const a = angle + spread;
      gameState.projectiles.push({
        x: noseX,
        y: noseY,
        vx: Math.cos(a) * speed + p.vx * 0.3,
        vy: Math.sin(a) * speed + p.vy * 0.3,
        color: mode.color,
        coreColor: mode.coreColor,
        damage: mode.damage,
        mode: modeKey,
        created: now,
        life: 1400
      });
    });
  } else {
    // Twin lasers
    const perpX = -sin * 6;
    const perpY = cos * 6;
    [-1, 1].forEach(side => {
      gameState.projectiles.push({
        x: noseX + perpX * side,
        y: noseY + perpY * side,
        vx: cos * speed + p.vx * 0.3,
        vy: sin * speed + p.vy * 0.3,
        color: mode.color,
        coreColor: mode.coreColor,
        damage: mode.damage,
        mode: modeKey,
        created: now,
        life: 1400
      });
    });
  }

  p.vx -= cos * 0.05;
  p.vy -= sin * 0.05;
}

function fireQuantumMissile() {
  const p = gameState.player;
  const now = Date.now();
  const cooldown = p.missileCooldownTime || 4000;

  if (now - p.lastMissileFired < cooldown) return;

  p.lastMissileFired = now;
  sounds.missile();

  const angle = p.angle;
  const noseX = p.x + Math.cos(angle) * 26;
  const noseY = p.y + Math.sin(angle) * 26;

  gameState.missiles.push({
    x: noseX,
    y: noseY,
    vx: Math.cos(angle) * 9.5 + p.vx * 0.5,
    vy: Math.sin(angle) * 9.5 + p.vy * 0.5,
    angle,
    created: now,
    life: 2500
  });

  addFloatingText(noseX, noseY - 15, '🌀 MISIL VORTEX SINGULARITY!', '#ffd700');
  logToTerminal('Misil Gravitational Singularity diluncurkan!', 'info');
}

function spawnSingularityVortex(x, y) {
  sounds.singularity();
  gameState.screenShake = 16;

  gameState.singularities.push({
    x,
    y,
    radius: 180,
    duration: 3500,
    created: Date.now(),
    rotation: 0
  });
}

function registerHitStreak() {
  gameState.combo.timer = gameState.combo.maxTime;
  if (gameState.combo.multiplier < 5) {
    gameState.combo.multiplier++;
    sounds.combo();
  }
}

function updateCombo(delta) {
  if (gameState.combo.timer > 0) {
    gameState.combo.timer -= delta;
    if (gameState.combo.timer <= 0) {
      gameState.combo.multiplier = 1;
      gameState.combo.timer = 0;
    }
  }

  if (dom.comboBanner && dom.comboMultiplierText && dom.comboTimerFill) {
    if (gameState.combo.multiplier > 1) {
      dom.comboBanner.classList.remove('hidden');
      dom.comboMultiplierText.textContent = `COMBO x${gameState.combo.multiplier}`;
      const pct = (gameState.combo.timer / gameState.combo.maxTime) * 100;
      dom.comboTimerFill.style.width = `${pct}%`;
    } else {
      dom.comboBanner.classList.add('hidden');
    }
  }
}

function applyPowerUp(type) {
  const def = POWERUP_TYPES.find(p => p.type === type);
  if (!def) return;

  sounds.powerup();

  if (type === 'nuke') {
    gameState.screenShake = 22;
    sounds.explosion(true);
    addFloatingText(gameState.player.x, gameState.player.y - 30, '💥 QUANTUM PULSE NUKE!', '#ff2a5f');

    gameState.asteroids.forEach(ast => {
      ast.health = 0;
      createParticles(ast.x, ast.y, 25, '#00f0ff', 2);
      for (let i = 0; i < 3; i++) spawnMineral(ast.x, ast.y, ast.oreType);
    });

    gameState.enemies.forEach(en => {
      en.health = 0;
      createParticles(en.x, en.y, 30, '#ff007f', 2.5);
    });

    if (gameState.boss) {
      gameState.boss.health -= 300;
      if (gameState.boss.health <= 0) destroyBoss();
    }
    return;
  }

  gameState.buffs[type] = Date.now() + def.duration;
  addFloatingText(gameState.player.x, gameState.player.y - 25, `BUFF: ${def.label}!`, def.color);
  logToTerminal(`Power-up aktif: ${def.label}`, 'success');
}

function updateBuffs() {
  const now = Date.now();
  Object.keys(gameState.buffs).forEach(k => {
    if (gameState.buffs[k] <= now) {
      delete gameState.buffs[k];
    }
  });

  if (dom.activeBuffsContainer) {
    dom.activeBuffsContainer.innerHTML = '';
    Object.keys(gameState.buffs).forEach(k => {
      const def = POWERUP_TYPES.find(p => p.type === k);
      if (def) {
        const remaining = Math.ceil((gameState.buffs[k] - now) / 1000);
        const pill = document.createElement('div');
        pill.className = 'buff-pill font-mono';
        pill.textContent = `${def.icon} ${def.label} (${remaining}s)`;
        dom.activeBuffsContainer.appendChild(pill);
      }
    });
  }
}

function updateMissionProgress(actionType, amount = 1) {
  gameState.missions.forEach(m => {
    if (!m.done && m.type === actionType) {
      m.current += amount;
      if (m.current >= m.target) {
        m.current = m.target;
        m.done = true;
        gameState.credits += m.reward;
        gameState.score += m.reward * 2;
        sounds.powerup();
        addFloatingText(gameState.player.x, gameState.player.y - 40, `🎯 MISI SELESAI: +$K ${m.reward}!`, '#ffd700');
        logToTerminal(`Misi Selesai: "${m.title}". Hadiah: $K ${m.reward}`, 'success');
      }
    }
  });
  renderMissions();
}

function renderMissions() {
  if (!dom.missionsList) return;
  dom.missionsList.innerHTML = '';
  gameState.missions.forEach(m => {
    const item = document.createElement('div');
    item.className = `mission-item ${m.done ? 'done' : ''}`;
    item.innerHTML = `
      <span>${m.title}</span>
      <strong>${m.current}/${m.target} ${m.done ? '✓' : ''}</strong>
    `;
    dom.missionsList.appendChild(item);
  });
}

// ==========================================
// 12. STATION DOCKING & MARKET LOGIC
// ==========================================
function tryDockAtStation() {
  const p = gameState.player;
  const s = gameState.station;
  const dist = Math.hypot(p.x - s.x, p.y - s.y);

  if (dist < s.radius + 65) {
    sounds.dock();
    p.vx = 0;
    p.vy = 0;
    openMarketModal();
    logToTerminal('Kapal berhasil berlabuh di Stasiun Orbit Olympus-9.', 'success');
  } else {
    logToTerminal('Terlalu jauh dari stasiun! Dekati cincin docking hijau terlebih dahulu.', 'warn');
  }
}

function openMarketModal() {
  updateMarketUI();
  if (dom.marketModal) dom.marketModal.classList.remove('hidden');
}

function updateMarketUI() {
  const c = gameState.cargo.stored;
  const totalWeight = c.iron + c.gold + c.platinum + c.uranium;

  if (dom.marketCredits) dom.marketCredits.textContent = `$K ${gameState.credits}`;
  if (dom.marketCargoSpace) dom.marketCargoSpace.textContent = `${totalWeight} / ${gameState.cargo.maxCapacity} TON`;

  if (dom.marketFeQty) dom.marketFeQty.textContent = `${c.iron} T`;
  if (dom.marketAuQty) dom.marketAuQty.textContent = `${c.gold} T`;
  if (dom.marketPtQty) dom.marketPtQty.textContent = `${c.platinum} T`;
  if (dom.marketUQty) dom.marketUQty.textContent = `${c.uranium} T`;
}

function initMarketTrades() {
  if (dom.btnSellAllOre) {
    dom.btnSellAllOre.addEventListener('click', () => {
      const c = gameState.cargo.stored;
      const earnings = c.iron * 20 + c.gold * 60 + c.platinum * 160 + c.uranium * 400;
      if (earnings > 0) {
        gameState.credits += earnings;
        gameState.score += earnings;
        c.iron = 0;
        c.gold = 0;
        c.platinum = 0;
        c.uranium = 0;
        sounds.pickup();
        logToTerminal(`Semua mineral terjual! Mendapatkan $K ${earnings}.`, 'success');
        updateMarketUI();
      }
    });
  }

  const sellOre = (type, price) => {
    if (gameState.cargo.stored[type] > 0) {
      gameState.cargo.stored[type]--;
      gameState.credits += price;
      gameState.score += price;
      sounds.pickup();
      updateMarketUI();
    }
  };

  if (dom.btnSellIron) dom.btnSellIron.addEventListener('click', () => sellOre('iron', 20));
  if (dom.btnSellGold) dom.btnSellGold.addEventListener('click', () => sellOre('gold', 60));
  if (dom.btnSellPlatinum) dom.btnSellPlatinum.addEventListener('click', () => sellOre('platinum', 160));
  if (dom.btnSellUranium) dom.btnSellUranium.addEventListener('click', () => sellOre('uranium', 400));

  const buyUpgrade = (cost, callback) => {
    if (gameState.credits >= cost) {
      gameState.credits -= cost;
      callback();
      sounds.powerup();
      updateMarketUI();
    } else {
      logToTerminal('Kredit tidak mencukupi untuk upgrade ini!', 'warn');
    }
  };

  if (dom.btnBuyRepair) {
    dom.btnBuyRepair.addEventListener('click', () => {
      buyUpgrade(60, () => {
        gameState.player.health = gameState.player.maxHealth;
        gameState.player.shield = gameState.player.maxShield;
        logToTerminal('Hull dan Deflector Shield berhasil dipulihkan 100%.', 'success');
      });
    });
  }

  if (dom.btnBuyFuel) {
    dom.btnBuyFuel.addEventListener('click', () => {
      buyUpgrade(40, () => {
        gameState.player.fuel = gameState.player.maxFuel;
        logToTerminal('Tangki propulsi ion plasma diisi penuh.', 'success');
      });
    });
  }

  if (dom.btnBuyCargo) {
    dom.btnBuyCargo.addEventListener('click', () => {
      buyUpgrade(220, () => {
        gameState.cargo.maxCapacity += 50;
        logToTerminal(`Kapasitas kargo ditingkatkan menjadi ${gameState.cargo.maxCapacity} Ton!`, 'success');
      });
    });
  }

  if (dom.btnBuyDrone) {
    dom.btnBuyDrone.addEventListener('click', () => {
      buyUpgrade(450, () => {
        gameState.player.droneCount++;
        gameState.drones.push({
          x: gameState.player.x,
          y: gameState.player.y,
          vx: 0,
          vy: 0,
          target: null,
          angle: 0
        });
        logToTerminal(`Drone pengumpul otonom #${gameState.player.droneCount} aktif!`, 'success');
      });
    });
  }

  if (dom.btnBuyCooler) {
    dom.btnBuyCooler.addEventListener('click', () => {
      buyUpgrade(300, () => {
        gameState.player.coolingRate += 0.25;
        logToTerminal('Radiator Cryo ditingkatkan: pendingin laser 25% lebih cepat.', 'success');
      });
    });
  }

  if (dom.btnBuyMagnet) {
    dom.btnBuyMagnet.addEventListener('click', () => {
      buyUpgrade(180, () => {
        gameState.player.magnetRadius += 60;
        logToTerminal(`Medan traktor diperbesar: radius ${gameState.player.magnetRadius}px.`, 'success');
      });
    });
  }
}

// ==========================================
// 13. MAIN GAME UPDATE LOOP
// ==========================================
let lastTime = performance.now();

function gameLoop(time) {
  const delta = Math.min(time - lastTime, 100);
  lastTime = time;
  gameState.time += delta * 0.001;

  if (gameState.started && !gameState.gameOver && !gameState.paused) {
    updateGame(delta);
  }

  renderGame();
  requestAnimationFrame(gameLoop);
}

function updateGame(delta) {
  const p = gameState.player;

  if (gameState.screenShake > 0) {
    gameState.screenShake *= 0.9;
    if (gameState.screenShake < 0.1) gameState.screenShake = 0;
  }

  updateCombo(delta);
  updateBuffs();

  // Ship controls & rotation
  if (input.mouseInCanvas) {
    const dx = input.mouseX - p.x;
    const dy = input.mouseY - p.y;
    const targetAngle = Math.atan2(dy, dx);
    let diff = targetAngle - p.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    p.angle += diff * (p.rotationSpeed || 0.068);
  } else {
    if (input.left) p.angle -= p.rotationSpeed || 0.068;
    if (input.right) p.angle += p.rotationSpeed || 0.068;
  }

  // Thrust & Inertia
  if (input.up && p.fuel > 0) {
    const thrust = p.thrustPower || 0.20;
    p.vx += Math.cos(p.angle) * thrust;
    p.vy += Math.sin(p.angle) * thrust;
    p.fuel = Math.max(0, p.fuel - 0.04);

    // Twin engine exhaust particles
    const perpX = -Math.sin(p.angle) * 7;
    const perpY = Math.cos(p.angle) * 7;
    const backX = p.x - Math.cos(p.angle) * 16;
    const backY = p.y - Math.sin(p.angle) * 16;
    createParticles(backX + perpX, backY + perpY, 1, '#00f0ff', 0.8, true);
    createParticles(backX - perpX, backY - perpY, 1, '#00f0ff', 0.8, true);
  }

  p.vx *= p.friction || 0.985;
  p.vy *= p.friction || 0.985;
  const currentSpeed = Math.hypot(p.vx, p.vy);
  const maxSpd = p.maxSpeed || 6.5;
  if (currentSpeed > maxSpd) {
    p.vx = (p.vx / currentSpeed) * maxSpd;
    p.vy = (p.vy / currentSpeed) * maxSpd;
  }

  p.x += p.vx;
  p.y += p.vy;

  const margin = 45;
  if (p.x < -margin) p.x = canvasWidth + margin;
  if (p.x > canvasWidth + margin) p.x = -margin;
  if (p.y < -margin) p.y = canvasHeight + margin;
  if (p.y > canvasHeight + margin) p.y = -margin;

  const coolRate = (p.coolingRate || 0.48) * (delta / 16);
  p.heat = Math.max(0, p.heat - coolRate);
  if (p.isOverheated && p.heat < 25) {
    p.isOverheated = false;
    logToTerminal('Laser dingin kembali: Siap menembak!', 'info');
  }

  if (input.fire) fireLaser();

  // Shield hit animation decay
  if (p.shieldHitAnim > 0) p.shieldHitAnim -= delta * 0.005;

  // Station proximity check
  const distStation = Math.hypot(p.x - gameState.station.x, p.y - gameState.station.y);
  const canDock = distStation < gameState.station.radius + 65;
  if (dom.btnDockStation) {
    if (canDock) dom.btnDockStation.classList.remove('hidden');
    else dom.btnDockStation.classList.add('hidden');
  }

  gameState.station.rotation += gameState.station.ringSpeed;

  // Update Autonomous Drones
  gameState.drones.forEach(dr => {
    let target = null;
    let minDist = 500;
    gameState.crystals.forEach(c => {
      const d = Math.hypot(dr.x - c.x, dr.y - c.y);
      if (d < minDist) {
        minDist = d;
        target = c;
      }
    });

    if (target) {
      const dx = target.x - dr.x;
      const dy = target.y - dr.y;
      dr.angle = Math.atan2(dy, dx);
      dr.vx += Math.cos(dr.angle) * 0.35;
      dr.vy += Math.sin(dr.angle) * 0.35;
      target.vx += (dr.x - target.x) * 0.04;
      target.vy += (dr.y - target.y) * 0.04;
    } else {
      // Orbit player
      const dx = p.x - dr.x;
      const dy = p.y - dr.y;
      dr.vx += dx * 0.005;
      dr.vy += dy * 0.005;
    }

    dr.vx *= 0.94;
    dr.vy *= 0.94;
    dr.x += dr.vx;
    dr.y += dr.vy;
  });

  // Update Singularities (Vortex)
  for (let i = gameState.singularities.length - 1; i >= 0; i--) {
    const sing = gameState.singularities[i];
    const elapsed = Date.now() - sing.created;
    sing.rotation += 0.12;

    if (elapsed > sing.duration) {
      // Detonate final quantum explosion
      triggerQuantumExplosion(sing.x, sing.y);
      gameState.singularities.splice(i, 1);
      continue;
    }

    // Pull nearby asteroids & enemies into vortex
    gameState.asteroids.forEach(ast => {
      const d = Math.hypot(sing.x - ast.x, sing.y - ast.y);
      if (d < sing.radius) {
        ast.vx += (sing.x - ast.x) * 0.015;
        ast.vy += (sing.y - ast.y) * 0.015;
        ast.health -= 0.8;
      }
    });

    gameState.enemies.forEach(en => {
      const d = Math.hypot(sing.x - en.x, sing.y - en.y);
      if (d < sing.radius) {
        en.vx += (sing.x - en.x) * 0.02;
        en.vy += (sing.y - en.y) * 0.02;
        en.health -= 1.2;
      }
    });

    // Swirl crystals
    gameState.crystals.forEach(c => {
      const d = Math.hypot(sing.x - c.x, sing.y - c.y);
      if (d < sing.radius) {
        c.vx += (sing.x - c.x) * 0.03;
        c.vy += (sing.y - c.y) * 0.03;
      }
    });
  }

  // Update Projectiles
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const proj = gameState.projectiles[i];
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life -= delta;

    if (proj.life <= 0 || proj.x < -100 || proj.x > canvasWidth + 100 || proj.y < -100 || proj.y > canvasHeight + 100) {
      gameState.projectiles.splice(i, 1);
      continue;
    }

    // Hit Asteroids
    let hitAsteroid = false;
    for (let j = gameState.asteroids.length - 1; j >= 0; j--) {
      const ast = gameState.asteroids[j];
      const dist = Math.hypot(proj.x - ast.x, proj.y - ast.y);
      if (dist < ast.radius) {
        ast.health -= proj.damage;
        createParticles(proj.x, proj.y, 4, proj.color, 1, true);
        hitAsteroid = true;

        if (ast.health <= 0) {
          destroyAsteroid(j);
        }
        break;
      }
    }

    if (hitAsteroid) {
      gameState.projectiles.splice(i, 1);
      continue;
    }

    // Hit Boss
    if (gameState.boss) {
      const distBoss = Math.hypot(proj.x - gameState.boss.x, proj.y - gameState.boss.y);
      if (distBoss < gameState.boss.radius) {
        gameState.boss.health -= proj.damage;
        createParticles(proj.x, proj.y, 6, '#ff007f', 1.2, true);
        if (gameState.boss.health <= 0) destroyBoss();
        gameState.projectiles.splice(i, 1);
        continue;
      }
    }

    // Hit Enemies
    for (let k = gameState.enemies.length - 1; k >= 0; k--) {
      const en = gameState.enemies[k];
      const dist = Math.hypot(proj.x - en.x, proj.y - en.y);
      if (dist < en.radius) {
        en.health -= proj.damage;
        createParticles(proj.x, proj.y, 6, '#ff007f', 1.2, true);
        if (en.health <= 0) {
          destroyEnemy(k);
        }
        gameState.projectiles.splice(i, 1);
        break;
      }
    }
  }

  // Update Missiles
  for (let i = gameState.missiles.length - 1; i >= 0; i--) {
    const mis = gameState.missiles[i];
    mis.x += mis.vx;
    mis.y += mis.vy;
    mis.life -= delta;

    createParticles(mis.x, mis.y, 1, '#ffd700', 0.5, true);

    let explode = false;
    if (mis.life <= 0) explode = true;

    for (let j = gameState.asteroids.length - 1; j >= 0; j--) {
      const ast = gameState.asteroids[j];
      if (Math.hypot(mis.x - ast.x, mis.y - ast.y) < ast.radius + 10) {
        explode = true;
        break;
      }
    }

    if (explode) {
      spawnSingularityVortex(mis.x, mis.y);
      gameState.missiles.splice(i, 1);
    }
  }

  // Update Enemy Projectiles
  for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = gameState.enemyProjectiles[i];
    ep.x += ep.vx;
    ep.y += ep.vy;
    ep.life -= delta;

    if (ep.life <= 0) {
      gameState.enemyProjectiles.splice(i, 1);
      continue;
    }

    const distToPlayer = Math.hypot(ep.x - p.x, ep.y - p.y);
    if (distToPlayer < 22) {
      damagePlayer(20);
      createParticles(ep.x, ep.y, 8, '#ff2a5f', 1.5, true);
      gameState.enemyProjectiles.splice(i, 1);
    }
  }

  // Update Boss
  if (gameState.boss) {
    const b = gameState.boss;
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const dist = Math.hypot(dx, dy);
    b.angle = Math.atan2(dy, dx);

    // Slow approach
    if (dist > 300) {
      b.vx += (dx / dist) * 0.05;
      b.vy += (dy / dist) * 0.05;
    }
    b.vx *= 0.96;
    b.vy *= 0.96;
    b.x += b.vx;
    b.y += b.vy;

    const now = Date.now();
    if (now - b.lastFired > 1400) {
      b.lastFired = now;
      sounds.laser('plasma');
      [-0.2, 0, 0.2].forEach(spread => {
        const a = b.angle + spread;
        gameState.enemyProjectiles.push({
          x: b.x + Math.cos(a) * 40,
          y: b.y + Math.sin(a) * 40,
          vx: Math.cos(a) * 7.5,
          vy: Math.sin(a) * 7.5,
          life: 2500
        });
      });
    }

    if (dom.bossHpFill && dom.bossHpPercent) {
      const pct = Math.max(0, Math.round((b.health / b.maxHealth) * 100));
      dom.bossHpFill.style.width = `${pct}%`;
      dom.bossHpPercent.textContent = `${pct}%`;
    }
  }

  // Update Enemies
  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const en = gameState.enemies[i];
    const dx = p.x - en.x;
    const dy = p.y - en.y;
    const dist = Math.hypot(dx, dy);

    en.angle = Math.atan2(dy, dx);

    if (dist > 240) {
      en.vx += (dx / dist) * 0.09;
      en.vy += (dy / dist) * 0.09;
    } else if (dist < 150) {
      en.vx -= (dx / dist) * 0.07;
      en.vy -= (dy / dist) * 0.07;
    }
    en.vx += (-dy / dist) * 0.04;
    en.vy += (dx / dist) * 0.04;

    en.vx *= 0.95;
    en.vy *= 0.95;
    en.x += en.vx;
    en.y += en.vy;

    const now = Date.now();
    if (now - en.lastFired > en.fireInterval && dist < 480) {
      en.lastFired = now;
      sounds.laser('plasma');
      const fireAngle = Math.atan2(p.y - en.y, p.x - en.x);
      gameState.enemyProjectiles.push({
        x: en.x,
        y: en.y,
        vx: Math.cos(fireAngle) * 7,
        vy: Math.sin(fireAngle) * 7,
        life: 2000
      });
    }
  }

  // Update Asteroids
  gameState.asteroids.forEach(ast => {
    ast.x += ast.vx;
    ast.y += ast.vy;
    ast.angle += ast.vRot;

    if (ast.x < -ast.radius * 2) ast.x = canvasWidth + ast.radius * 2;
    if (ast.x > canvasWidth + ast.radius * 2) ast.x = -ast.radius * 2;
    if (ast.y < -ast.radius * 2) ast.y = canvasHeight + ast.radius * 2;
    if (ast.y > canvasHeight + ast.radius * 2) ast.y = -ast.radius * 2;

    const distPlayer = Math.hypot(ast.x - p.x, ast.y - p.y);
    if (distPlayer < ast.radius + 15) {
      const bounceAngle = Math.atan2(p.y - ast.y, p.x - ast.x);
      p.vx += Math.cos(bounceAngle) * 3.5;
      p.vy += Math.sin(bounceAngle) * 3.5;
      damagePlayer(Math.floor(ast.radius * 0.45));
      createParticles(p.x, p.y, 10, '#ffd700', 1.5, true);
    }
  });

  // Update Minerals
  const magnetRadius = (p.magnetRadius || 160) * (gameState.buffs.hyper_magnet ? 2.5 : 1);
  for (let i = gameState.crystals.length - 1; i >= 0; i--) {
    const c = gameState.crystals[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vx *= 0.98;
    c.vy *= 0.98;

    const dist = Math.hypot(p.x - c.x, p.y - c.y);
    if (dist < magnetRadius) {
      const pull = (1 - dist / magnetRadius) * 0.5;
      c.vx += ((p.x - c.x) / dist) * pull * 4.5;
      c.vy += ((p.y - c.y) / dist) * pull * 4.5;
    }

    if (dist < 28) {
      pickupMineral(c.type);
      gameState.crystals.splice(i, 1);
    }
  }

  // Update PowerUps
  for (let i = gameState.powerups.length - 1; i >= 0; i--) {
    const pu = gameState.powerups[i];
    pu.x += pu.vx;
    pu.y += pu.vy;
    pu.vx *= 0.98;
    pu.vy *= 0.98;

    const dist = Math.hypot(p.x - pu.x, p.y - pu.y);
    if (dist < 32) {
      applyPowerUp(pu.type);
      gameState.powerups.splice(i, 1);
    }
  }

  // Update Particles
  const damping = gameState.settings.particleDamping || 0.94;
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const part = gameState.particles[i];
    part.vx *= damping;
    part.vy *= damping;
    part.x += part.vx;
    part.y += part.vy;
    part.alpha -= 0.022;
    part.radius *= 0.96;

    if (part.alpha <= 0 || part.radius < 0.3) {
      gameState.particles.splice(i, 1);
    }
  }

  // Update Floating Texts
  for (let i = gameState.floatingTexts.length - 1; i >= 0; i--) {
    const ft = gameState.floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= 0.02;
    if (ft.alpha <= 0) {
      gameState.floatingTexts.splice(i, 1);
    }
  }

  if (p.health <= 0) {
    p.health = 0;
    triggerGameOver();
  }

  // Spawns replenishment
  if (gameState.asteroids.length < 6) spawnAsteroid();

  if (gameState.enemies.length < 2 && Math.random() < 0.003) {
    spawnEnemy(Math.random() > 0.4 ? 'scout' : 'gunship');
    logToTerminal('⚠ DETEKSI RADAR: Drone Raider perompak memasuki sektor!', 'warn');
  }

  // Boss wave trigger at score thresholds
  if (!gameState.boss && gameState.score > 2500 && Math.random() < 0.002) {
    spawnEnemy('boss');
  }

  updateHUD();
}

function destroyAsteroid(index) {
  const ast = gameState.asteroids[index];
  sounds.explosion(ast.tier === 3);
  gameState.screenShake = ast.tier === 3 ? 12 : 6;

  createParticles(ast.x, ast.y, ast.tier * 9, ORE_TYPES[ast.oreType].color, 1.4);

  const numOre = ast.tier === 3 ? 4 : (ast.tier === 2 ? 2 : 1);
  for (let i = 0; i < numOre; i++) {
    spawnMineral(ast.x, ast.y, ast.oreType);
  }

  if (ast.tier > 1) {
    spawnAsteroid(ast.x - 14, ast.y - 14, null, ast.tier - 1);
    spawnAsteroid(ast.x + 14, ast.y + 14, null, ast.tier - 1);
  }

  if (Math.random() < 0.16) {
    spawnPowerUp(ast.x, ast.y);
  }

  const scoreVal = ast.tier * 30 * gameState.combo.multiplier;
  gameState.score += scoreVal;
  registerHitStreak();
  addFloatingText(ast.x, ast.y, `+${scoreVal} PTS`, '#00f0ff');

  gameState.asteroids.splice(index, 1);
}

function destroyEnemy(index) {
  const en = gameState.enemies[index];
  sounds.explosion(true);
  gameState.screenShake = 14;

  createParticles(en.x, en.y, 28, '#ff007f', 2);
  spawnPowerUp(en.x, en.y);
  spawnMineral(en.x, en.y, 'platinum');
  spawnMineral(en.x, en.y, 'gold');

  gameState.score += 300 * gameState.combo.multiplier;
  registerHitStreak();
  updateMissionProgress('kill_raider', 1);
  addFloatingText(en.x, en.y, `RAIDER ANNIHILATED! +${300 * gameState.combo.multiplier} PTS`, '#ff2a5f');

  gameState.enemies.splice(index, 1);
}

function destroyBoss() {
  const b = gameState.boss;
  sounds.explosion(true);
  gameState.screenShake = 28;

  createParticles(b.x, b.y, 60, '#ff007f', 3.5);
  createParticles(b.x, b.y, 40, '#ffd700', 3);

  for (let i = 0; i < 6; i++) spawnMineral(b.x, b.y, 'uranium');
  for (let i = 0; i < 4; i++) spawnPowerUp(b.x, b.y);

  gameState.score += 2000 * gameState.combo.multiplier;
  gameState.credits += 1200;
  gameState.threatLevel++;
  if (dom.sectorThreatLevel) dom.sectorThreatLevel.textContent = `THREAT: LVL ${gameState.threatLevel}`;

  addFloatingText(b.x, b.y, `BOSS DESTROYED! +$K 1200 & +${2000 * gameState.combo.multiplier} PTS!`, '#ffd700');
  logToTerminal('VICTORY: Dreadnought Pirate "Iron Vulture" berhasil dihancurkan!', 'success');

  gameState.boss = null;
  if (dom.bossBarContainer) dom.bossBarContainer.classList.add('hidden');
}

function triggerQuantumExplosion(x, y) {
  sounds.explosion(true);
  gameState.screenShake = 20;
  createParticles(x, y, 45, '#ffd700', 3);
  createParticles(x, y, 35, '#00f0ff', 2.5);

  const blastRadius = 240;

  gameState.asteroids.forEach((ast, idx) => {
    const dist = Math.hypot(x - ast.x, y - ast.y);
    if (dist < blastRadius) {
      ast.health -= 260;
      if (ast.health <= 0) destroyAsteroid(idx);
    }
  });

  gameState.enemies.forEach((en, idx) => {
    const dist = Math.hypot(x - en.x, y - en.y);
    if (dist < blastRadius) {
      en.health -= 320;
      if (en.health <= 0) destroyEnemy(idx);
    }
  });

  if (gameState.boss) {
    const dist = Math.hypot(x - gameState.boss.x, y - gameState.boss.y);
    if (dist < blastRadius) {
      gameState.boss.health -= 250;
      if (gameState.boss.health <= 0) destroyBoss();
    }
  }
}

function pickupMineral(type) {
  sounds.pickup();
  const c = gameState.cargo.stored;
  const currentTotal = c.iron + c.gold + c.platinum + c.uranium;

  if (currentTotal < gameState.cargo.maxCapacity) {
    c[type]++;
    const oreDef = ORE_TYPES[type];
    addFloatingText(gameState.player.x, gameState.player.y - 18, `+1 ${oreDef.name}`, oreDef.color);

    if (type === 'iron') updateMissionProgress('mine_iron', 1);
    if (type === 'gold') updateMissionProgress('mine_gold', 1);
  } else {
    addFloatingText(gameState.player.x, gameState.player.y - 18, 'KARGO PENUH!', '#ff2a5f');
  }
}

function damagePlayer(amount) {
  const p = gameState.player;
  sounds.explosion(false);
  gameState.screenShake = 10;
  p.shieldHitAnim = 1.0;

  if (p.shield > 0) {
    p.shield -= amount;
    if (p.shield < 0) {
      p.health += p.shield;
      p.shield = 0;
    }
  } else {
    p.health -= amount;
  }

  if (p.health < 30 && dom.emergencyAlarm) {
    dom.emergencyAlarm.classList.remove('hidden');
  }
}

function triggerGameOver() {
  gameState.gameOver = true;
  sounds.explosion(true);
  if (dom.gameOverScreen) dom.gameOverScreen.classList.remove('hidden');
  if (dom.finalCreditsDisplay) dom.finalCreditsDisplay.textContent = `$K ${gameState.credits}`;
  if (dom.finalScoreDisplay) dom.finalScoreDisplay.textContent = `${gameState.score} PTS`;
  logToTerminal('KAPAL HANCUR! Game Over.', 'error');
}

function updateHUD() {
  const p = gameState.player;
  const c = gameState.cargo.stored;
  const totalCargo = c.iron + c.gold + c.platinum + c.uranium;

  const shieldPct = Math.max(0, Math.min(100, Math.round((p.shield / p.maxShield) * 100)));
  const healthPct = Math.max(0, Math.min(100, Math.round((p.health / p.maxHealth) * 100)));
  const fuelPct = Math.max(0, Math.min(100, Math.round((p.fuel / p.maxFuel) * 100)));
  const heatPct = Math.max(0, Math.min(100, Math.round((p.heat / p.maxHeat) * 100)));

  if (dom.shieldPercent) dom.shieldPercent.textContent = `${shieldPct}%`;
  if (dom.shieldFill) dom.shieldFill.style.width = `${shieldPct}%`;

  if (dom.healthPercent) dom.healthPercent.textContent = `${healthPct}%`;
  if (dom.healthFill) dom.healthFill.style.width = `${healthPct}%`;

  if (dom.fuelPercent) dom.fuelPercent.textContent = `${fuelPct}%`;
  if (dom.fuelFill) dom.fuelFill.style.width = `${fuelPct}%`;

  if (dom.overheatPercent) dom.overheatPercent.textContent = `${heatPct}%`;
  if (dom.overheatFill) dom.overheatFill.style.width = `${heatPct}%`;

  const now = Date.now();
  const cooldown = p.missileCooldownTime || 4000;
  const missileElapsed = now - p.lastMissileFired;
  const missilePct = Math.min(100, Math.round((missileElapsed / cooldown) * 100));
  if (dom.missileFill) dom.missileFill.style.width = `${missilePct}%`;
  if (dom.missileStatus) {
    dom.missileStatus.textContent = missilePct >= 100 ? 'SIAP [Q / R-CLICK]' : `RELOAD ${Math.ceil((cooldown - missileElapsed) / 1000)}s`;
    dom.missileStatus.style.color = missilePct >= 100 ? '#00f0ff' : '#94a3b8';
  }

  if (dom.creditsDisplay) dom.creditsDisplay.textContent = `$K ${gameState.credits}`;
  if (dom.cargoDisplay) dom.cargoDisplay.textContent = `${totalCargo} / ${gameState.cargo.maxCapacity} TON`;
  if (dom.scoreDisplay) dom.scoreDisplay.textContent = `${gameState.score} PTS`;

  if (dom.countIron) dom.countIron.textContent = c.iron;
  if (dom.countGold) dom.countGold.textContent = c.gold;
  if (dom.countPlatinum) dom.countPlatinum.textContent = c.platinum;
  if (dom.countUranium) dom.countUranium.textContent = c.uranium;

  if (dom.emergencyAlarm) {
    if (p.health < 30 && !gameState.gameOver) dom.emergencyAlarm.classList.remove('hidden');
    else dom.emergencyAlarm.classList.add('hidden');
  }

  renderMinimap();
}

function renderMinimap() {
  if (!dom.miniMapCanvas) return;
  const ctx = dom.miniMapCanvas.getContext('2d');
  const w = dom.miniMapCanvas.width;
  const h = dom.miniMapCanvas.height;
  const scale = w / Math.max(canvasWidth, canvasHeight);

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
  ctx.stroke();

  const sweepAngle = (gameState.time * 2.4) % (Math.PI * 2);
  ctx.beginPath();
  ctx.moveTo(w / 2, h / 2);
  ctx.lineTo(w / 2 + Math.cos(sweepAngle) * (w / 2), h / 2 + Math.sin(sweepAngle) * (h / 2));
  ctx.stroke();

  // Station
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(gameState.station.x * scale - 2, gameState.station.y * scale - 2, 4, 4);

  // Asteroids
  ctx.fillStyle = '#64748b';
  gameState.asteroids.forEach(ast => {
    ctx.fillRect(ast.x * scale - 1, ast.y * scale - 1, 2, 2);
  });

  // Enemies
  ctx.fillStyle = '#ff007f';
  gameState.enemies.forEach(en => {
    ctx.fillRect(en.x * scale - 2, en.y * scale - 2, 3, 3);
  });

  // Boss
  if (gameState.boss) {
    ctx.fillStyle = '#ff2a5f';
    ctx.fillRect(gameState.boss.x * scale - 3, gameState.boss.y * scale - 3, 6, 6);
  }

  // Crystals
  ctx.fillStyle = '#ffd700';
  gameState.crystals.forEach(c => {
    ctx.fillRect(c.x * scale - 1, c.y * scale - 1, 1.5, 1.5);
  });

  // Player
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.arc(gameState.player.x * scale, gameState.player.y * scale, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ==========================================
// 14. CANVAS 2D RENDERING ENGINE (FORMULAS 1 - 6)
// ==========================================
function renderGame() {
  if (!dom.gameCanvas) return;
  const ctx = dom.gameCanvas.getContext('2d');

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, dom.gameCanvas.width, dom.gameCanvas.height);
  ctx.restore();

  const dpr = gameState.settings.dpiScaling ? (window.devicePixelRatio || 1) : 1;
  ctx.save();
  if (gameState.settings.dpiScaling) {
    ctx.scale(dpr, dpr);
  }

  if (gameState.settings.screenShakeEnabled && gameState.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * gameState.screenShake;
    const shakeY = (Math.random() - 0.5) * gameState.screenShake;
    ctx.translate(shakeX, shakeY);
  }

  renderSpaceBackground(ctx);
  renderSpaceStation(ctx);
  renderAsteroids(ctx);
  renderMinerals(ctx);
  renderPowerUps(ctx);
  renderEnemies(ctx);
  renderBoss(ctx);
  renderSingularities(ctx);
  renderDrones(ctx);
  renderProjectiles(ctx);
  renderParticles(ctx);

  if (!gameState.gameOver) {
    renderPlayerShip(ctx);
  }

  renderFloatingTexts(ctx);

  ctx.restore();
}

function renderSpaceBackground(ctx) {
  ctx.fillStyle = '#03050c';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Parallax Nebula clouds
  const g1 = ctx.createRadialGradient(canvasWidth * 0.25, canvasHeight * 0.3, 20, canvasWidth * 0.25, canvasHeight * 0.3, 420);
  g1.addColorStop(0, 'rgba(0, 240, 255, 0.06)');
  g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const g2 = ctx.createRadialGradient(canvasWidth * 0.8, canvasHeight * 0.75, 40, canvasWidth * 0.8, canvasHeight * 0.75, 460);
  g2.addColorStop(0, 'rgba(176, 38, 255, 0.05)');
  g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Parallax stars
  gameState.stars.forEach(s => {
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.alpha * (0.8 + Math.sin(gameState.time * 2 + s.x) * 0.2);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;
}

function renderSpaceStation(ctx) {
  const s = gameState.station;
  ctx.save();
  ctx.translate(s.x, s.y);

  // Outer rotating habitat ring
  ctx.save();
  ctx.rotate(s.rotation);

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = gameState.settings.dualLayerGlow ? 12 : 0;
  ctx.beginPath();
  ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Spoke struts & solar panels
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 25, Math.sin(a) * 25);
    ctx.lineTo(Math.cos(a) * s.radius, Math.sin(a) * s.radius);
    ctx.stroke();

    // Solar array wings
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(Math.cos(a) * (s.radius - 20) - 8, Math.sin(a) * (s.radius - 20) - 8, 16, 16);
  }
  ctx.restore();

  // Inner hub core
  ctx.fillStyle = '#0a1628';
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = gameState.settings.dualLayerGlow ? 10 : 0;
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Green docking beacon
  const beaconGlow = Math.sin(gameState.time * (gameState.settings.sineSpeed || 1) * 4) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(0, 255, 136, ${0.4 + beaconGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#00ff88';
  ctx.font = '9px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STASIUN OLYMPUS-9', 0, s.radius + 18);
  ctx.fillText('[BERLABUH: DEKATI & TEKAN E]', 0, s.radius + 30);

  ctx.restore();
}

function renderAsteroids(ctx) {
  gameState.asteroids.forEach(ast => {
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.angle);

    const oreDef = ORE_TYPES[ast.oreType];

    ctx.beginPath();
    ast.vertices.forEach((v, i) => {
      if (i === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();

    // 3D-shaded faceted rock gradient
    const grad = ctx.createLinearGradient(-ast.radius, -ast.radius, ast.radius, ast.radius);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowing mineral veins
    ctx.strokeStyle = oreDef.color;
    ctx.lineWidth = 2;
    if (gameState.settings.dualLayerGlow) {
      ctx.shadowColor = oreDef.color;
      ctx.shadowBlur = 9;
    }
    ctx.stroke();

    // Facet lighting lines
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ast.vertices[0].x * 0.45, ast.vertices[0].y * 0.45);
    for (let i = 1; i < ast.vertices.length; i += 2) {
      ctx.lineTo(ast.vertices[i].x * 0.45, ast.vertices[i].y * 0.45);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  });
}

function renderMinerals(ctx) {
  const sineSpeed = gameState.settings.sineSpeed || 1.0;

  gameState.crystals.forEach(c => {
    ctx.save();
    const floatY = gameState.settings.sineOscillations ? Math.sin(gameState.time * sineSpeed * 3 + c.id * 10) * 4 : 0;
    ctx.translate(c.x, c.y + floatY);

    const oreDef = ORE_TYPES[c.type];
    const r = c.radius;

    if (gameState.settings.dualLayerGlow) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = oreDef.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = oreDef.color;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Octahedron crystal polygon
    ctx.fillStyle = oreDef.color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.7, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.7, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function renderPowerUps(ctx) {
  gameState.powerups.forEach(pu => {
    ctx.save();
    const floatY = Math.sin(gameState.time * 4) * 3;
    ctx.translate(pu.x, pu.y + floatY);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = pu.color;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = pu.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.font = '12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pu.icon, 0, 0);

    ctx.restore();
  });
}

function renderEnemies(ctx) {
  gameState.enemies.forEach(en => {
    ctx.save();
    ctx.translate(en.x, en.y);
    ctx.rotate(en.angle);

    if (gameState.settings.dualLayerGlow) {
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 14;
    }

    ctx.fillStyle = '#1e0515';
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2;

    if (en.type === 'gunship') {
      // Heavy pirate gunship polygon
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.lineTo(6, 18);
      ctx.lineTo(-20, 20);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-20, -20);
      ctx.lineTo(6, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff2a5f';
      ctx.fillRect(8, -4, 8, 8);
    } else {
      // Scout drone polygon
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-14, 12);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff2a5f';
      ctx.beginPath();
      ctx.arc(4, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function renderBoss(ctx) {
  if (!gameState.boss) return;
  const b = gameState.boss;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);

  ctx.shadowColor = '#ff2a5f';
  ctx.shadowBlur = 18;

  // Dreadnought flagship hull
  ctx.fillStyle = '#160410';
  ctx.strokeStyle = '#ff2a5f';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(48, 0);
  ctx.lineTo(16, 34);
  ctx.lineTo(-38, 42);
  ctx.lineTo(-24, 16);
  ctx.lineTo(-44, 0);
  ctx.lineTo(-24, -16);
  ctx.lineTo(-38, -42);
  ctx.lineTo(16, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing command bridge
  ctx.fillStyle = '#ff007f';
  ctx.beginPath();
  ctx.ellipse(8, 0, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderSingularities(ctx) {
  gameState.singularities.forEach(sing => {
    ctx.save();
    ctx.translate(sing.x, sing.y);
    ctx.rotate(sing.rotation);

    // Swirling black hole vortex
    const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, sing.radius);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(0.2, 'rgba(176, 38, 255, 0.4)');
    grad.addColorStop(0.6, 'rgba(0, 240, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, sing.radius, 0, Math.PI * 2);
    ctx.fill();

    // Event horizon ring
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  });
}

function renderDrones(ctx) {
  gameState.drones.forEach(dr => {
    ctx.save();
    ctx.translate(dr.x, dr.y);
    ctx.rotate(dr.angle);

    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function renderProjectiles(ctx) {
  const blur = gameState.settings.glowBlur || 16;
  const core = gameState.settings.coreBrightness || 1.0;

  gameState.projectiles.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const angle = Math.atan2(p.vy, p.vx);
    ctx.rotate(angle);

    if (gameState.settings.dualLayerGlow) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = p.color;
      ctx.shadowBlur = blur;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = p.coreColor || '#ffffff';
      ctx.lineWidth = 1.6 * core;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
    }

    ctx.restore();
  });

  // Missiles
  gameState.missiles.forEach(m => {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.angle);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(12, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#b026ff';
    ctx.fillRect(-12, -3.5, 24, 7);

    ctx.restore();
  });

  // Enemy Projectiles
  gameState.enemyProjectiles.forEach(ep => {
    ctx.save();
    ctx.translate(ep.x, ep.y);
    ctx.fillStyle = '#ff2a5f';
    ctx.shadowColor = '#ff2a5f';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function renderParticles(ctx) {
  gameState.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    if (gameState.settings.dualLayerGlow) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function renderPlayerShip(ctx) {
  const p = gameState.player;
  const blur = gameState.settings.glowBlur || 16;
  const core = gameState.settings.coreBrightness || 1.0;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // Deflector shield bubble
  if (p.shield > 0) {
    const shieldPulse = gameState.settings.sineOscillations ? Math.sin(gameState.time * 4) * 0.15 : 0;
    const hitPulse = p.shieldHitAnim * 0.4;
    ctx.save();
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + shieldPulse + hitPulse})`;
    ctx.lineWidth = 1.5 + hitPulse * 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10 + hitPulse * 10;
    ctx.beginPath();
    ctx.arc(0, 0, 29, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Engine flame plumes
  if (input.up && p.fuel > 0) {
    const flameLen = 16 + Math.random() * 8;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;

    // Twin nozzles
    [-7, 7].forEach(offsetY => {
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(-14, offsetY - 4);
      ctx.lineTo(-14 - flameLen, offsetY);
      ctx.lineTo(-14, offsetY + 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-14, offsetY - 2);
      ctx.lineTo(-14 - flameLen * 0.6, offsetY);
      ctx.lineTo(-14, offsetY + 2);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  // Ship Hull Vector Polygon (Technique 3)
  ctx.save();
  if (gameState.settings.dualLayerGlow) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = blur;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(24, 0);       // Nose
    ctx.lineTo(-14, 16);     // Right wingtip
    ctx.lineTo(-8, 6);       // Right inner hull
    ctx.lineTo(-14, 0);      // Center engine bracket
    ctx.lineTo(-8, -6);      // Left inner hull
    ctx.lineTo(-14, -16);    // Left wingtip
    ctx.closePath();
    ctx.stroke();

    // Hot white core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2 * core;
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-14, 16);
    ctx.lineTo(-8, 6);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-14, -16);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Cockpit canopy
  ctx.fillStyle = '#0a172e';
  ctx.beginPath();
  ctx.ellipse(3, 0, 7.5, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Navigation lights
  const blink = (Math.floor(gameState.time * 4) % 2) === 0;
  if (blink) {
    ctx.fillStyle = '#00ff88'; // Starboard green
    ctx.fillRect(-14, 15, 2, 2);
    ctx.fillStyle = '#ff2a5f'; // Port red
    ctx.fillRect(-14, -17, 2, 2);
  }

  ctx.restore();
}

function renderFloatingTexts(ctx) {
  ctx.save();
  ctx.font = 'bold 11px Orbitron, sans-serif';
  ctx.textAlign = 'center';

  gameState.floatingTexts.forEach(ft => {
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.fillText(ft.text, ft.x, ft.y);
  });

  ctx.restore();
}
