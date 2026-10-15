/**
 * ==========================================================================
 * SUPER BOMBERMAN R (90s RETRO EDITION) - MODUL-06.JS
 * File Utama Logika Game, Sintesis Audio 8-Bit,
 * Deteksi Input Keyboard/Gamepad, Engine Fisika, dan Sinkronisasi Editor.
 * ==========================================================================
 */

// --- 1. PRESET SKRIP UNTUK EDITOR KODE ---
const PRESETS = {
  stage1: `// SUPER BOMBERMAN R - STAGE 1: SOLAR PLANET (PRO REFACTOR - FIXED)
// Object-Oriented Architecture, Physics Overlap Optimization, World Bounds Enforced

class SolarPlanetConfig {
  init() {
    this.stageNumber = 1;
    this.theme = 'solar';
    this.GRID_SIZE = 40;
    this.COLS = 15;
    this.ROWS = 11;

    // Player Configuration (Ubah di sini lalu klik Jalankan!)
    this.score = 0;
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
      osc.type = 'sine'; osc.frequency.setValueAtTime(320, t); osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);
      gain.gain.setValueAtTime(this.sfxVolume * 0.35, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.12);
    } else if (type === 'explode') {
      const sampleRate = this.ctx.sampleRate;
      const dur = 0.45;
      const bufSize = Math.floor(sampleRate * dur);
      const buf = this.ctx.createBuffer(1, bufSize, sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-3.5 * (i / bufSize));
      const noise = this.ctx.createBufferSource(); noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, t); filter.frequency.exponentialRampToValueAtTime(80, t + dur);
      gain.gain.setValueAtTime(this.sfxVolume * 0.55, t); gain.gain.linearRampToValueAtTime(0.01, t + dur);
      noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
      noise.start(t); noise.stop(t + dur);

      const sub = this.ctx.createOscillator(); const subG = this.ctx.createGain();
      sub.type = 'triangle'; sub.frequency.setValueAtTime(140, t); sub.frequency.exponentialRampToValueAtTime(35, t + 0.25);
      subG.gain.setValueAtTime(this.sfxVolume * 0.4, t); subG.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      sub.connect(subG); subG.connect(this.ctx.destination); sub.start(t); sub.stop(t + 0.25);
    } else if (type === 'powerup') {
      const notes = [330, 392, 493.88, 587.33, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const stepT = t + idx * 0.035;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(freq, stepT);
        g.gain.setValueAtTime(this.sfxVolume * 0.2, stepT); g.gain.exponentialRampToValueAtTime(0.001, stepT + 0.05);
        o.connect(g); g.connect(this.ctx.destination); o.start(stepT); o.stop(stepT + 0.05);
      });
    } else if (type === 'kick') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(180, t); osc.frequency.exponentialRampToValueAtTime(450, t + 0.1);
      gain.gain.setValueAtTime(this.sfxVolume * 0.35, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.12);
    } else if (type === 'enemy_death') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(380, t); osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);
      gain.gain.setValueAtTime(this.sfxVolume * 0.35, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t + 0.18);
    } else if (type === 'hurt') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(650, t); osc.frequency.linearRampToValueAtTime(120, t + 0.35);
      gain.gain.setValueAtTime(this.sfxVolume * 0.4, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
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
    const scale = this.currentTheme === 'magma' || this.currentTheme === 'fortress'
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
        { name: 'BOM', score: 12500, stage: 4, date: '1995-04-28' },
        { name: 'ACE', score: 9800, stage: 3, date: '1995-05-12' },
        { name: 'MAX', score: 7400, stage: 2, date: '1995-06-01' }
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
  { num: 1, name: 'SOLAR PLANET', theme: 'solar', softBlockDensity: 0.62, enemies: [{ type: 'ballom', count: 3 }, { type: 'onil', count: 2 }], hasBoss: false },
  { num: 2, name: 'CYBER FACTORY', theme: 'cyber', softBlockDensity: 0.65, enemies: [{ type: 'ballom', count: 2 }, { type: 'onil', count: 3 }, { type: 'minvo', count: 2 }], hasBoss: false },
  { num: 3, name: 'MAGMA CORE', theme: 'magma', softBlockDensity: 0.68, enemies: [{ type: 'onil', count: 3 }, { type: 'minvo', count: 4 }], hasBoss: false },
  { num: 4, name: 'STAR FORTRESS', theme: 'fortress', softBlockDensity: 0.55, enemies: [{ type: 'minvo', count: 2 }, { type: 'magnet_boss', count: 1 }], hasBoss: true }
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
    this.enemies = [];
    this.exitDoor = null;

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
    this.enemies = [];

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
        if (eType.type === 'magnet_boss') cell = { c: GRID_COLS - 2, r: GRID_ROWS - 2 };
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
    else if (type === 'minvo') { speed = 105; score = 400; }
    else if (type === 'magnet_boss') { speed = 75; hp = bossHpOverride || 12; score = 2500; }

    return {
      id: Math.random().toString(), type, x, y, vx: 0, vy: speed,
      direction: 'down', speed, hp, maxHp: hp, isHit: false, hitTimer: 0,
      isDying: false, deathTimer: 0, scoreValue: score, nextDecision: 0, attackTimer: 0
    };
  }

  update(dt, input) {
    if (this.isGameOver || this.isStageClear || this.isVictory) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.killPlayer();
    }

    this.updatePlayer(dt, input);
    this.updateBombs(dt);
    this.updateExplosions(dt);
    this.updateEnemies(dt);
    this.updatePowerups(dt);
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
    if (input.left) { dx -= 1; p.direction = 'left'; }
    else if (input.right) { dx += 1; p.direction = 'right'; }
    else if (input.up) { dy -= 1; p.direction = 'up'; }
    else if (input.down) { dy += 1; p.direction = 'down'; }

    p.isMoving = dx !== 0 || dy !== 0;
    if (p.isMoving) p.frame += dt * 8;

    const moveStep = p.speed * dt;
    if (dx !== 0) this.movePlayerAxis(dx * moveStep, 0);
    if (dy !== 0) this.movePlayerAxis(0, dy * moveStep);

    if (input.bomb) this.placeBomb();
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

  // DETEKSI TABRAKAN MELINGKAR DENGAN KLAUSUL AMAN
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

  placeBomb() {
    const p = this.player;
    if (p.isDead || p.activeBombs >= p.maxBombs) return;

    const c = Math.floor((p.x - PLAYFIELD_OFFSET_X) / TILE_SIZE);
    const r = Math.floor((p.y - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
    if (c < 1 || c >= GRID_COLS - 1 || r < 1 || r >= GRID_ROWS - 1) return;
    if (this.mapGrid[r][c] !== 0) return;

    const bombX = PLAYFIELD_OFFSET_X + c * TILE_SIZE + TILE_SIZE / 2;
    const bombY = PLAYFIELD_OFFSET_Y + r * TILE_SIZE + TILE_SIZE / 2;

    this.bombs.push({
      id: Math.random().toString(), gridC: c, gridR: r, x: bombX, y: bombY,
      range: p.firePower, fuse: 2.4, maxFuse: 2.4, isGhost: true, isMoving: false
    });
    this.mapGrid[r][c] = 3;
    p.activeBombs++;
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
        const speed = 220 * dt;
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
    this.player.activeBombs = Math.max(0, this.player.activeBombs - 1);

    AudioFX.play('explode');
    this.addExplosionCell(bomb.gridC, bomb.gridR);

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
    if (Math.random() < 0.38) {
      const types = ['bomb_up', 'fire_up', 'speed_up', 'kick', 'shield'];
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

      e.nextDecision -= dt;
      if (e.nextDecision <= 0) {
        e.nextDecision = 0.5;
        const c = Math.floor((e.x - PLAYFIELD_OFFSET_X) / TILE_SIZE);
        const r = Math.floor((e.y - PLAYFIELD_OFFSET_Y) / TILE_SIZE);
        const candidates = [
          { vx: 0, vy: -e.speed, dir: 'up', nc: c, nr: r - 1 },
          { vx: 0, vy: e.speed, dir: 'down', nc: c, nr: r + 1 },
          { vx: -e.speed, vy: 0, dir: 'left', nc: c - 1, nr: r },
          { vx: e.speed, vy: 0, dir: 'right', nc: c + 1, nr: r }
        ].filter(cand => cand.nc >= 0 && cand.nc < GRID_COLS && cand.nr >= 0 && cand.nr < GRID_ROWS && this.mapGrid[cand.nr][cand.nc] === 0);

        if (candidates.length > 0) {
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          e.vx = chosen.vx; e.vy = chosen.vy; e.direction = chosen.dir;
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
          this.movePlayerAxis(Math.cos(ang) * 25 * dt, Math.sin(ang) * 25 * dt);
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
    if (e.hp <= 0) {
      e.isDying = true;
      this.score += e.scoreValue;
      AudioFX.play('enemy_death');
      if (e.type === 'magnet_boss') {
        this.isVictory = true;
        this.score += 5000;
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
        AudioFX.play('powerup');
        if (pu.type === 'bomb_up') p.maxBombs = Math.min(8, p.maxBombs + 1);
        else if (pu.type === 'fire_up') p.firePower = Math.min(8, p.firePower + 1);
        else if (pu.type === 'speed_up') p.speed = Math.min(250, p.speed + 20);
        else if (pu.type === 'kick') p.hasKick = true;
        else if (pu.type === 'shield') p.hasShield = true;
        this.score += 100;
        this.powerups.splice(i, 1);
      }
    }
  }

  killPlayer() {
    const p = this.player;
    if (p.hasShield) {
      p.hasShield = false;
      p.isInvulnerable = true;
      p.invulnerableTimer = 2.0;
      AudioFX.play('hurt');
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
      if (this.exitDoor && !this.exitDoor.isOpen) this.exitDoor.isOpen = true;
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

// --- 6. CANVAS RENDERER ---
function renderGame(ctx, engine, time) {
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(PLAYFIELD_OFFSET_X - 4, PLAYFIELD_OFFSET_Y - 4, GRID_COLS * TILE_SIZE + 8, GRID_ROWS * TILE_SIZE + 8);

  const theme = engine.level.theme;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const x = PLAYFIELD_OFFSET_X + c * TILE_SIZE;
      const y = PLAYFIELD_OFFSET_Y + r * TILE_SIZE;
      const alt = (r + c) % 2 === 1;
      if (theme === 'solar') ctx.fillStyle = alt ? '#166534' : '#15803d';
      else if (theme === 'cyber') ctx.fillStyle = alt ? '#0f172a' : '#1e293b';
      else if (theme === 'magma') ctx.fillStyle = alt ? '#1c1917' : '#292524';
      else ctx.fillStyle = alt ? '#18181b' : '#27272a';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  if (engine.exitDoor && engine.mapGrid[engine.exitDoor.gridR]?.[engine.exitDoor.gridC] === 0) {
    const x = PLAYFIELD_OFFSET_X + engine.exitDoor.gridC * TILE_SIZE;
    const y = PLAYFIELD_OFFSET_Y + engine.exitDoor.gridR * TILE_SIZE;
    ctx.fillStyle = engine.exitDoor.isOpen ? '#38bdf8' : '#475569';
    ctx.fillRect(x + 6, y + 6, 28, 28);
  }

  engine.powerups.forEach(pu => {
    const x = PLAYFIELD_OFFSET_X + pu.gridC * TILE_SIZE + 6;
    const y = PLAYFIELD_OFFSET_Y + pu.gridR * TILE_SIZE + 6 + Math.sin(time * 5) * 3;
    ctx.fillStyle = pu.type === 'bomb_up' ? '#2563eb' : pu.type === 'fire_up' ? '#dc2626' : pu.type === 'speed_up' ? '#16a34a' : '#eab308';
    ctx.fillRect(x, y, 28, 28);
  });

  engine.bombs.forEach(b => {
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(b.x - 3, b.y - 15, 6, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(b.x + 3, b.y - 18, 3, 3);
  });

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const val = engine.mapGrid[r][c];
      const x = PLAYFIELD_OFFSET_X + c * TILE_SIZE;
      const y = PLAYFIELD_OFFSET_Y + r * TILE_SIZE;
      if (val === 1) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      } else if (val === 2) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
      }
    }
  }

  engine.enemies.forEach(e => {
    if (e.isDying) return;
    ctx.fillStyle = e.isHit ? '#ffffff' : e.type === 'ballom' ? '#f97316' : e.type === 'onil' ? '#0d9488' : e.type === 'minvo' ? '#db2777' : '#1e3a8a';
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.type === 'magnet_boss' ? 18 : 13, 0, Math.PI * 2);
    ctx.fill();
  });

  const p = engine.player;
  if (!p.isDead && (!p.isInvulnerable || Math.floor(time * 16) % 2 === 0)) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-8, 10, 5, 5); ctx.fillRect(3, 10, 5, 5);
    ctx.fillStyle = '#0284c7'; ctx.fillRect(-6, 2, 12, 10);
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, -5, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(0, -18, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(-7, -8, 14, 7);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-4, -7, 2, 5); ctx.fillRect(2, -7, 2, 5);
    ctx.restore();
  }

  engine.explosions.forEach(exp => {
    const x = PLAYFIELD_OFFSET_X + exp.gridC * TILE_SIZE;
    const y = PLAYFIELD_OFFSET_Y + exp.gridR * TILE_SIZE;
    ctx.fillStyle = '#ea580c'; ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.fillStyle = '#facc15'; ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 12);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 12, y + 12, TILE_SIZE - 24, TILE_SIZE - 24);
  });
}

// --- 7. INPUT (Keyboard & Gamepad Controller) ---
const Input = {
  keys: {},
  justPressed: {},
  gamepadName: null,

  init() {
    window.addEventListener('keydown', e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
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
    let gpLeft = false, gpRight = false, gpUp = false, gpDown = false, gpBomb = false;
    if (gp) {
      gpLeft = Boolean(gp.buttons[14]?.pressed || (gp.axes[0] < -0.4));
      gpRight = Boolean(gp.buttons[15]?.pressed || (gp.axes[0] > 0.4));
      gpUp = Boolean(gp.buttons[12]?.pressed || (gp.axes[1] < -0.4));
      gpDown = Boolean(gp.buttons[13]?.pressed || (gp.axes[1] > 0.4));
      gpBomb = Boolean(gp.buttons[0]?.pressed);
    }

    const bomb = this.justPressed['Space'] || gpBomb;
    this.justPressed['Space'] = false;

    return {
      left: this.keys['ArrowLeft'] || this.keys['KeyA'] || gpLeft,
      right: this.keys['ArrowRight'] || this.keys['KeyD'] || gpRight,
      up: this.keys['ArrowUp'] || this.keys['KeyW'] || gpUp,
      down: this.keys['ArrowDown'] || this.keys['KeyS'] || gpDown,
      bomb: bomb
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

  document.getElementById('toggle-menu-btn').addEventListener('click', () => {
    showMenuModal();
  });

  function showMenuModal() {
    modalContainer.innerHTML = `
      <div class="pointer-events-auto bg-slate-950 border-4 border-amber-500 rounded-lg p-5 max-w-sm w-full text-center shadow-2xl font-pixel text-xs">
        <h2 class="text-xl text-amber-400 font-bold mb-3">SUPER BOMBERMAN</h2>
        <div class="space-y-2 mb-4">
          <button id="menu-play-btn" class="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded border border-amber-400">► MAIN SEKARANG</button>
          <button id="menu-scores-btn" class="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-600">🏆 PAPAN SKOR</button>
          <button id="menu-close-btn" class="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded">TUTUP</button>
        </div>
        <div class="text-[9px] text-slate-500">Panah/WASD = Gerak | Spasi = Bom</div>
      </div>
    `;
    document.getElementById('menu-play-btn').onclick = () => { modalContainer.innerHTML = ''; launchGameFromEditor(); };
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

    const boss = engine.enemies.find(e => e.type === 'magnet_boss');
    const bossContainer = document.getElementById('hud-boss-container');
    if (boss && !boss.isDying) {
      bossContainer.classList.remove('hidden');
      const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
      document.getElementById('hud-boss-bar').style.width = `${pct}%`;
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
