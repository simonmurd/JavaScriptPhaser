/**
 * ==========================================================================
 * SUPER BOMBERMAN R (90s RETRO EDITION) - MODUL-06.JS [ENHANCED PRO EDITION]
 * Engine Game Retro 90-an dengan Grafis Piksel Otentik, Sintesis Web Audio 8-Bit,
 * AI Rival Kurobom (1v1 Battle Mode), Boss Magnetik, Power-Up Lengkap,
 * Efek Screen Shake & Partikel, serta Sinkronisasi Editor Kode.
 * ==========================================================================
 */

// --- 1. PRESET SKRIP UNTUK EDITOR KODE ---
const PRESETS = {
  stage1: `// SUPER BOMBERMAN R - STAGE 1: SOLAR PLANET
// Classic Green Grasslands & Ballom Patrols

class SolarPlanetConfig {
  init() {
    this.stageNumber = 1;
    this.theme = 'solar';
    this.GRID_SIZE = 40;
    this.COLS = 15;
    this.ROWS = 11;

    // Player Configuration (Ubah di sini lalu klik Jalankan!)
    this.lives = 3;
    this.maxBombs = 1;
    this.firePower = 2;
    this.moveSpeed = 160;
    this.bossHp = 8;
  }
}`,
  stage2: `// SUPER BOMBERMAN R - STAGE 2: CYBER FACTORY
// High Speed Neon Circuits & Minvo Demons

class CyberStageConfig {
  init() {
    this.stageNumber = 2;
    this.theme = 'cyber';
    this.GRID_SIZE = 40;
    this.COLS = 15;
    this.ROWS = 11;

    // Player Configuration
    this.lives = 3;
    this.maxBombs = 2;
    this.firePower = 3;
    this.moveSpeed = 180;
    this.bossHp = 10;
  }
}`,
  stage3: `// SUPER BOMBERMAN R - STAGE 3: MAGMA RUINS
// Volcanic Core & Lava Crags

class MagmaStageConfig {
  init() {
    this.stageNumber = 3;
    this.theme = 'magma';
    this.GRID_SIZE = 40;
    this.COLS = 15;
    this.ROWS = 11;

    // Player Configuration
    this.lives = 2;
    this.maxBombs = 3;
    this.firePower = 4;
    this.moveSpeed = 190;
    this.bossHp = 10;
  }
}`,
  stage4: `// SUPER BOMBERMAN R - STAGE 4: STAR FORTRESS (BOSS BATTLE)
// Magnet Bomber Boss Arena with Gravitational Pull

class BossStageConfig {
  init() {
    this.stageNumber = 4;
    this.theme = 'fortress';
    this.GRID_SIZE = 40;
    this.COLS = 15;
    this.ROWS = 11;

    // Player vs Magnet Bomber Configuration
    this.lives = 3;
    this.maxBombs = 3;
    this.firePower = 4;
    this.moveSpeed = 180;
    this.bossHp = 12; // Magnet Bomber HP
  }
}`,
  battle: `// SUPER BOMBERMAN R - STAGE 5: BATTLE ARENA (1v1 vs KUROBOM AI)
// Classic Deathmatch against Smart Black Bomberman CPU Rival

class BattleArenaConfig {
  init() {
    this.stageNumber = 5;
    this.theme = 'battle';
    this.GRID_SIZE = 40;
    this.COLS = 15;
    this.ROWS = 11;

    // 1v1 Battle Configuration
    this.lives = 3;
    this.maxBombs = 2;
    this.firePower = 3;
    this.moveSpeed = 180;
    this.bossHp = 4; // Kurobom Rival Hearts
  }
}`,
  turbo: `// SUPER BOMBERMAN R - CHAOS MANIA MODE (TURBO)
// Max Speed, High Firepower, 5 Simultaneous Bombs!

class ChaosTurboConfig {
  init() {
    this.stageNumber = 1;
    this.theme = 'solar';

    // Overpowered Custom Settings
    this.lives = 5;
    this.maxBombs = 5;
    this.firePower = 5;
    this.moveSpeed = 240;
    this.bossHp = 15;
  }
}`
};

// --- 2. SINTESIS AUDIO 8-BIT CHIPTUNE (Web Audio API) ---
const AudioFX = {
  ctx: null,
  isMuted: false,
  sfxVolume: 0.7,
  bgmVolume: 0.35,
  bgmPlaying: false,
  bgmTimeout: null,
  currentTheme: 'solar',

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch(e) { console.warn("AudioContext failed:", e); }
  },

  play(type) {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'drop') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(340, t); osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      gain.gain.setValueAtTime(this.sfxVolume * 0.35, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.12);
    } else if (type === 'explode') {
      const sampleRate = this.ctx.sampleRate;
      const dur = 0.48;
      const bufSize = Math.floor(sampleRate * dur);
      const buf = this.ctx.createBuffer(1, bufSize, sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-3.2 * (i / bufSize));
      const noise = this.ctx.createBufferSource(); noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, t); filter.frequency.exponentialRampToValueAtTime(70, t + dur);
      gain.gain.setValueAtTime(this.sfxVolume * 0.65, t); gain.gain.linearRampToValueAtTime(0.01, t + dur);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
      noise.start(t); noise.stop(t + dur);

      const sub = this.ctx.createOscillator(); const subG = this.ctx.createGain();
      sub.type = 'triangle'; sub.frequency.setValueAtTime(150, t); sub.frequency.exponentialRampToValueAtTime(30, t + 0.28);
      subG.gain.setValueAtTime(this.sfxVolume * 0.45, t); subG.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      sub.connect(subG); subG.connect(this.ctx.destination); sub.start(t); sub.stop(t + 0.28);
    } else if (type === 'powerup') {
      const notes = [330, 392, 493.88, 587.33, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const stepT = t + idx * 0.035;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(freq, stepT);
        g.gain.setValueAtTime(this.sfxVolume * 0.22, stepT); g.gain.exponentialRampToValueAtTime(0.001, stepT + 0.05);
        o.connect(g); g.connect(this.ctx.destination); o.start(stepT); o.stop(stepT + 0.05);
      });
    } else if (type === 'kick') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(190, t); osc.frequency.exponentialRampToValueAtTime(480, t + 0.1);
      gain.gain.setValueAtTime(this.sfxVolume * 0.35, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.12);
    } else if (type === 'detonate') {
      const o1 = this.ctx.createOscillator(); const g1 = this.ctx.createGain();
      o1.type = 'sine'; o1.frequency.setValueAtTime(880, t); o1.frequency.exponentialRampToValueAtTime(1760, t + 0.1);
      g1.gain.setValueAtTime(this.sfxVolume * 0.4, t); g1.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      o1.connect(g1); g1.connect(this.ctx.destination); o1.start(t); o1.stop(t + 0.1);
    } else if (type === 'combo') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const st = t + i * 0.04;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(f, st);
        g.gain.setValueAtTime(this.sfxVolume * 0.3, st); g.gain.exponentialRampToValueAtTime(0.01, st + 0.08);
        o.connect(g); g.connect(this.ctx.destination); o.start(st); o.stop(st + 0.08);
      });
    } else if (type === 'curse') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, t); osc.frequency.linearRampToValueAtTime(110, t + 0.35);
      gain.gain.setValueAtTime(this.sfxVolume * 0.4, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.35);
    } else if (type === 'shield_break') {
      const o2 = this.ctx.createOscillator(); const g2 = this.ctx.createGain();
      o2.type = 'square'; o2.frequency.setValueAtTime(900, t); o2.frequency.exponentialRampToValueAtTime(200, t + 0.25);
      g2.gain.setValueAtTime(this.sfxVolume * 0.4, t); g2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      o2.connect(g2); g2.connect(this.ctx.destination); o2.start(t); o2.stop(t + 0.25);
    } else if (type === 'enemy_death') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(420, t); osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);
      gain.gain.setValueAtTime(this.sfxVolume * 0.35, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.2);
    } else if (type === 'hurt') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(650, t); osc.frequency.linearRampToValueAtTime(110, t + 0.35);
      gain.gain.setValueAtTime(this.sfxVolume * 0.45, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.35);
    } else if (type === 'victory') {
      const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const stepT = t + idx * 0.08;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(freq, stepT);
        g.gain.setValueAtTime(this.sfxVolume * 0.3, stepT); g.gain.exponentialRampToValueAtTime(0.001, stepT + 0.09);
        o.connect(g); g.connect(this.ctx.destination); o.start(stepT); o.stop(stepT + 0.09);
      });
    }
  },

  playBGM(theme) {
    this.currentTheme = theme || 'solar';
    if (this.isMuted || !this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.loopBGM();
  },

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimeout) { clearTimeout(this.bgmTimeout); this.bgmTimeout = null; }
  },

  loopBGM() {
    if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
    const stepDur = 0.125;
    const now = this.ctx.currentTime + 0.05;
    const scale = this.currentTheme === 'magma' || this.currentTheme === 'fortress' || this.currentTheme === 'battle'
      ? [220, 261.63, 293.66, 311.13, 329.63, 392]
      : [261.63, 293.66, 329.63, 349.23, 392, 440, 523.25];
    const bass = [0, 0, 4, 0, 2, 2, 4, 3, 0, 0, 4, 0, 5, 4, 2, 1];
    const lead = [4, -1, 4, 5, 4, -1, 2, -1, 0, 2, 4, -1, 3, 2, 1, 0];

    for (let s = 0; s < 16; s++) {
      const st = now + s * stepDur;
      const bOsc = this.ctx.createOscillator(); const bG = this.ctx.createGain();
      bOsc.type = 'triangle'; bOsc.frequency.setValueAtTime(scale[bass[s] % scale.length] * 0.5, st);
      bG.gain.setValueAtTime(this.bgmVolume * 0.2, st); bG.gain.exponentialRampToValueAtTime(0.001, st + stepDur * 0.85);
      bOsc.connect(bG); bG.connect(this.ctx.destination); bOsc.start(st); bOsc.stop(st + stepDur);

      if (lead[s] >= 0) {
        const lOsc = this.ctx.createOscillator(); const lG = this.ctx.createGain();
        lOsc.type = 'square'; lOsc.frequency.setValueAtTime(scale[lead[s] % scale.length] * 2, st);
        lG.gain.setValueAtTime(this.bgmVolume * 0.1, st); lG.gain.exponentialRampToValueAtTime(0.001, st + stepDur * 0.75);
        lOsc.connect(lG); lG.connect(this.ctx.destination); lOsc.start(st); lOsc.stop(st + stepDur);
      }
    }

    this.bgmTimeout = setTimeout(() => { if (this.bgmPlaying) this.loopBGM(); }, 16 * stepDur * 1000 - 40);
  }
};

// --- 3. STORAGE MANAGER (LocalStorage) ---
const Storage = {
  SCORES_KEY: 'super_bomberman_scores_v3',
  getScores() {
    try {
      const raw = localStorage.getItem(this.SCORES_KEY);
      return raw ? JSON.parse(raw) : [
        { name: 'BOM', score: 15400, stage: 5, date: '1995-04-28' },
        { name: 'ACE', score: 11800, stage: 4, date: '1995-05-12' },
        { name: 'MAX', score: 8200, stage: 3, date: '1995-06-01' }
      ];
    } catch { return []; }
  },
  saveScore(name, score, stage) {
    const list = this.getScores();
    list.push({ name: name.toUpperCase(), score, stage, date: new Date().toISOString().split('T')[0] });
    list.sort((a, b) => b.score - a.score);
    try { localStorage.setItem(this.SCORES_KEY, JSON.stringify(list.slice(0, 10))); } catch(e) {}
  }
};

// --- 4. GAME CONSTANTS & CONFIGURATION ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 40;
const GRID_COLS = 15;
const GRID_ROWS = 11;
const PLAYFIELD_OFFSET_X = Math.floor((CANVAS_WIDTH - GRID_COLS * TILE_SIZE) / 2); // 100px
const PLAYFIELD_OFFSET_Y = 110;

const STAGES_CONFIG = [
  { num: 1, name: 'SOLAR PLANET', theme: 'solar', softBlockDensity: 0.60, enemies: [{ type: 'ballom', count: 3 }, { type: 'onil', count: 2 }], hasBoss: false },
  { num: 2, name: 'CYBER FACTORY', theme: 'cyber', softBlockDensity: 0.65, enemies: [{ type: 'ballom', count: 2 }, { type: 'onil', count: 3 }, { type: 'minvo', count: 2 }], hasBoss: false },
  { num: 3, name: 'MAGMA CORE', theme: 'magma', softBlockDensity: 0.68, enemies: [{ type: 'onil', count: 3 }, { type: 'minvo', count: 4 }], hasBoss: false },
  { num: 4, name: 'STAR FORTRESS', theme: 'fortress', softBlockDensity: 0.55, enemies: [{ type: 'minvo', count: 2 }, { type: 'magnet_boss', count: 1 }], hasBoss: true },
  { num: 5, name: 'BATTLE ARENA (1v1)', theme: 'battle', softBlockDensity: 0.58, enemies: [{ type: 'kurobom', count: 1 }], hasBoss: true }
];

// --- 5. GAME ENGINE ---
class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.stageIdx = 0;
    this.score = 0;
    this.timeLeft = 180;
    this.isGameOver = false;
    this.isStageClear = false;
    this.isVictory = false;
    this.mapGrid = [];
    this.bombs = [];
    this.explosions = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.enemies = [];
    this.exitDoor = null;
    this.screenShake = 0;
    this.comboCounter = 0;
    this.comboTimer = 0;

    this.player = {
      x: PLAYFIELD_OFFSET_X + 1.5 * TILE_SIZE,
      y: PLAYFIELD_OFFSET_Y + 1.5 * TILE_SIZE,
      direction: 'down',
      frame: 0,
      isMoving: false,
      lives: 3,
      maxBombs: 1,
      activeBombs: 0,
      firePower: 2,
      speed: 160,
      hasKick: false,
      hasShield: false,
      hasRemote: false,
      hasFullFire: false,
      isCursed: false,
      curseType: null,
      curseTimer: 0,
      isInvulnerable: false,
      invulnerableTimer: 0,
      isDead: false,
      deathAnimTimer: 0
    };
  }

  initStage(stageIdx, customConfig = {}) {
    this.stageIdx = stageIdx;
    this.level = STAGES_CONFIG[stageIdx] || STAGES_CONFIG[0];
    this.timeLeft = 180;
    this.isGameOver = false;
    this.isStageClear = false;
    this.isVictory = false;
    this.bombs = [];
    this.explosions = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.enemies = [];
    this.screenShake = 0;
    this.comboCounter = 0;

    if (customConfig.lives !== undefined) this.player.lives = customConfig.lives;
    if (customConfig.maxBombs !== undefined) this.player.maxBombs = customConfig.maxBombs;
    if (customConfig.firePower !== undefined) this.player.firePower = customConfig.firePower;
    if (customConfig.moveSpeed !== undefined) this.player.speed = customConfig.moveSpeed;

    this.player.x = PLAYFIELD_OFFSET_X + 1.5 * TILE_SIZE;
    this.player.y = PLAYFIELD_OFFSET_Y + 1.5 * TILE_SIZE;
    this.player.activeBombs = 0;
    this.player.isDead = false;
    this.player.deathAnimTimer = 0;
    this.player.isInvulnerable = true;
    this.player.invulnerableTimer = 2.0;
    this.player.isCursed = false;

    this.generateMap();
    this.spawnEnemies(customConfig.bossHp);

    AudioFX.playBGM(this.level.theme);
  }

  generateMap() {
    this.mapGrid = [];
    const softBlocks = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.mapGrid[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        if (r === 0 || r === GRID_ROWS - 1 || c === 0 || c === GRID_COLS - 1) {
          this.mapGrid[r][c] = 1;
        } else if (r % 2 === 0 && c % 2 === 0) {
          this.mapGrid[r][c] = 1;
        } else if ((c <= 2 && r <= 2) || (c >= GRID_COLS - 3 && r >= GRID_ROWS - 3)) {
          this.mapGrid[r][c] = 0;
        } else {
          if (Math.random() < this.level.softBlockDensity) {
            this.mapGrid[r][c] = 2;
            softBlocks.push({ c, r });
          } else {
            this.mapGrid[r][c] = 0;
          }
        }
      }
    }
    if (softBlocks.length > 0) {
      const chosen = softBlocks[Math.floor(Math.random() * softBlocks.length)];
      this.exitDoor = { gridC: chosen.c, gridR: chosen.r, isOpen: false };
    } else {
      this.exitDoor = { gridC: GRID_COLS - 2, gridR: GRID_ROWS - 2, isOpen: false };
    }
  }

  spawnEnemies(bossHpOverride) {
    this.enemies = [];
    const valid = [];
    for (let r = 1; r < GRID_ROWS - 1; r++) {
      for (let c = 1; c < GRID_COLS - 1; c++) {
        if (this.mapGrid[r][c] === 0 && (c > 3 || r > 3)) valid.push({ c, r });
      }
    }
    valid.sort(() => Math.random() - 0.5);

    let idx = 0;
    this.level.enemies.forEach(eType => {
      for (let i = 0; i < eType.count; i++) {
        let cell = valid[idx % valid.length] || { c: GRID_COLS - 2, r: GRID_ROWS - 2 };
        if (eType.type === 'magnet_boss' || eType.type === 'kurobom') {
          cell = { c: GRID_COLS - 2, r: GRID_ROWS - 2 };
        }
        idx++;
        this.enemies.push(this.createEnemy(eType.type, cell.c, cell.r, bossHpOverride));
      }
    });
  }

  createEnemy(type, c, r, bossHpOverride) {
    const x = PLAYFIELD_OFFSET_X + c * TILE_SIZE + TILE_SIZE / 2;
    const y = PLAYFIELD_OFFSET_Y + r * TILE_SIZE + TILE_SIZE / 2;
    let speed = 70, hp = 1, score = 200;
    if (type === 'ballom') { speed = 65; score = 200; }
    else if (type === 'onil') { speed = 85; score = 300; }
    else if (type === 'minvo') { speed = 110; score = 400; }
    else if (type === 'magnet_boss') { speed = 75; hp = bossHpOverride || 12; score = 3000; }
    else if (type === 'kurobom') { speed = 135; hp = bossHpOverride || 4; score = 4000; }

    return {
      id: Math.random().toString(), type, x, y, vx: 0, vy: speed,
      direction: 'down', speed, hp, maxHp: hp, isHit: false, hitTimer: 0,
      isDying: false, deathTimer: 0, scoreValue: score, nextDecision: 0, attackTimer: 0,
      bombCooldown: 2.0, activeBombs: 0, maxBombs: 2, firePower: 3, frame: 0
    };
  }

  addFloatingText(text, x, y, color = '#facc15') {
    this.floatingTexts.push({ text, x, y, color, timer: 0, maxTimer: 0.85 });
  }

  update(dt, input) {
    if (this.isGameOver || this.isStageClear || this.isVictory) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.killPlayer();
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 2.8);
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCounter = 0;
    }

    // Curse timer
    const p = this.player;
    if (p.isCursed) {
      p.curseTimer -= dt;
      if (p.curseTimer <= 0) {
        p.isCursed = false;
        p.curseType = null;
        this.addFloatingText('KUTUKAN BERAKHIR!', p.x, p.y - 20, '#10b981');
      }
    }

    this.updatePlayer(dt, input);
    this.updateBombs(dt);
    this.updateExplosions(dt);
    this.updateEnemies(dt);
    this.updatePowerups(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
    this.checkObjectives();
  }

  updatePlayer(dt, input) {
    const p = this.player;
    if (p.isDead) {
      p.deathAnimTimer += dt;
      if (p.deathAnimTimer >= 1.2) {
        if (p.lives > 0) {
          p.x = PLAYFIELD_OFFSET_X + 1.5 * TILE_SIZE;
          p.y = PLAYFIELD_OFFSET_Y + 1.5 * TILE_SIZE;
          p.isDead = false;
          p.deathAnimTimer = 0;
          p.isInvulnerable = true;
          p.invulnerableTimer = 2.5;
        } else {
          this.isGameOver = true;
          AudioFX.play('hurt');
        }
      }
      return;
    }

    if (p.isInvulnerable) {
      p.invulnerableTimer -= dt;
      if (p.invulnerableTimer <= 0) p.isInvulnerable = false;
    }

    let dx = 0, dy = 0;
    let inLeft = input.left, inRight = input.right, inUp = input.up, inDown = input.down;

    // Handle reverse curse
    if (p.isCursed && p.curseType === 'reverse') {
      [inLeft, inRight] = [inRight, inLeft];
      [inUp, inDown] = [inDown, inUp];
    }

    if (inLeft) { dx -= 1; p.direction = 'left'; }
    else if (inRight) { dx += 1; p.direction = 'right'; }
    else if (inUp) { dy -= 1; p.direction = 'up'; }
    else if (inDown) { dy += 1; p.direction = 'down'; }

    p.isMoving = dx !== 0 || dy !== 0;
    if (p.isMoving) p.frame += dt * 8;

    let effSpeed = p.speed;
    if (p.isCursed) {
      if (p.curseType === 'slow') effSpeed *= 0.55;
      else if (p.curseType === 'turbo') effSpeed *= 1.45;
    }

    const moveStep = effSpeed * dt;
    if (dx !== 0) this.movePlayerAxis(dx * moveStep, 0);
    if (dy !== 0) this.movePlayerAxis(0, dy * moveStep);

    // Auto-bomb curse (dysentery)
    if (p.isCursed && p.curseType === 'dysentery' && Math.random() < 0.04) {
      this.placeBomb();
    }

    if (input.bomb) this.placeBomb();

    // Remote detonator trigger
    if (p.hasRemote && input.detonate && this.bombs.length > 0) {
      this.detonateAllBombs();
    }
  }

  detonateAllBombs() {
    AudioFX.play('detonate');
    const toBlow = [...this.bombs];
    toBlow.forEach(b => this.explodeBomb(b));
    this.addFloatingText('DETONASI!', this.player.x, this.player.y - 22, '#38bdf8');
  }

  movePlayerAxis(dx, dy) {
    const p = this.player;
    const radius = 11;
    const targetX = p.x + dx;
    const targetY = p.y + dy;

    if (!this.checkPlayerCollision(targetX, targetY, radius)) {
      p.x = targetX;
      p.y = targetY;
    } else {
      if (dx !== 0 && dy === 0) {
        const gridY = Math.floor((p.y - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
        const tileCenterY = PLAYFIELD_OFFSET_Y + gridY * TILE_SIZE + TILE_SIZE / 2;
        const offset = p.y - tileCenterY;
        if (Math.abs(offset) < 14) {
          const nudge = offset > 0 ? 1 : -1;
          if (!this.checkPlayerCollision(p.x, p.y + nudge * 2, radius)) p.y += nudge * 2;
        }
      } else if (dy !== 0 && dx === 0) {
        const gridX = Math.floor((p.x - PLAYFIELD_OFFSET_X) / TILE_SIZE);
        const tileCenterX = PLAYFIELD_OFFSET_X + gridX * TILE_SIZE + TILE_SIZE / 2;
        const offset = p.x - tileCenterX;
        if (Math.abs(offset) < 14) {
          const nudge = offset > 0 ? 1 : -1;
          if (!this.checkPlayerCollision(p.x + nudge * 2, p.y, radius)) p.x += nudge * 2;
        }
      }
    }
  }

  checkPlayerCollision(x, y, radius) {
    const corners = [
      { x: x - radius, y: y - radius },
      { x: x + radius, y: y - radius },
      { x: x - radius, y: y + radius },
      { x: x + radius, y: y + radius },
    ];
    for (const pt of corners) {
      const c = Math.floor((pt.x - PLAYFIELD_OFFSET_X) / TILE_SIZE);
      const r = Math.floor((pt.y - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
      if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return true;
      if (this.mapGrid[r][c] === 1 || this.mapGrid[r][c] === 2) return true;
    }

    const p = this.player;
    const bombRadius = 14;
    const combinedRadius = radius + bombRadius;

    for (const bomb of this.bombs) {
      if (bomb.isGhost) continue;

      const currentDist = Math.hypot(p.x - bomb.x, p.y - bomb.y);
      const newDist = Math.hypot(x - bomb.x, y - bomb.y);

      if (newDist < combinedRadius) {
        if (currentDist < combinedRadius && newDist > currentDist) continue;

        if (this.player.hasKick && !bomb.isMoving) {
          this.kickBomb(bomb, this.player.direction);
        }
        return true;
      }
    }

    return false;
  }

  placeBomb(customX, customY, customRange, owner = 'player') {
    const p = this.player;
    const targetX = customX !== undefined ? customX : p.x;
    const targetY = customY !== undefined ? customY : p.y;
    const range = customRange !== undefined ? customRange : p.firePower;

    if (owner === 'player' && (p.isDead || p.activeBombs >= p.maxBombs)) return;

    const c = Math.floor((targetX - PLAYFIELD_OFFSET_X) / TILE_SIZE);
    const r = Math.floor((targetY - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
    if (c < 1 || c >= GRID_COLS - 1 || r < 1 || r >= GRID_ROWS - 1) return;
    if (this.mapGrid[r][c] !== 0) return;

    const bombX = PLAYFIELD_OFFSET_X + c * TILE_SIZE + TILE_SIZE / 2;
    const bombY = PLAYFIELD_OFFSET_Y + r * TILE_SIZE + TILE_SIZE / 2;

    this.bombs.push({
      id: Math.random().toString(), gridC: c, gridR: r, x: bombX, y: bombY,
      range: range, fuse: 2.4, maxFuse: 2.4, isGhost: true, isMoving: false, owner
    });
    this.mapGrid[r][c] = 3;
    if (owner === 'player') p.activeBombs++;
    AudioFX.play('drop');
  }

  kickBomb(bomb, dir) {
    bomb.isMoving = true;
    bomb.moveDir = dir;
    bomb.isGhost = false;
    AudioFX.play('kick');
  }

  updateBombs(dt) {
    const p = this.player;
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      if (b.isGhost) {
        const dist = Math.hypot(p.x - b.x, p.y - b.y);
        if (dist >= 28) b.isGhost = false;
      }

      if (b.isMoving && b.moveDir) {
        const speed = 230 * dt;
        let nx = b.x, ny = b.y;
        if (b.moveDir === 'left') nx -= speed;
        else if (b.moveDir === 'right') nx += speed;
        else if (b.moveDir === 'up') ny -= speed;
        else if (b.moveDir === 'down') ny += speed;

        const nc = Math.floor((nx - PLAYFIELD_OFFSET_X) / TILE_SIZE);
        const nr = Math.floor((ny - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
        if (nc < 1 || nc >= GRID_COLS - 1 || nr < 1 || nr >= GRID_ROWS - 1 || (this.mapGrid[nr][nc] !== 0 && (nc !== b.gridC || nr !== b.gridR))) {
          b.isMoving = false;
          b.x = PLAYFIELD_OFFSET_X + b.gridC * TILE_SIZE + TILE_SIZE / 2;
          b.y = PLAYFIELD_OFFSET_Y + b.gridR * TILE_SIZE + TILE_SIZE / 2;
        } else {
          if (nc !== b.gridC || nr !== b.gridR) {
            this.mapGrid[b.gridR][b.gridC] = 0;
            b.gridC = nc; b.gridR = nr;
            this.mapGrid[nr][nc] = 3;
          }
          b.x = nx; b.y = ny;
        }
      }

      b.fuse -= dt;
      if (b.fuse <= 0) this.explodeBomb(b);
    }
  }

  explodeBomb(bomb) {
    const idx = this.bombs.indexOf(bomb);
    if (idx === -1) return;
    this.bombs.splice(idx, 1);
    this.mapGrid[bomb.gridR][bomb.gridC] = 0;
    if (bomb.owner === 'player') {
      this.player.activeBombs = Math.max(0, this.player.activeBombs - 1);
    }

    AudioFX.play('explode');
    this.screenShake = Math.min(1.0, this.screenShake + 0.45);
    this.addExplosionCell(bomb.gridC, bomb.gridR);

    // Sparks & smoke at epicenter
    for (let s = 0; s < 8; s++) {
      this.particles.push({
        x: bomb.x, y: bomb.y,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
        life: 0.35, maxLife: 0.35
      });
    }

    const dirs = [[0,-1], [0,1], [-1,0], [1,0]];
    dirs.forEach(d => {
      for (let i = 1; i <= bomb.range; i++) {
        const nc = bomb.gridC + d[0] * i;
        const nr = bomb.gridR + d[1] * i;
        if (nc < 0 || nc >= GRID_COLS || nr < 0 || nr >= GRID_ROWS) break;
        const tile = this.mapGrid[nr][nc];
        if (tile === 1) break;
        if (tile === 2) {
          this.destroySoftBlock(nc, nr);
          this.addExplosionCell(nc, nr);
          break;
        }
        if (tile === 3) {
          const chained = this.bombs.find(b => b.gridC === nc && b.gridR === nr);
          if (chained) this.explodeBomb(chained);
          break;
        }
        this.addExplosionCell(nc, nr);
      }
    });
    this.checkExplosionHits();
  }

  addExplosionCell(c, r) {
    this.explosions.push({ gridC: c, gridR: r, timer: 0, maxTimer: 0.38 });
  }

  destroySoftBlock(c, r) {
    this.mapGrid[r][c] = 0;
    this.score += 50;

    // Flying brick debris
    const bx = PLAYFIELD_OFFSET_X + c * TILE_SIZE + TILE_SIZE / 2;
    const by = PLAYFIELD_OFFSET_Y + r * TILE_SIZE + TILE_SIZE / 2;
    for (let p = 0; p < 6; p++) {
      this.particles.push({
        x: bx, y: by,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150 - 30,
        size: 3 + Math.random() * 4,
        color: '#b45309',
        life: 0.42, maxLife: 0.42
      });
    }

    if (Math.random() < 0.42) {
      const types = ['bomb_up', 'fire_up', 'speed_up', 'kick', 'shield', 'remote', 'full_fire', 'heart', 'curse'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      this.powerups.push({ gridC: c, gridR: r, type: chosen });
    }
  }

  updateExplosions(dt) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.timer += dt;
      if (exp.timer >= exp.maxTimer) this.explosions.splice(i, 1);
    }
    this.checkExplosionHits();
  }

  checkExplosionHits() {
    const p = this.player;
    this.explosions.forEach(exp => {
      const ex = PLAYFIELD_OFFSET_X + exp.gridC * TILE_SIZE + TILE_SIZE / 2;
      const ey = PLAYFIELD_OFFSET_Y + exp.gridR * TILE_SIZE + TILE_SIZE / 2;
      if (!p.isDead && !p.isInvulnerable && Math.hypot(p.x - ex, p.y - ey) < 22) {
        this.killPlayer();
      }
      this.enemies.forEach(e => {
        if (!e.isDying && !e.isHit && Math.hypot(e.x - ex, e.y - ey) < 24) {
          this.hitEnemy(e);
        }
      });
    });
  }

  updateEnemies(dt) {
    const p = this.player;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.isDying) {
        e.deathTimer += dt;
        if (e.deathTimer >= 0.3) this.enemies.splice(i, 1);
        continue;
      }
      if (e.isHit) {
        e.hitTimer -= dt;
        if (e.hitTimer <= 0) e.isHit = false;
      }

      e.frame = (e.frame || 0) + dt * 6;
      e.nextDecision -= dt;
      if (e.nextDecision <= 0) {
        e.nextDecision = e.type === 'kurobom' ? 0.35 : 0.5;
        const c = Math.floor((e.x - PLAYFIELD_OFFSET_X) / TILE_SIZE);
        const r = Math.floor((e.y - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
        const candidates = [
          { vx: 0, vy: -e.speed, dir: 'up', nc: c, nr: r - 1 },
          { vx: 0, vy: e.speed, dir: 'down', nc: c, nr: r + 1 },
          { vx: -e.speed, vy: 0, dir: 'left', nc: c - 1, nr: r },
          { vx: e.speed, vy: 0, dir: 'right', nc: c + 1, nr: r }
        ].filter(cand => cand.nc >= 0 && cand.nc < GRID_COLS && cand.nr >= 0 && cand.nr < GRID_ROWS && this.mapGrid[cand.nr][cand.nc] === 0);

        if (candidates.length > 0) {
          // Kurobom AI targeting
          if (e.type === 'kurobom') {
            const dangerBombs = this.bombs.filter(b => Math.hypot(e.x - b.x, e.y - b.y) < 70);
            if (dangerBombs.length > 0) {
              // Run away from closest bomb
              candidates.sort((a, b) => {
                const distA = Math.hypot(PLAYFIELD_OFFSET_X + a.nc * TILE_SIZE - dangerBombs[0].x, PLAYFIELD_OFFSET_Y + a.nr * TILE_SIZE - dangerBombs[0].y);
                const distB = Math.hypot(PLAYFIELD_OFFSET_X + b.nc * TILE_SIZE - dangerBombs[0].x, PLAYFIELD_OFFSET_Y + b.nr * TILE_SIZE - dangerBombs[0].y);
                return distB - distA;
              });
            } else if (Math.random() < 0.6) {
              // Walk towards player
              candidates.sort((a, b) => {
                const distA = Math.hypot(PLAYFIELD_OFFSET_X + a.nc * TILE_SIZE - p.x, PLAYFIELD_OFFSET_Y + a.nr * TILE_SIZE - p.y);
                const distB = Math.hypot(PLAYFIELD_OFFSET_X + b.nc * TILE_SIZE - p.x, PLAYFIELD_OFFSET_Y + b.nr * TILE_SIZE - p.y);
                return distA - distB;
              });
            }
          }
          const chosen = candidates[0];
          e.vx = chosen.vx; e.vy = chosen.vy; e.direction = chosen.dir;
        }
      }

      // Kurobom AI bomb placing
      if (e.type === 'kurobom') {
        e.bombCooldown -= dt;
        const distToPlayer = Math.hypot(e.x - p.x, e.y - p.y);
        if (e.bombCooldown <= 0 && distToPlayer < 120 && Math.random() < 0.3) {
          e.bombCooldown = 2.2;
          this.placeBomb(e.x, e.y, e.firePower, 'kurobom');
        }
      }

      const nx = e.x + e.vx * dt;
      const ny = e.y + e.vy * dt;
      const nc = Math.floor((nx - PLAYFIELD_OFFSET_X) / TILE_SIZE);
      const nr = Math.floor((ny - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
      if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS && this.mapGrid[nr][nc] === 0) {
        e.x = nx; e.y = ny;
      } else {
        e.nextDecision = 0;
      }

      if (e.type === 'magnet_boss') {
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (dist < 180 && !p.isDead) {
          const ang = Math.atan2(e.y - p.y, e.x - p.x);
          this.movePlayerAxis(Math.cos(ang) * 26 * dt, Math.sin(ang) * 26 * dt);
        }
      }

      if (!p.isDead && !p.isInvulnerable && Math.hypot(p.x - e.x, p.y - e.y) < 22) {
        this.killPlayer();
      }
    }
  }

  hitEnemy(e) {
    e.hp--;
    e.isHit = true;
    e.hitTimer = 0.25;

    // Combo multiplier
    this.comboCounter++;
    this.comboTimer = 2.0;
    const comboBonus = this.comboCounter > 1 ? this.comboCounter * 100 : 0;
    const totalGained = e.scoreValue + comboBonus;
    this.score += totalGained;

    if (this.comboCounter > 1) {
      AudioFX.play('combo');
      this.addFloatingText(`${this.comboCounter}x COMBO! +${totalGained}`, e.x, e.y - 15, '#f59e0b');
    } else {
      this.addFloatingText(`+${e.scoreValue}`, e.x, e.y - 10, '#facc15');
    }

    if (e.hp <= 0) {
      e.isDying = true;
      AudioFX.play('enemy_death');
      if (e.type === 'magnet_boss' || e.type === 'kurobom') {
        this.isVictory = true;
        this.score += 5000;
        this.addFloatingText('VICTORY!', e.x, e.y - 25, '#38bdf8');
        AudioFX.play('victory');
      }
    } else {
      AudioFX.play('enemy_death');
    }
  }

  updatePowerups(dt) {
    const p = this.player;
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      const px = PLAYFIELD_OFFSET_X + pu.gridC * TILE_SIZE + TILE_SIZE / 2;
      const py = PLAYFIELD_OFFSET_Y + pu.gridR * TILE_SIZE + TILE_SIZE / 2;
      if (Math.hypot(p.x - px, p.y - py) < 22 && !p.isDead) {
        if (pu.type === 'bomb_up') {
          p.maxBombs = Math.min(8, p.maxBombs + 1);
          this.addFloatingText('BOMB UP! (+1)', p.x, p.y - 18, '#38bdf8');
          AudioFX.play('powerup');
        } else if (pu.type === 'fire_up') {
          p.firePower = Math.min(8, p.firePower + 1);
          this.addFloatingText('FIRE UP! (+1)', p.x, p.y - 18, '#ef4444');
          AudioFX.play('powerup');
        } else if (pu.type === 'speed_up') {
          p.speed = Math.min(250, p.speed + 20);
          this.addFloatingText('SPEED UP!', p.x, p.y - 18, '#10b981');
          AudioFX.play('powerup');
        } else if (pu.type === 'kick') {
          p.hasKick = true;
          this.addFloatingText('KICK BOOTS!', p.x, p.y - 18, '#f59e0b');
          AudioFX.play('powerup');
        } else if (pu.type === 'shield') {
          p.hasShield = true;
          this.addFloatingText('SHIELD BARRIER!', p.x, p.y - 18, '#06b6d4');
          AudioFX.play('powerup');
        } else if (pu.type === 'remote') {
          p.hasRemote = true;
          this.addFloatingText('REMOTE DETONATOR [X]!', p.x, p.y - 18, '#60a5fa');
          AudioFX.play('powerup');
        } else if (pu.type === 'full_fire') {
          p.hasFullFire = true;
          p.firePower = 8;
          this.addFloatingText('MAX FIRE 8-GRID BLAST!', p.x, p.y - 18, '#f97316');
          AudioFX.play('powerup');
        } else if (pu.type === 'heart') {
          p.lives++;
          this.addFloatingText('+1 EXTRA LIFE!', p.x, p.y - 18, '#f43f5e');
          AudioFX.play('powerup');
        } else if (pu.type === 'curse') {
          const curses = ['reverse', 'slow', 'turbo', 'dysentery'];
          p.isCursed = true;
          p.curseType = curses[Math.floor(Math.random() * curses.length)];
          p.curseTimer = 7.0;
          this.addFloatingText(`KUTUKAN: ${p.curseType.toUpperCase()}!`, p.x, p.y - 18, '#a855f7');
          AudioFX.play('curse');
        }

        this.score += 100;
        this.powerups.splice(i, 1);
      }
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
  }

  updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * dt;
      ft.timer += dt;
      if (ft.timer >= ft.maxTimer) this.floatingTexts.splice(i, 1);
    }
  }

  killPlayer() {
    const p = this.player;
    if (p.hasShield) {
      p.hasShield = false;
      p.isInvulnerable = true;
      p.invulnerableTimer = 2.0;
      this.addFloatingText('SHIELD PECAH!', p.x, p.y - 20, '#06b6d4');
      AudioFX.play('shield_break');
      return;
    }
    p.lives--;
    p.isDead = true;
    p.deathAnimTimer = 0;
    AudioFX.play('hurt');
  }

  checkObjectives() {
    if (this.isStageClear || this.isGameOver || this.isVictory) return;
    const active = this.enemies.filter(e => !e.isDying);
    if (active.length === 0) {
      if (this.exitDoor && !this.exitDoor.isOpen) {
        this.exitDoor.isOpen = true;
        this.addFloatingText('PORTAL TERBUKA!', CANVAS_WIDTH / 2, PLAYFIELD_OFFSET_Y - 20, '#38bdf8');
      }
      if (this.exitDoor && this.exitDoor.isOpen) {
        const dx = PLAYFIELD_OFFSET_X + this.exitDoor.gridC * TILE_SIZE + TILE_SIZE / 2;
        const dy = PLAYFIELD_OFFSET_Y + this.exitDoor.gridR * TILE_SIZE + TILE_SIZE / 2;
        if (Math.hypot(this.player.x - dx, this.player.y - dy) < 18) {
          this.isStageClear = true;
          this.score += 1000 + Math.floor(this.timeLeft) * 10;
          AudioFX.play('victory');
        }
      }
    }
  }
}

// --- 6. HIGH PERFORMANCE PIXEL ART RENDERER ---
function renderGame(ctx, engine, time) {
  // Screen Shake Translation
  ctx.save();
  if (engine.screenShake > 0) {
    const mag = engine.screenShake * 7;
    const sx = (Math.random() - 0.5) * mag;
    const sy = (Math.random() - 0.5) * mag;
    ctx.translate(sx, sy);
  }

  // Dark retro background
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Outer Playfield Arcade Border
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.strokeRect(PLAYFIELD_OFFSET_X - 4, PLAYFIELD_OFFSET_Y - 4, GRID_COLS * TILE_SIZE + 8, GRID_ROWS * TILE_SIZE + 8);

  const theme = engine.level.theme;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const x = PLAYFIELD_OFFSET_X + c * TILE_SIZE;
      const y = PLAYFIELD_OFFSET_Y + r * TILE_SIZE;
      const alt = (r + c) % 2 === 1;

      // Authentic Themed Floors
      if (theme === 'solar') {
        ctx.fillStyle = alt ? '#15803d' : '#166534';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Grass tufts
        if ((r * 3 + c * 7) % 5 === 0) {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 10, y + 12, 3, 4);
          ctx.fillRect(x + 24, y + 26, 3, 3);
        }
      } else if (theme === 'cyber') {
        ctx.fillStyle = alt ? '#0f172a' : '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Circuit traces
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      } else if (theme === 'magma') {
        ctx.fillStyle = alt ? '#1c1917' : '#292524';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        if ((r + c) % 4 === 0) {
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(x + 8, y + 8, 4, 4);
        }
      } else {
        // Fortress & Battle
        ctx.fillStyle = alt ? '#18181b' : '#27272a';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      }
    }
  }

  // Exit Portal
  if (engine.exitDoor && engine.mapGrid[engine.exitDoor.gridR]?.[engine.exitDoor.gridC] === 0) {
    const x = PLAYFIELD_OFFSET_X + engine.exitDoor.gridC * TILE_SIZE;
    const y = PLAYFIELD_OFFSET_Y + engine.exitDoor.gridR * TILE_SIZE;
    if (engine.exitDoor.isOpen) {
      // Swirling portal
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(x + 20, y + 20, 16 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x + 20, y + 20, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 18, y + 18, 4, 4);
    } else {
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 6, y + 6, 28, 28);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 18, y + 18, 4, 4);
    }
  }

  // Power-up Items
  engine.powerups.forEach(pu => {
    const x = PLAYFIELD_OFFSET_X + pu.gridC * TILE_SIZE + 4;
    const y = PLAYFIELD_OFFSET_Y + pu.gridR * TILE_SIZE + 4 + Math.sin(time * 5.5) * 3;

    // Item pedestal card
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, 32, 32);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 32, 32);

    // Pixel icons
    if (pu.type === 'bomb_up') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(x + 16, y + 17, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 14, y + 12, 4, 10); ctx.fillRect(x + 11, y + 15, 10, 4);
    } else if (pu.type === 'fire_up') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(x + 16, y + 18, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(x + 16, y + 18, 5, 0, Math.PI * 2); ctx.fill();
    } else if (pu.type === 'speed_up') {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 8, y + 14, 16, 7);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(x + 11, y + 23, 4, 0, Math.PI * 2); ctx.arc(x + 21, y + 23, 4, 0, Math.PI * 2); ctx.fill();
    } else if (pu.type === 'kick') {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x + 9, y + 10, 9, 14); ctx.fillRect(x + 14, y + 18, 10, 6);
    } else if (pu.type === 'shield') {
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath(); ctx.arc(x + 16, y + 16, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#67e8f9'; ctx.fillRect(x + 14, y + 14, 4, 4);
    } else if (pu.type === 'remote') {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + 10, y + 13, 12, 14);
      ctx.fillStyle = '#f43f5e'; ctx.fillRect(x + 14, y + 16, 4, 4);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(x + 12, y + 8, 2, 5);
    } else if (pu.type === 'full_fire') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(x + 16, y + 16, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px monospace'; ctx.fillText('MAX', x + 5, y + 20);
    } else if (pu.type === 'heart') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.arc(x + 12, y + 14, 5, 0, Math.PI * 2); ctx.arc(x + 20, y + 14, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 7, y + 16); ctx.lineTo(x + 16, y + 25); ctx.lineTo(x + 25, y + 16); ctx.fill();
    } else {
      // Curse skull
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(x + 9, y + 10, 14, 12);
      ctx.fillStyle = '#000000'; ctx.fillRect(x + 12, y + 13, 2, 3); ctx.fillRect(x + 18, y + 13, 2, 3);
    }
  });

  // Bombs with Rhythm Pulse and Sparking Fuse
  engine.bombs.forEach(b => {
    const pulse = 1 + Math.sin(time * 12) * (0.05 + (1 - b.fuse / b.maxFuse) * 0.14);
    const r = 14 * pulse;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(b.x, b.y + 12, r * 0.9, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Bomb Sphere
    ctx.fillStyle = b.owner === 'kurobom' ? '#18181b' : '#0f172a';
    ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();

    // Gloss Specular
    ctx.fillStyle = '#64748b';
    ctx.beginPath(); ctx.arc(b.x - 4, b.y - 4, r * 0.35, 0, Math.PI * 2); ctx.fill();

    // Neck & Fuse
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(b.x - 3, b.y - r - 2, 6, 4);

    // Sparking fuse flame
    const sparkX = b.x + 4 + Math.sin(time * 30) * 2;
    const sparkY = b.y - r - 5;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(sparkX - 2, sparkY - 2, 4, 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
  });

  // Blocks (Hard 1 and Soft 2)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const val = engine.mapGrid[r][c];
      const x = PLAYFIELD_OFFSET_X + c * TILE_SIZE;
      const y = PLAYFIELD_OFFSET_Y + r * TILE_SIZE;
      if (val === 1) {
        // 3D Beveled Stone Columns
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        // Center rivet
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(x + 17, y + 17, 6, 6);
      } else if (val === 2) {
        // Destructible Brick Blocks
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 3, y + 3, 16, 14); ctx.fillRect(x + 21, y + 3, 15, 14);
        ctx.fillRect(x + 3, y + 21, 16, 14); ctx.fillRect(x + 21, y + 21, 15, 14);
      }
    }
  }

  // Enemies & AI Rival
  engine.enemies.forEach(e => {
    if (e.isDying) return;

    if (e.type === 'kurobom') {
      // Black Bomberman Rival
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.fillStyle = '#18181b'; ctx.fillRect(-8, 9, 6, 6); ctx.fillRect(2, 9, 6, 6); // Boots
      ctx.fillStyle = '#27272a'; ctx.fillRect(-6, 2, 12, 10); // Body
      ctx.fillStyle = '#09090b'; ctx.beginPath(); ctx.arc(0, -6, 12, 0, Math.PI * 2); ctx.fill(); // Helmet
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0, -19, 4, 0, Math.PI * 2); ctx.fill(); // Pom-pom
      ctx.fillStyle = '#f87171'; ctx.fillRect(-7, -9, 14, 7); // Visor
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-4, -8, 2, 5); ctx.fillRect(2, -8, 2, 5); // Fierce eyes
      ctx.restore();
    } else if (e.type === 'magnet_boss') {
      // Giant Magnet Boss
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.fillStyle = e.isHit ? '#ffffff' : '#581c87';
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c084fc'; ctx.fillRect(-12, -4, 24, 8);
      ctx.fillStyle = '#eab308'; ctx.fillRect(-8, -8, 4, 4); ctx.fillRect(4, -8, 4, 4);
      // Lightning arcs
      if (Math.sin(time * 20) > 0.4) {
        ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2;
        ctx.strokeRect(-24, -24, 48, 48);
      }
      ctx.restore();
    } else {
      // Ballom / Onil / Minvo
      ctx.fillStyle = e.isHit ? '#ffffff' : e.type === 'ballom' ? '#f97316' : e.type === 'onil' ? '#0d9488' : '#db2777';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 13, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.x - 6, e.y - 4, 4, 5); ctx.fillRect(e.x + 2, e.y - 4, 4, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(e.x - 4, e.y - 3, 2, 3); ctx.fillRect(e.x + 4, e.y - 3, 2, 3);
    }
  });

  // Player (White Bomberman)
  const p = engine.player;
  if (!p.isDead && (!p.isInvulnerable || Math.floor(time * 16) % 2 === 0)) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Shield Aura
    if (p.hasShield) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Curse Floating Skull
    if (p.isCursed) {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-6, -32 + Math.sin(time * 6) * 3, 12, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -29 + Math.sin(time * 6) * 3, 2, 3);
      ctx.fillRect(2, -29 + Math.sin(time * 6) * 3, 2, 3);
    }

    // Walking animation foot offset
    const walkFoot = p.isMoving ? Math.sin(p.frame * 2) * 3 : 0;

    // Feet & Boxing Gloves
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-8, 9 + walkFoot, 5, 5);
    ctx.fillRect(3, 9 - walkFoot, 5, 5);

    // Torso Suit
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-6, 2, 12, 9);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-6, 7, 12, 2); // Belt

    // Helmet
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(0, -6, 12, 0, Math.PI * 2); ctx.fill();

    // Pom-pom on helmet
    ctx.fillStyle = p.hasRemote ? '#38bdf8' : '#f43f5e';
    ctx.beginPath(); ctx.arc(0, -19 + Math.sin(time * 10) * 1.5, 4, 0, Math.PI * 2); ctx.fill();

    // Visor
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-7, -9, 14, 7);

    // Directional Eyes
    ctx.fillStyle = '#0f172a';
    if (p.direction === 'left') {
      ctx.fillRect(-6, -8, 2, 5); ctx.fillRect(-1, -8, 2, 5);
    } else if (p.direction === 'right') {
      ctx.fillRect(-1, -8, 2, 5); ctx.fillRect(4, -8, 2, 5);
    } else if (p.direction === 'up') {
      ctx.fillRect(-4, -9, 2, 3); ctx.fillRect(2, -9, 2, 3);
    } else {
      ctx.fillRect(-4, -8, 2, 5); ctx.fillRect(2, -8, 2, 5);
    }

    ctx.restore();
  }

  // Explosions
  engine.explosions.forEach(exp => {
    const x = PLAYFIELD_OFFSET_X + exp.gridC * TILE_SIZE;
    const y = PLAYFIELD_OFFSET_Y + exp.gridR * TILE_SIZE;
    ctx.fillStyle = '#ea580c'; ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.fillStyle = '#facc15'; ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 11, y + 11, TILE_SIZE - 22, TILE_SIZE - 22);
  });

  // Particles
  engine.particles.forEach(pt => {
    const alpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    ctx.globalAlpha = 1.0;
  });

  // Floating Arcade Score & Combo Text
  engine.floatingTexts.forEach(ft => {
    const alpha = Math.max(0, 1 - ft.timer / ft.maxTimer);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#000000';
    ctx.fillText(ft.text, ft.x - 1, ft.y);
    ctx.fillText(ft.text, ft.x + 1, ft.y);
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = alpha;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1.0;
  });

  ctx.restore();
}

// --- 7. INPUT (Keyboard & Gamepad Controller) ---
const Input = {
  keys: {},
  justPressed: {},
  gamepadName: null,

  init() {
    window.addEventListener('keydown', e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyX'].includes(e.code)) e.preventDefault();
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      this.justPressed[e.code] = false;
    });
    window.addEventListener('gamepadconnected', e => {
      this.gamepadName = e.gamepad.id ? e.gamepad.id.substring(0, 20) : 'Gamepad';
      const el = document.getElementById('gamepad-badge');
      if (el) { el.classList.remove('hidden'); document.getElementById('gamepad-name').textContent = this.gamepadName; }
    });
    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadName = null;
      const el = document.getElementById('gamepad-badge');
      if (el) el.classList.add('hidden');
    });
  },

  getState() {
    const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
    let gpLeft = false, gpRight = false, gpUp = false, gpDown = false, gpBomb = false, gpDetonate = false;
    if (gp) {
      gpLeft = Boolean(gp.buttons[14]?.pressed || (gp.axes[0] < -0.4));
      gpRight = Boolean(gp.buttons[15]?.pressed || (gp.axes[0] > 0.4));
      gpUp = Boolean(gp.buttons[12]?.pressed || (gp.axes[1] < -0.4));
      gpDown = Boolean(gp.buttons[13]?.pressed || (gp.axes[1] > 0.4));
      gpBomb = Boolean(gp.buttons[0]?.pressed);
      gpDetonate = Boolean(gp.buttons[1]?.pressed || gp.buttons[2]?.pressed);
    }

    const bomb = this.justPressed['Space'] || gpBomb;
    const detonate = this.justPressed['KeyX'] || this.justPressed['KeyB'] || gpDetonate;
    this.justPressed['Space'] = false;
    this.justPressed['KeyX'] = false;
    this.justPressed['KeyB'] = false;

    return {
      left: this.keys['ArrowLeft'] || this.keys['KeyA'] || gpLeft,
      right: this.keys['ArrowRight'] || this.keys['KeyD'] || gpRight,
      up: this.keys['ArrowUp'] || this.keys['KeyW'] || gpUp,
      down: this.keys['ArrowDown'] || this.keys['KeyS'] || gpDown,
      bomb: bomb,
      detonate: detonate
    };
  }
};

// --- 8. INITIALIZE GAME & UI EVENT HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
  Input.init();
  const engine = new GameEngine();
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  const textarea = document.getElementById('code-textarea');
  const lineNumbers = document.getElementById('line-numbers');
  const lineCountLabel = document.getElementById('line-count-label');
  const presetSelect = document.getElementById('preset-select');
  const runBtn = document.getElementById('run-btn');
  const copyBtn = document.getElementById('copy-btn');
  const resetBtn = document.getElementById('reset-code-btn');
  const crtBtn = document.getElementById('crt-btn');
  const audioBtn = document.getElementById('audio-btn');
  const crtOverlay = document.getElementById('crt-overlay');
  const modalContainer = document.getElementById('modal-container');

  function updateLineNumbers() {
    const lines = textarea.value.split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
    lineCountLabel.textContent = `JavaScript Config • ${lines.length} Baris`;
  }

  textarea.addEventListener('input', updateLineNumbers);
  textarea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textarea.scrollTop;
  });

  function parseCodeConfig(code) {
    const config = {};
    const matchLives = code.match(/this\.lives\s*=\s*(\d+)/);
    if (matchLives) config.lives = parseInt(matchLives[1], 10);
    const matchMaxBombs = code.match(/this\.maxBombs\s*=\s*(\d+)/);
    if (matchMaxBombs) config.maxBombs = parseInt(matchMaxBombs[1], 10);
    const matchFire = code.match(/this\.firePower\s*=\s*(\d+)/);
    if (matchFire) config.firePower = parseInt(matchFire[1], 10);
    const matchSpeed = code.match(/this\.moveSpeed\s*=\s*(\d+)/);
    if (matchSpeed) config.moveSpeed = parseInt(matchSpeed[1], 10);
    const matchBoss = code.match(/this\.bossHp\s*=\s*(\d+)/);
    if (matchBoss) config.bossHp = parseInt(matchBoss[1], 10);
    const matchStage = code.match(/this\.stageNumber\s*=\s*(\d+)/);
    if (matchStage) config.stage = Math.max(0, parseInt(matchStage[1], 10) - 1);
    return config;
  }

  function launchGameFromEditor() {
    AudioFX.init();
    modalContainer.innerHTML = '';
    const parsed = parseCodeConfig(textarea.value);
    const stage = parsed.stage !== undefined ? parsed.stage : 0;
    engine.initStage(stage, parsed);
    document.getElementById('hud-stage-badge').textContent = `STAGE ${stage + 1}`;
  }

  textarea.value = PRESETS.stage1;
  updateLineNumbers();
  launchGameFromEditor();

  runBtn.addEventListener('click', launchGameFromEditor);
  presetSelect.addEventListener('change', (e) => {
    textarea.value = PRESETS[e.target.value] || PRESETS.stage1;
    updateLineNumbers();
    launchGameFromEditor();
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(textarea.value);
    copyBtn.textContent = 'Tersalin!';
    setTimeout(() => copyBtn.textContent = 'Salin', 2000);
  });

  resetBtn.addEventListener('click', () => {
    textarea.value = PRESETS.stage1;
    presetSelect.value = 'stage1';
    updateLineNumbers();
    launchGameFromEditor();
  });

  // Switcher Bagi Dua vs Full Game
  const btnSplit = document.getElementById('btn-view-split');
  const btnGame = document.getElementById('btn-view-game');
  const editorSection = document.getElementById('editor-section');
  const gameSection = document.getElementById('game-section');

  btnSplit.addEventListener('click', () => {
    editorSection.classList.remove('hidden');
    editorSection.className = 'w-1/2 border-r border-slate-800 flex flex-col bg-[#0b0f19] font-mono text-xs';
    gameSection.className = 'w-1/2 flex flex-col bg-slate-950 relative h-full overflow-hidden';
    btnSplit.className = 'px-2.5 py-1 rounded bg-amber-600 text-white font-semibold transition-all';
    btnGame.className = 'px-2.5 py-1 rounded text-slate-400 hover:text-white transition-all';
  });

  btnGame.addEventListener('click', () => {
    editorSection.classList.add('hidden');
    gameSection.className = 'w-full flex flex-col bg-slate-950 relative h-full overflow-hidden';
    btnGame.className = 'px-2.5 py-1 rounded bg-amber-600 text-white font-semibold transition-all';
    btnSplit.className = 'px-2.5 py-1 rounded text-slate-400 hover:text-white transition-all';
  });

  // CRT Shader Toggle
  let crtEnabled = true;
  crtBtn.addEventListener('click', () => {
    crtEnabled = !crtEnabled;
    crtOverlay.style.display = crtEnabled ? 'block' : 'none';
    crtBtn.innerHTML = `📺 <span class="hidden sm:inline">CRT ${crtEnabled ? 'ON' : 'OFF'}</span>`;
    crtBtn.className = crtEnabled
      ? 'flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-all bg-cyan-950 text-cyan-300 border-cyan-700'
      : 'flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-all bg-slate-800 text-slate-400 border-slate-700';
  });

  // Audio Toggle
  audioBtn.addEventListener('click', () => {
    AudioFX.isMuted = !AudioFX.isMuted;
    audioBtn.textContent = AudioFX.isMuted ? '🔇' : '🔊';
    if (AudioFX.isMuted) AudioFX.stopBGM();
    else AudioFX.playBGM(engine.level.theme);
  });

  // Cheat Button Max Power
  const cheatBtn = document.getElementById('hud-cheat-power');
  if (cheatBtn) {
    cheatBtn.addEventListener('click', () => {
      const p = engine.player;
      p.maxBombs = 6;
      p.firePower = 8;
      p.speed = 220;
      p.hasKick = true;
      p.hasShield = true;
      p.hasRemote = true;
      p.hasFullFire = true;
      engine.addFloatingText('CHEAT AKTIF: MAX POWER!', p.x, p.y - 20, '#f59e0b');
      AudioFX.play('powerup');
    });
  }

  // HUD Detonate Button
  const detonateBtn = document.getElementById('hud-detonate-btn');
  if (detonateBtn) {
    detonateBtn.addEventListener('click', () => {
      engine.detonateAllBombs();
    });
  }

  // Download Package Button
  const downloadBtn = document.getElementById('download-pkg-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      showDownloadModal();
    });
  }

  function triggerDownload(content, filename, type) {
    const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadAsZip() {
    const btn = document.getElementById('btn-download-all-zip');
    if (btn) btn.innerHTML = '⏳ Menyiapkan Paket ZIP...';

    try {
      const fetchFile = async (paths) => {
        for (const p of paths) {
          try {
            const res = await fetch(p);
            if (res.ok) return await res.text();
          } catch (_) {}
        }
        return '';
      };

      const [htmlContent, cssContent, jsContent] = await Promise.all([
        fetchFile(['./index.html', './modul-06.html', '/modul-06/index.html', '/index.html']).then(txt => txt || document.documentElement.outerHTML),
        fetchFile(['./modul-06.css', './modul-06/modul-06.css', '/modul-06.css']),
        fetchFile(['./modul-06.js', './modul-06/modul-06.js', '/modul-06.js'])
      ]);

      const readmeContent = `========================================================
SUPER BOMBERMAN R - 90s RETRO EDITION (MODUL 06)
========================================================

SELAMAT! Anda telah mengunduh paket lengkap Modul 06.

ISI PAKET:
1. index.html (atau modul-06.html) - Struktur aplikasi & UI retro
2. modul-06.css                    - Gaya visual arcade & efek scanline CRT
3. modul-06.js                     - Game engine, procedural audio & controls
4. README.txt                      - Panduan menjalankan

CARA MENJALANKAN GAME SECARA OFFLINE:
1. Pastikan ketiga file (index.html, modul-06.css, modul-06.js) berada dalam 1 folder yang sama.
2. Klik ganda (Double-click) pada "index.html" untuk langsung memainkannya di Google Chrome, Edge, Firefox, atau Safari.
3. Tidak memerlukan koneksi internet atau instalasi Node.js/server!

KONTROL GAME:
- Bergerak : Tombol Panah (Arrow Keys) atau W, A, S, D
- Taruh Bom: Tombol SPASI (Spacebar)
- Detonasi : Tombol X (bila item remote detonator aktif)
- Gamepad  : D-Pad / Analog untuk gerak, Tombol A untuk Bom, Start untuk Pause

Selamat bermain & bereksperimen dengan parameter di panel editor!
`;

      if (window.JSZip) {
        const zip = new window.JSZip();
        zip.file('index.html', htmlContent);
        zip.file('modul-06.html', htmlContent);
        zip.file('modul-06.css', cssContent);
        zip.file('modul-06.js', jsContent);
        zip.file('README.txt', readmeContent);

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Modul-06-Bomberman-90s.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (btn) btn.innerHTML = '✓ Berhasil Diunduh (.ZIP)!';
        setTimeout(() => { if (btn) btn.innerHTML = 'Unduh Semua dalam 1 Paket (.ZIP)'; }, 3500);
      } else {
        // Fallback jika CDN JSZip tidak aktif
        triggerDownload(htmlContent, 'index.html', 'text/html');
        triggerDownload(cssContent, 'modul-06.css', 'text/css');
        triggerDownload(jsContent, 'modul-06.js', 'text/javascript');
        triggerDownload(readmeContent, 'README.txt', 'text/plain');
        if (btn) btn.innerHTML = '✓ 3 File Berhasil Diunduh!';
        setTimeout(() => { if (btn) btn.innerHTML = 'Unduh Semua dalam 1 Paket (.ZIP)'; }, 3500);
      }
    } catch (e) {
      console.error(e);
      if (btn) btn.innerHTML = 'Gagal, silakan gunakan tombol file satuan di bawah';
    }
  }

  function showDownloadModal() {
    modalContainer.innerHTML = `
      <div class="pointer-events-auto bg-slate-950 border-4 border-emerald-500 rounded-lg p-5 max-w-md w-full shadow-2xl font-pixel text-xs text-left">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <h3 class="text-xs sm:text-sm text-emerald-400 font-bold flex items-center gap-2">
            <span>📦</span> UNDUH PAKET MODUL 06
          </h3>
          <button id="download-modal-close" class="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 text-[10px] cursor-pointer">✕</button>
        </div>

        <p class="text-[10px] text-slate-300 font-sans leading-relaxed mb-3">
          Modul 06 telah <b>100% siap di-download</b> dan siap dimainkan secara offline di komputer Anda:
        </p>

        <div class="bg-slate-900 border border-slate-800 rounded p-2.5 mb-3 space-y-1.5 text-[10px] font-mono">
          <div class="flex items-center justify-between text-slate-200">
            <span class="flex items-center gap-1.5"><span class="text-amber-400 font-bold">&lt;/&gt;</span> index.html</span>
            <span class="text-emerald-400 text-[9px] font-bold">✓ SIAP</span>
          </div>
          <div class="flex items-center justify-between text-slate-200">
            <span class="flex items-center gap-1.5"><span class="text-pink-400 font-bold">#</span> modul-06.css</span>
            <span class="text-emerald-400 text-[9px] font-bold">✓ SIAP</span>
          </div>
          <div class="flex items-center justify-between text-slate-200">
            <span class="flex items-center gap-1.5"><span class="text-blue-400 font-bold">JS</span> modul-06.js</span>
            <span class="text-emerald-400 text-[9px] font-bold">✓ SIAP (Hero Fix)</span>
          </div>
        </div>

        <div class="space-y-2 mb-3 font-sans">
          <button id="btn-download-all-zip" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 cursor-pointer transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh Semua dalam 1 Paket (.ZIP)
          </button>

          <div class="text-[9px] text-slate-400 text-center font-mono py-0.5">atau unduh satuan:</div>
          <div class="grid grid-cols-3 gap-1.5">
            <button id="btn-dl-html" class="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded text-[10px] text-center font-mono cursor-pointer">
              📄 index.html
            </button>
            <button id="btn-dl-css" class="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-pink-300 border border-slate-700 rounded text-[10px] text-center font-mono cursor-pointer">
              🎨 modul-06.css
            </button>
            <button id="btn-dl-js" class="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-700 rounded text-[10px] text-center font-mono cursor-pointer">
              ⚡ modul-06.js
            </button>
          </div>
        </div>

        <div class="text-[9px] text-slate-400 font-sans border-t border-slate-800 pt-2 flex items-center gap-1.5">
          <span>💡</span>
          <span>Ekstrak ZIP ke satu folder, lalu klik 2x <b>index.html</b> untuk langsung bermain offline.</span>
        </div>
      </div>
    `;

    document.getElementById('download-modal-close').onclick = () => { modalContainer.innerHTML = ''; };
    document.getElementById('btn-download-all-zip').onclick = downloadAsZip;

    document.getElementById('btn-dl-html').onclick = async () => {
      const text = await fetch('./index.html').then(r => r.text()).catch(() => document.documentElement.outerHTML);
      triggerDownload(text, 'index.html', 'text/html');
    };
    document.getElementById('btn-dl-css').onclick = async () => {
      const text = await fetch('./modul-06.css').then(r => r.text()).catch(() => fetch('./modul-06/modul-06.css').then(r => r.text()));
      triggerDownload(text, 'modul-06.css', 'text/css');
    };
    document.getElementById('btn-dl-js').onclick = async () => {
      const text = await fetch('./modul-06.js').then(r => r.text()).catch(() => fetch('./modul-06/modul-06.js').then(r => r.text()));
      triggerDownload(text, 'modul-06.js', 'text/javascript');
    };
  }

  document.getElementById('toggle-menu-btn').addEventListener('click', () => {
    showMenuModal();
  });

  function showMenuModal() {
    modalContainer.innerHTML = `
      <div class="pointer-events-auto bg-slate-950 border-4 border-amber-500 rounded-lg p-5 max-w-sm w-full text-center shadow-2xl font-pixel text-xs">
        <h2 class="text-xl text-amber-400 font-bold mb-3">SUPER BOMBERMAN</h2>
        <div class="space-y-2 mb-4">
          <button id="menu-play-btn" class="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded border border-amber-400">► MAIN SEKARANG</button>
          <button id="menu-battle-btn" class="w-full py-2 px-3 bg-purple-900 hover:bg-purple-800 text-purple-200 rounded border border-purple-600">⚔️ 1v1 VS KUROBOM AI</button>
          <button id="menu-scores-btn" class="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-600">🏆 PAPAN SKOR</button>
          <button id="menu-close-btn" class="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded">TUTUP</button>
        </div>
        <div class="text-[9px] text-slate-500">Panah/WASD = Gerak | Spasi = Bom | X = Detonasi</div>
      </div>
    `;
    document.getElementById('menu-play-btn').onclick = () => { modalContainer.innerHTML = ''; launchGameFromEditor(); };
    document.getElementById('menu-battle-btn').onclick = () => {
      modalContainer.innerHTML = '';
      presetSelect.value = 'battle';
      textarea.value = PRESETS.battle;
      updateLineNumbers();
      launchGameFromEditor();
    };
    document.getElementById('menu-close-btn').onclick = () => { modalContainer.innerHTML = ''; };
    document.getElementById('menu-scores-btn').onclick = () => { showScoresModal(); };
  }

  function showScoresModal() {
    const scores = Storage.getScores();
    modalContainer.innerHTML = `
      <div class="pointer-events-auto bg-slate-950 border-4 border-amber-500 rounded-lg p-5 max-w-md w-full text-center shadow-2xl font-pixel text-[10px]">
        <h3 class="text-base text-amber-400 font-bold mb-3">🏆 PAPAN SKOR ARCADE</h3>
        <div class="bg-slate-900 p-2 rounded border border-slate-800 mb-4 space-y-1">
          ${scores.map((s, i) => `
            <div class="flex justify-between py-1 border-b border-slate-800/60 ${i === 0 ? 'text-amber-300 font-bold' : 'text-slate-300'}">
              <span>#${i+1} ${s.name}</span>
              <span class="text-amber-400">${s.score} PTS</span>
              <span class="text-slate-400">STG ${s.stage}</span>
            </div>
          `).join('')}
        </div>
        <button id="scores-back-btn" class="py-1.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded">KEMBALI</button>
      </div>
    `;
    document.getElementById('scores-back-btn').onclick = () => { showMenuModal(); };
  }

  function showGameOverModal() {
    modalContainer.innerHTML = `
      <div class="pointer-events-auto bg-slate-950 border-4 border-red-600 rounded-lg p-5 max-w-sm w-full text-center shadow-2xl font-pixel text-xs">
        <h2 class="text-2xl text-red-500 font-bold mb-2 animate-pulse">GAME OVER</h2>
        <div class="text-slate-400 text-[10px] mb-2">SKOR AKHIR:</div>
        <div class="text-2xl text-amber-400 font-bold mb-4">${String(engine.score).padStart(6, '0')}</div>
        <div class="flex justify-center gap-2 mb-4">
          <input id="score-name-input" type="text" maxlength="3" value="ACE" class="bg-black border border-amber-500 rounded px-2 py-1 text-center text-amber-400 font-pixel text-sm uppercase w-20">
          <button id="score-save-btn" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] rounded">SIMPAN</button>
        </div>
        <button id="restart-btn" class="w-full py-2 bg-red-700 hover:bg-red-600 text-white rounded border border-red-500">MAIN LAGI</button>
      </div>
    `;
    document.getElementById('score-save-btn').onclick = () => {
      const name = document.getElementById('score-name-input').value || 'ACE';
      Storage.saveScore(name, engine.score, engine.stageIdx + 1);
      document.getElementById('score-save-btn').textContent = 'OK! ✓';
      document.getElementById('score-save-btn').disabled = true;
    };
    document.getElementById('restart-btn').onclick = () => {
      modalContainer.innerHTML = '';
      launchGameFromEditor();
    };
  }

  function showStageClearModal() {
    modalContainer.innerHTML = `
      <div class="pointer-events-auto bg-slate-950 border-4 border-amber-400 rounded-lg p-5 max-w-sm w-full text-center shadow-2xl font-pixel text-xs">
        <h2 class="text-2xl text-amber-300 font-bold mb-1">STAGE CLEAR!</h2>
        <div class="text-[10px] text-cyan-400 mb-4">${engine.level.name} SELESAI</div>
        <div class="text-slate-300 mb-4">TOTAL SKOR: <span class="text-amber-400 font-bold">${engine.score}</span></div>
        <button id="next-stage-btn" class="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded border border-amber-400">LANJUT LEVEL BERIKUTNYA ►</button>
      </div>
    `;
    document.getElementById('next-stage-btn').onclick = () => {
      modalContainer.innerHTML = '';
      const nextIdx = engine.stageIdx + 1;
      if (nextIdx < STAGES_CONFIG.length) {
        engine.initStage(nextIdx);
        document.getElementById('hud-stage-badge').textContent = `STAGE ${nextIdx + 1}`;
      } else {
        showMenuModal();
      }
    };
  }

  // --- 60 FPS MAIN LOOP ---
  let lastTime = performance.now();
  let shownGameOver = false;
  let shownClear = false;

  function gameLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    const inputState = Input.getState();
    engine.update(dt, inputState);

    renderGame(ctx, engine, time / 1000);

    // Update HUD
    document.getElementById('hud-score').textContent = String(engine.score).padStart(6, '0');
    document.getElementById('hud-time').textContent = `${Math.ceil(engine.timeLeft)}s`;
    document.getElementById('hud-lives').textContent = `♥ x${engine.player.lives}`;
    document.getElementById('hud-bombs').textContent = `${engine.player.activeBombs}/${engine.player.maxBombs}`;
    document.getElementById('hud-fire').textContent = `${engine.player.firePower}`;
    document.getElementById('hud-speed').textContent = `${engine.player.speed}`;

    // Item Status Indicators
    const elKick = document.getElementById('hud-item-kick');
    if (elKick) elKick.className = engine.player.hasKick ? 'opacity-100 bg-yellow-950/80 px-1.5 py-0.5 rounded border border-yellow-500 text-yellow-300 font-bold' : 'opacity-30 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-yellow-400';

    const elShield = document.getElementById('hud-item-shield');
    if (elShield) elShield.className = engine.player.hasShield ? 'opacity-100 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500 text-cyan-300 font-bold animate-pulse' : 'opacity-30 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-cyan-400';

    const elRemote = document.getElementById('hud-item-remote');
    if (elRemote) elRemote.className = engine.player.hasRemote ? 'opacity-100 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500 text-sky-300 font-bold' : 'opacity-30 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-blue-400';

    const elFullFire = document.getElementById('hud-item-fullfire');
    if (elFullFire) elFullFire.className = engine.player.hasFullFire ? 'opacity-100 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500 text-amber-300 font-bold' : 'opacity-30 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-amber-400';

    const elCurse = document.getElementById('hud-item-curse');
    if (elCurse) {
      if (engine.player.isCursed) {
        elCurse.classList.remove('hidden');
        elCurse.textContent = `💀 ${engine.player.curseType.toUpperCase()} (${Math.ceil(engine.player.curseTimer)}s)`;
      } else {
        elCurse.classList.add('hidden');
      }
    }

    const detonateBtnEl = document.getElementById('hud-detonate-btn');
    if (detonateBtnEl) {
      if (engine.player.hasRemote && engine.bombs.length > 0) {
        detonateBtnEl.classList.remove('hidden');
      } else {
        detonateBtnEl.classList.add('hidden');
      }
    }

    const boss = engine.enemies.find(e => e.type === 'magnet_boss' || e.type === 'kurobom');
    const bossContainer = document.getElementById('hud-boss-container');
    if (boss && !boss.isDying) {
      bossContainer.classList.remove('hidden');
      const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
      document.getElementById('hud-boss-bar').style.width = `${pct}%`;
      const label = boss.type === 'kurobom' ? 'KUROBOM RIVAL:' : 'MAGNET BOMBER:';
      document.getElementById('hud-boss-label').textContent = label;
      document.getElementById('hud-boss-hp-text').textContent = `${boss.hp}/${boss.maxHp}`;
    } else {
      bossContainer.classList.add('hidden');
    }

    if (engine.isGameOver && !shownGameOver) {
      shownGameOver = true;
      showGameOverModal();
    } else if (!engine.isGameOver) {
      shownGameOver = false;
    }

    if (engine.isStageClear && !shownClear) {
      shownClear = true;
      showStageClearModal();
    } else if (!engine.isStageClear) {
      shownClear = false;
    }

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
