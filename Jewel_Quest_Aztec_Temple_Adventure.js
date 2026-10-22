/**
 * JEWEL QUEST: AZTEC TEMPLE ADVENTURE
 * 100% OFFLINE EDITION (HTML5 Canvas + Web Audio API)
 * No internet connection or external libraries required.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. PROCEDURAL WEB AUDIO SYNTHESIZER (Zero external MP3s needed)
  // ==========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playStoneScrape() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(65, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    playSilverChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    playGoldGong() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.7);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(554.37, now);
      osc2.frequency.exponentialRampToValueAtTime(277.18, now + 0.6);

      sub.type = 'sine';
      sub.frequency.setValueAtTime(110, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain);
      osc2.connect(gain);
      sub.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      sub.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
      sub.stop(now + 0.85);
    }

    playMatch(combo = 1) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const freqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
      const offset = Math.min(combo - 1, 5);
      const notes = [
        freqs[offset % freqs.length],
        freqs[(offset + 2) % freqs.length],
        freqs[(offset + 4) % freqs.length],
      ];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.04;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    }

    playVictory() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.12;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    }
  }

  const audio = new SoundEngine();

  // ==========================================================================
  // 2. TEMPLE ARTIFACTS & LEVEL DEFINITIONS (16x16 & 18x18 Mega Chambers)
  // ==========================================================================
  const ARTIFACTS = [
    { id: 1, name: 'Topeng Matahari Aztec', icon: '🎭', desc: 'Ditempa dari lempengan emas murni pemuja dewa matahari Tonatiuh.' },
    { id: 2, name: 'Topeng Kematian Giok', icon: '👺', desc: 'Dipahat dari batu giok mulia oleh pendeta agung Palenque.' },
    { id: 3, name: 'Belati Obsidian Hitam', icon: '🗡️', desc: 'Senjata upacara sakral kaca vulkanik pengusir roh jahat.' },
    { id: 4, name: 'Mahkota Bulu Quetzal', icon: '👑', desc: 'Hiasan kepala kaisar berhiaskan permata zamrud dan bulu suci.' },
    { id: 5, name: 'Kalender Batu Matahari', icon: '☀️', desc: 'Piringan astronomi raksasa pemandu penanggalan peradaban Maya.' },
    { id: 6, name: 'Tengkorak Kristal Maya', icon: '💀', desc: 'Relik mistis kuarsa bening penyimpan kebijaksanaan leluhur.' },
  ];

  const LEVELS = [
    {
      id: 1,
      name: 'Ruang Altar Mega Berlumut (16x16)',
      width: 16,
      height: 16,
      moves: 46,
      timeSeconds: 240,
      artifact: ARTIFACTS[0],
      isCutout: (r, c) => false,
      isDouble: (r, c) => false,
      desc: 'Papan mega 16x16: Ubah seluruh 256 lantai batu altar menjadi EMAS murni!',
    },
    {
      id: 2,
      name: 'Kubah Giok Suci Mega (18x18)',
      width: 18,
      height: 18,
      moves: 52,
      timeSeconds: 260,
      artifact: ARTIFACTS[1],
      isCutout: (r, c) => {
        return (
          (r === 0 && (c < 4 || c > 13)) ||
          (r === 1 && (c < 3 || c > 14)) ||
          (r === 2 && (c < 2 || c > 15)) ||
          (r === 15 && (c < 2 || c > 15)) ||
          (r === 16 && (c < 3 || c > 14)) ||
          (r === 17 && (c < 4 || c > 13))
        );
      },
      isDouble: (r, c) => r >= 6 && r <= 11 && c >= 6 && c <= 11,
      desc: 'Papan 18x18: Sudut kuil terpotong, dan 36 ubin di pusat memiliki dua lapis segel (Perak lalu Emas)!',
    },
    {
      id: 3,
      name: 'Piramida Raksasa Kukulcan (18x18)',
      width: 18,
      height: 18,
      moves: 50,
      timeSeconds: 240,
      artifact: ARTIFACTS[2],
      isCutout: (r, c) => {
        return (
          (r === 0 && (c < 6 || c > 11)) ||
          (r === 1 && (c < 5 || c > 12)) ||
          (r === 2 && (c < 4 || c > 13)) ||
          (r === 16 && (c < 2 || c > 15)) ||
          (r === 17 && (c < 3 || c > 14))
        );
      },
      isDouble: (r, c) => (r >= 5 && r <= 12) && (c === 4 || c === 13),
      desc: 'Bentuk piramida bertingkat Maya kuno 18x18: Ubah lantai teras piramida menjadi emas murni!',
    },
    {
      id: 4,
      name: 'Sumur Keramat Cenote Mega (16x16)',
      width: 16,
      height: 16,
      moves: 48,
      timeSeconds: 220,
      artifact: ARTIFACTS[3],
      isCutout: (r, c) => r >= 6 && r <= 9 && c >= 6 && c <= 9, // Cenote hole in center
      isDouble: (r, c) => (r === 5 || r === 10) && (c >= 5 && c <= 10) || (c === 5 || c === 10) && (r >= 5 && r <= 10),
      desc: 'Sumur air keramat suci di tengah: Lingkari tebing sumur dan jadikan emas murni!',
    },
    {
      id: 5,
      name: 'Kuil Dewa Matahari Inti (18x18)',
      width: 18,
      height: 18,
      moves: 55,
      timeSeconds: 250,
      artifact: ARTIFACTS[4],
      isCutout: (r, c) => (r < 2 && c < 2) || (r < 2 && c > 15) || (r > 15 && c < 2) || (r > 15 && c > 15),
      isDouble: (r, c) => r === c || r + c === 17 || (r >= 7 && r <= 10 && c >= 7 && c <= 10),
      desc: 'Pola sinar matahari melintang: Selesaikan jalur sinar ganda dewa matahari!',
    },
    {
      id: 6,
      name: 'Makam Megah Raja Pakal (18x18)',
      width: 18,
      height: 18,
      moves: 58,
      timeSeconds: 270,
      artifact: ARTIFACTS[5],
      isCutout: (r, c) => false,
      isDouble: (r, c) => (r % 2 === 0 && c % 2 === 0) || (r >= 6 && r <= 11 && c >= 6 && c <= 11),
      desc: 'Kamar pemakaman puncak ekspedisi: Lantai mozaik perak ganda terbesar!',
    },
  ];

  // Gem Type IDs: 1: Gold Lion, 2: Emerald, 3: Sapphire, 4: Ruby, 5: Amethyst, 6: Topaz, 7: Diamond
  const GEM_COUNT = 7;

  // ==========================================================================
  // 3. PERSISTENT STORAGE (Local Storage)
  // ==========================================================================
  const storage = {
    getUnlockedLevel() {
      return parseInt(localStorage.getItem('jq_unlocked_lvl') || '1', 10);
    },
    setUnlockedLevel(lvl) {
      const cur = this.getUnlockedLevel();
      if (lvl > cur) localStorage.setItem('jq_unlocked_lvl', lvl.toString());
    },
    getCollectedRelics() {
      try {
        return JSON.parse(localStorage.getItem('jq_relics') || '[]');
      } catch (e) {
        return [];
      }
    },
    addRelic(id) {
      const relics = this.getCollectedRelics();
      if (!relics.includes(id)) {
        relics.push(id);
        localStorage.setItem('jq_relics', JSON.stringify(relics));
      }
    },
    getHighScores() {
      try {
        return JSON.parse(localStorage.getItem('jq_highscores') || '{}');
      } catch (e) {
        return {};
      }
    },
    saveScore(lvlId, score) {
      const hs = this.getHighScores();
      if (!hs[lvlId] || score > hs[lvlId]) {
        hs[lvlId] = score;
        localStorage.setItem('jq_highscores', JSON.stringify(hs));
      }
    },
  };

  // ==========================================================================
  // 4. GAME STATE
  // ==========================================================================
  let currentLevelIdx = 0;
  let level = LEVELS[0];
  let boardWidth = 16;
  let boardHeight = 16;

  // Grid states:
  // tiles[r][c] = { state: 'empty' | 'stone' | 'silver' | 'gold', required: bool }
  let tiles = [];
  // gems[r][c] = gemTypeId (1-7) or 0 (empty)
  let gems = [];

  let selectedTile = null; // { r, c }
  let movesLeft = 46;
  let score = 0;
  let goldTileCount = 0;
  let totalRequiredTiles = 0;
  let timeRemaining = 240;
  let timerInterval = null;
  let isGameOver = false;
  let isProcessingMatch = false;
  let activeBooster = null; // 'chisel' | 'bomb' | 'lightning'

  let boosterCounts = { chisel: 3, bomb: 2, lightning: 2 };

  // Particles & Animations
  let particles = [];
  let floatingTexts = [];

  // DOM Elements
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const boardContainer = document.getElementById('boardContainer');

  const levelBadge = document.getElementById('levelBadge');
  const levelName = document.getElementById('levelName');
  const goldProgressBar = document.getElementById('goldProgressBar');
  const goldTileCountEl = document.getElementById('goldTileCount');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const movesDisplay = document.getElementById('movesDisplay');
  const timerDisplay = document.getElementById('timerDisplay');
  const relicCrate = document.getElementById('relicCrate');
  const levelObjectiveText = document.getElementById('levelObjectiveText');

  // Modals
  const mapModal = document.getElementById('mapModal');
  const victoryModal = document.getElementById('victoryModal');
  const gameOverModal = document.getElementById('gameOverModal');
  const helpModal = document.getElementById('helpModal');
  const downloadModal = document.getElementById('downloadModal');

  // ==========================================================================
  // 5. MASTERWORK REALISTIC GEMSTONE RENDERING
  // ==========================================================================
  function drawStarGlint(ctx, cx, cy, size) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = Math.max(3, size * 0.7);

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(0.8, size * 0.22), 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, cy, size, size * 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx, cy, size * 0.2, size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 1: Aztec Gold Sun Lion Medallion
  function drawAztecGoldLion(ctx, cx, cy, r) {
    ctx.save();
    const rayCount = 12;
    ctx.fillStyle = '#d97706';
    for (let i = 0; i < rayCount; i++) {
      const ang = (i * Math.PI * 2) / rayCount;
      const x1 = cx + Math.cos(ang - 0.16) * (r * 0.72);
      const y1 = cy + Math.sin(ang - 0.16) * (r * 0.72);
      const x2 = cx + Math.cos(ang) * (r * 1.05);
      const y2 = cy + Math.sin(ang) * (r * 1.05);
      const x3 = cx + Math.cos(ang + 0.16) * (r * 0.72);
      const y3 = cy + Math.sin(ang + 0.16) * (r * 0.72);
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    }

    const rimGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    rimGrad.addColorStop(0, '#fef08a');
    rimGrad.addColorStop(0.3, '#facc15');
    rimGrad.addColorStop(0.65, '#ca8a04');
    rimGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1c1917';
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI * 2) / 16;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * (r * 0.70), cy + Math.sin(ang) * (r * 0.70), Math.max(0.8, r * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }

    const faceGrad = ctx.createLinearGradient(cx - r * 0.4, cy - r * 0.4, cx + r * 0.4, cy + r * 0.4);
    faceGrad.addColorStop(0, '#fef9c3');
    faceGrad.addColorStop(0.5, '#eab308');
    faceGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3a1700';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.18, cy - r * 0.08, r * 0.08, r * 0.05, -0.15, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.18, cy - r * 0.08, r * 0.08, r * 0.05, 0.15, 0, Math.PI * 2);
    ctx.moveTo(cx, cy - r * 0.04);
    ctx.lineTo(cx - r * 0.08, cy + r * 0.12);
    ctx.lineTo(cx + r * 0.08, cy + r * 0.12);
    ctx.rect(cx - r * 0.15, cy + r * 0.18, r * 0.30, r * 0.10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - r * 0.20, cy - r * 0.10, Math.max(0.8, r * 0.035), 0, Math.PI * 2);
    ctx.arc(cx + r * 0.16, cy - r * 0.10, Math.max(0.8, r * 0.035), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.80, Math.PI * 0.85, Math.PI * 1.55);
    ctx.stroke();
    ctx.restore();
  }

  // 2: Colombian Emerald Cut Octagon
  function drawEmeraldCutJade(ctx, cx, cy, r) {
    ctx.save();
    const w = r * 1.55;
    const h = r * 1.95;
    const c = r * 0.42;

    const outerPath = new Path2D();
    outerPath.moveTo(cx - w / 2 + c, cy - h / 2);
    outerPath.lineTo(cx + w / 2 - c, cy - h / 2);
    outerPath.lineTo(cx + w / 2, cy - h / 2 + c);
    outerPath.lineTo(cx + w / 2, cy + h / 2 - c);
    outerPath.lineTo(cx + w / 2 - c, cy + h / 2);
    outerPath.lineTo(cx - w / 2 + c, cy + h / 2);
    outerPath.lineTo(cx - w / 2, cy + h / 2 - c);
    outerPath.lineTo(cx - w / 2, cy - h / 2 + c);
    outerPath.closePath();

    const baseGrad = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
    baseGrad.addColorStop(0, '#34d399');
    baseGrad.addColorStop(0.2, '#10b981');
    baseGrad.addColorStop(0.55, '#059669');
    baseGrad.addColorStop(0.85, '#047857');
    baseGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = baseGrad;
    ctx.fill(outerPath);

    ctx.fillStyle = 'rgba(167, 243, 208, 0.55)';
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 + c, cy - h / 2);
    ctx.lineTo(cx + w / 2 - c, cy - h / 2);
    ctx.lineTo(cx + w / 2 - c * 1.6, cy - h / 2 + c * 0.8);
    ctx.lineTo(cx - w / 2 + c * 1.6, cy - h / 2 + c * 0.8);
    ctx.closePath();
    ctx.fill();

    const tw = w - c * 2.5;
    const th = h - c * 2.2;
    const tableGrad = ctx.createLinearGradient(cx - tw / 2, cy - th / 2, cx + tw / 2, cy + th / 2);
    tableGrad.addColorStop(0, '#6ee7b7');
    tableGrad.addColorStop(0.35, '#10b981');
    tableGrad.addColorStop(0.8, '#059669');
    tableGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = tableGrad;
    ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.stroke(outerPath);
    ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - tw / 2 + 1.5, cy - th / 2 + 1.5, tw * 0.55, Math.max(1.5, r * 0.10));
    drawStarGlint(ctx, cx - tw / 2 + 1, cy - th / 2 + 1, r * 0.35);
    ctx.restore();
  }

  // 3: Royal Blue Sapphire Oval Cabochon
  function drawOvalBlueSapphire(ctx, cx, cy, r) {
    ctx.save();
    const rx = r * 0.90;
    const ry = r * 1.20;

    const grad = ctx.createRadialGradient(cx - rx * 0.35, cy - ry * 0.35, r * 0.05, cx, cy, ry);
    grad.addColorStop(0, '#bfdbfe');
    grad.addColorStop(0.18, '#60a5fa');
    grad.addColorStop(0.48, '#1d4ed8');
    grad.addColorStop(0.82, '#1e3a8a');
    grad.addColorStop(1, '#091124');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Internal refraction caustics glow on lower-right
    const caustics = ctx.createRadialGradient(
      cx + rx * 0.35, cy + ry * 0.40, 0,
      cx + rx * 0.35, cy + ry * 0.40, rx * 0.65
    );
    caustics.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
    caustics.addColorStop(0.6, 'rgba(30, 64, 175, 0.2)');
    caustics.addColorStop(1, 'transparent');
    ctx.fillStyle = caustics;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jewel Quest signature curved glass specular arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = Math.max(1.8, r * 0.14);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.08, cy - ry * 0.08, rx * 0.72, ry * 0.75, 0, Math.PI * 0.88, Math.PI * 1.58);
    ctx.stroke();

    drawStarGlint(ctx, cx - rx * 0.45, cy - ry * 0.50, r * 0.40);
    ctx.restore();
  }

  // 4: Faceted Pigeon-Blood Red Ruby Kite
  function drawFacetedRedRuby(ctx, cx, cy, r) {
    ctx.save();
    const w = r * 1.45;
    const h = r * 1.85;

    const path = new Path2D();
    path.moveTo(cx, cy - h / 2);
    path.lineTo(cx + w / 2, cy);
    path.lineTo(cx, cy + h / 2);
    path.lineTo(cx - w / 2, cy);
    path.closePath();

    const grad = ctx.createRadialGradient(cx - w * 0.25, cy - h * 0.25, 0, cx, cy, h * 0.75);
    grad.addColorStop(0, '#fecdd3');
    grad.addColorStop(0.18, '#f43f5e');
    grad.addColorStop(0.50, '#dc2626');
    grad.addColorStop(0.82, '#991b1b');
    grad.addColorStop(1, '#450a0a');
    ctx.fillStyle = grad;
    ctx.fill(path);

    ctx.fillStyle = 'rgba(254, 202, 202, 0.55)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - h / 2);
    ctx.lineTo(cx - w / 2, cy);
    ctx.lineTo(cx - w * 0.22, cy - h * 0.12);
    ctx.lineTo(cx, cy - h * 0.28);
    ctx.closePath();
    ctx.fill();

    const tw = w * 0.52;
    const th = h * 0.52;
    const tableGrad = ctx.createLinearGradient(cx - tw / 2, cy - th / 2, cx + tw / 2, cy + th / 2);
    tableGrad.addColorStop(0, '#fb7185');
    tableGrad.addColorStop(0.4, '#ef4444');
    tableGrad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = tableGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy - th / 2);
    ctx.lineTo(cx + tw / 2, cy);
    ctx.lineTo(cx, cy + th / 2);
    ctx.lineTo(cx - tw / 2, cy);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.stroke(path);

    drawStarGlint(ctx, cx, cy - th / 2 + 1, r * 0.35);
    ctx.restore();
  }

  // 5: Imperial Velvet Amethyst Cushion
  function drawRoyalAmethyst(ctx, cx, cy, r) {
    ctx.save();
    const w = r * 1.55;
    const h = r * 1.50;
    const cr = r * 0.35;

    const path = new Path2D();
    if (path.roundRect) {
      path.roundRect(cx - w / 2, cy - h / 2, w, h, cr);
    } else {
      path.rect(cx - w / 2, cy - h / 2, w, h);
    }

    const grad = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
    grad.addColorStop(0, '#f3e8ff');
    grad.addColorStop(0.20, '#c084fc');
    grad.addColorStop(0.55, '#9333ea');
    grad.addColorStop(0.85, '#6b21a8');
    grad.addColorStop(1, '#3b0764');
    ctx.fillStyle = grad;
    ctx.fill(path);

    const tw = w * 0.55;
    const th = h * 0.55;
    const tableGrad = ctx.createLinearGradient(cx - tw / 2, cy - th / 2, cx + tw / 2, cy + th / 2);
    tableGrad.addColorStop(0, '#d8b4fe');
    tableGrad.addColorStop(0.4, '#a855f7');
    tableGrad.addColorStop(1, '#7e22ce');
    ctx.fillStyle = tableGrad;
    ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.70)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.stroke(path);
    ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);

    drawStarGlint(ctx, cx - tw / 2 + 1, cy - th / 2 + 1, r * 0.35);
    ctx.restore();
  }

  // 6: Solar Amber Citrine Topaz Hexagon
  function drawSolarAmberTopaz(ctx, cx, cy, r) {
    ctx.save();
    const path = new Path2D();
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3 - Math.PI / 6;
      const px = cx + Math.cos(ang) * (r * 1.20);
      const py = cy + Math.sin(ang) * (r * 1.20);
      if (i === 0) path.moveTo(px, py);
      else path.lineTo(px, py);
    }
    path.closePath();

    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, '#fef9c3');
    grad.addColorStop(0.22, '#fde047');
    grad.addColorStop(0.55, '#f59e0b');
    grad.addColorStop(0.85, '#d97706');
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fill(path);

    const innerPath = new Path2D();
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3 - Math.PI / 6;
      const px = cx + Math.cos(ang) * (r * 0.62);
      const py = cy + Math.sin(ang) * (r * 0.62);
      if (i === 0) innerPath.moveTo(px, py);
      else innerPath.lineTo(px, py);
    }
    innerPath.closePath();

    ctx.fillStyle = '#fbbf24';
    ctx.fill(innerPath);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.stroke(path);
    ctx.stroke(innerPath);

    drawStarGlint(ctx, cx - r * 0.35, cy - r * 0.40, r * 0.35);
    ctx.restore();
  }

  // 7: Flawless Brilliant White Diamond Octagon
  function drawBrilliantWhiteDiamond(ctx, cx, cy, r) {
    ctx.save();
    const path = new Path2D();
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const px = cx + Math.cos(ang) * (r * 1.15);
      const py = cy + Math.sin(ang) * (r * 1.15);
      if (i === 0) path.moveTo(px, py);
      else path.lineTo(px, py);
    }
    path.closePath();

    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.20, '#f8fafc');
    grad.addColorStop(0.50, '#e2e8f0');
    grad.addColorStop(0.80, '#94a3b8');
    grad.addColorStop(1, '#475569');
    ctx.fillStyle = grad;
    ctx.fill(path);

    const innerOct = new Path2D();
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4 + Math.PI / 8;
      const px = cx + Math.cos(ang) * (r * 0.54);
      const py = cy + Math.sin(ang) * (r * 0.54);
      if (i === 0) innerOct.moveTo(px, py);
      else innerOct.lineTo(px, py);
    }
    innerOct.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill(innerOct);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.stroke(path);
    ctx.stroke(innerOct);

    drawStarGlint(ctx, cx - r * 0.28, cy - r * 0.28, r * 0.50);
    ctx.restore();
  }

  function drawGem(ctx, type, cx, cy, r) {
    switch (type) {
      case 1: drawAztecGoldLion(ctx, cx, cy, r); break;
      case 2: drawEmeraldCutJade(ctx, cx, cy, r); break;
      case 3: drawOvalBlueSapphire(ctx, cx, cy, r); break;
      case 4: drawFacetedRedRuby(ctx, cx, cy, r); break;
      case 5: drawRoyalAmethyst(ctx, cx, cy, r); break;
      case 6: drawSolarAmberTopaz(ctx, cx, cy, r); break;
      case 7: drawBrilliantWhiteDiamond(ctx, cx, cy, r); break;
      default: break;
    }
  }

  // ==========================================================================
  // 6. BOARD SIZING & TILE DRAWING
  // ==========================================================================
  function getTileDimensions() {
    const wrap = boardContainer.querySelector('.canvas-wrapper');
    const maxW = Math.max(260, window.innerWidth - 560);
    const maxH = Math.max(260, window.innerHeight - 180);
    const avail = Math.min(Math.min(maxW, maxH), 720);
    const maxDim = Math.max(boardWidth, boardHeight);
    const tileSize = Math.floor(avail / maxDim);
    return {
      tileSize: Math.max(20, tileSize),
      width: tileSize * boardWidth,
      height: tileSize * boardHeight,
    };
  }

  function updateCanvasSize() {
    const { tileSize, width, height } = getTileDimensions();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }

  // Draw ancient stone tile with Maya glyphs or Gold Plate
  function drawTile(ctx, r, c, tileState, x, y, size, isSelected) {
    if (tileState === 'empty') return;

    ctx.save();
    // Base tile borders
    if (tileState === 'gold') {
      // Shimmering Aztec Gold Plaque
      const goldGrad = ctx.createLinearGradient(x, y, x + size, y + size);
      goldGrad.addColorStop(0, '#fef08a');
      goldGrad.addColorStop(0.25, '#fbbf24');
      goldGrad.addColorStop(0.65, '#d97706');
      goldGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

      // Gold engraved hieroglyph border
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);

      // Inner hieroglyphic sun glyph
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.28, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tileState === 'silver') {
      // Chiseled Aztec Silver Plate
      const silGrad = ctx.createLinearGradient(x, y, x + size, y + size);
      silGrad.addColorStop(0, '#f1f5f9');
      silGrad.addColorStop(0.35, '#cbd5e1');
      silGrad.addColorStop(0.7, '#94a3b8');
      silGrad.addColorStop(1, '#475569');
      ctx.fillStyle = silGrad;
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    } else {
      // Ancient Weathered Stone Tile
      const stoneGrad = ctx.createLinearGradient(x, y, x + size, y + size);
      stoneGrad.addColorStop(0, '#382e27');
      stoneGrad.addColorStop(0.5, '#261f1a');
      stoneGrad.addColorStop(1, '#1a1411');
      ctx.fillStyle = stoneGrad;
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

      ctx.strokeStyle = '#4a3b30';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);
    }

    // Tile selection glow outline
    if (isSelected) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }

    ctx.restore();
  }

  // ==========================================================================
  // 7. LEVEL GENERATION & MATCH LOGIC
  // ==========================================================================
  function initLevel(lvlIdx) {
    currentLevelIdx = lvlIdx;
    level = LEVELS[lvlIdx];
    boardWidth = level.width;
    boardHeight = level.height;
    movesLeft = level.moves;
    timeRemaining = level.timeSeconds;
    score = 0;
    goldTileCount = 0;
    totalRequiredTiles = 0;
    selectedTile = null;
    isGameOver = false;
    isProcessingMatch = false;
    activeBooster = null;
    particles = [];
    floatingTexts = [];

    // Initialize tile map
    tiles = [];
    gems = [];
    for (let r = 0; r < boardHeight; r++) {
      tiles[r] = [];
      gems[r] = [];
      for (let c = 0; c < boardWidth; c++) {
        if (level.isCutout(r, c)) {
          tiles[r][c] = { state: 'empty', required: false };
          gems[r][c] = 0;
        } else {
          const isDouble = level.isDouble(r, c);
          tiles[r][c] = {
            state: isDouble ? 'silver' : 'stone',
            required: true,
          };
          totalRequiredTiles++;
          gems[r][c] = 0; // populated below
        }
      }
    }

    // Seed gems without initial 3-matches
    for (let r = 0; r < boardHeight; r++) {
      for (let c = 0; c < boardWidth; c++) {
        if (tiles[r][c].state === 'empty') continue;
        let type;
        let attempts = 0;
        do {
          type = Math.floor(Math.random() * GEM_COUNT) + 1;
          attempts++;
        } while (attempts < 20 && createsMatch(r, c, type));
        gems[r][c] = type;
      }
    }

    updateHUD();
    updateCanvasSize();
    renderRelicCrate();

    // Start timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isGameOver && timeRemaining > 0) {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
          handleGameOver();
        }
      }
    }, 1000);
  }

  function createsMatch(r, c, type) {
    // Check horizontal
    if (c >= 2 && gems[r][c - 1] === type && gems[r][c - 2] === type) return true;
    // Check vertical
    if (r >= 2 && gems[r - 1][c] === type && gems[r - 2][c] === type) return true;
    return false;
  }

  function findMatches() {
    const matched = new Set();

    // Horizontal check
    for (let r = 0; r < boardHeight; r++) {
      let runStart = 0;
      for (let c = 0; c <= boardWidth; c++) {
        const val = c < boardWidth ? gems[r][c] : 0;
        const prevVal = gems[r][runStart] || 0;
        if (val !== prevVal || val === 0) {
          const runLen = c - runStart;
          if (runLen >= 3 && prevVal > 0) {
            for (let k = runStart; k < c; k++) {
              matched.add(`${r},${k}`);
            }
          }
          runStart = c;
        }
      }
    }

    // Vertical check
    for (let c = 0; c < boardWidth; c++) {
      let runStart = 0;
      for (let r = 0; r <= boardHeight; r++) {
        const val = r < boardHeight ? gems[r][c] : 0;
        const prevVal = gems[runStart] ? gems[runStart][c] : 0;
        if (val !== prevVal || val === 0) {
          const runLen = r - runStart;
          if (runLen >= 3 && prevVal > 0) {
            for (let k = runStart; k < r; k++) {
              matched.add(`${k},${c}`);
            }
          }
          runStart = r;
        }
      }
    }

    const res = [];
    matched.forEach((str) => {
      const [r, c] = str.split(',').map(Number);
      res.push({ r, c });
    });
    return res;
  }

  // Handle tile transmutation into solid Gold / Silver
  function transmuteTiles(coords) {
    let turnedGoldCount = 0;
    coords.forEach(({ r, c }) => {
      const t = tiles[r][c];
      if (t.state === 'stone') {
        t.state = 'gold';
        goldTileCount++;
        turnedGoldCount++;
        spawnGoldSparks(r, c);
      } else if (t.state === 'silver') {
        t.state = 'gold';
        goldTileCount++;
        turnedGoldCount++;
        spawnGoldSparks(r, c);
        audio.playSilverChime();
      }
    });

    if (turnedGoldCount > 0) {
      audio.playGoldGong();
    }
  }

  function spawnGoldSparks(r, c) {
    const { tileSize } = getTileDimensions();
    const cx = c * tileSize + tileSize / 2;
    const cy = r * tileSize + tileSize / 2;
    for (let i = 0; i < 8; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.5,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.02,
        color: Math.random() > 0.4 ? '#fbbf24' : '#ffffff',
        size: 3 + Math.random() * 3,
      });
    }
  }

  // Gravity cascade & refill
  async function applyGravityAndCascade(combo = 1) {
    let hasMatches = true;

    while (hasMatches) {
      const matches = findMatches();
      if (matches.length === 0) break;

      audio.playMatch(combo);
      score += matches.length * 100 * combo;

      // Add floating score text
      const first = matches[0];
      const { tileSize } = getTileDimensions();
      floatingTexts.push({
        text: `+${matches.length * 100 * combo}`,
        x: first.c * tileSize + tileSize / 2,
        y: first.r * tileSize + tileSize / 2,
        life: 1.0,
      });

      // Transmute tiles to pure gold!
      transmuteTiles(matches);

      // Clear matched gems
      matches.forEach(({ r, c }) => {
        gems[r][c] = 0;
      });

      updateHUD();

      // Check win condition early
      if (goldTileCount >= totalRequiredTiles) {
        handleVictory();
        return;
      }

      await waitMs(180);

      // Apply vertical gravity per column
      for (let c = 0; c < boardWidth; c++) {
        for (let r = boardHeight - 1; r >= 0; r--) {
          if (tiles[r][c].state === 'empty' || gems[r][c] !== 0) continue;

          // Find gem above to drop down
          let aboveRow = -1;
          for (let k = r - 1; k >= 0; k--) {
            if (tiles[k][c].state !== 'empty' && gems[k][c] !== 0) {
              aboveRow = k;
              break;
            }
          }

          if (aboveRow !== -1) {
            gems[r][c] = gems[aboveRow][c];
            gems[aboveRow][c] = 0;
          } else {
            // Spawn new gem from above
            gems[r][c] = Math.floor(Math.random() * GEM_COUNT) + 1;
          }
        }
      }

      await waitMs(150);
      combo++;
    }
  }

  function waitMs(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // ==========================================================================
  // 8. INTERACTION HANDLERS (Click, Drag, Booster)
  // ==========================================================================
  async function handleTileSelect(r, c) {
    if (isGameOver || isProcessingMatch) return;
    if (tiles[r][c].state === 'empty') return;

    // Handle Active Booster
    if (activeBooster) {
      handleBoosterAction(r, c);
      return;
    }

    if (!selectedTile) {
      selectedTile = { r, c };
      audio.playStoneScrape();
    } else {
      const dr = Math.abs(selectedTile.r - r);
      const dc = Math.abs(selectedTile.c - c);

      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        // Adjacent tile: Swap!
        const r1 = selectedTile.r;
        const c1 = selectedTile.c;
        const r2 = r;
        const c2 = c;
        selectedTile = null;

        await executeSwap(r1, c1, r2, c2);
      } else {
        // Deselect or select new tile
        selectedTile = { r, c };
        audio.playStoneScrape();
      }
    }
  }

  async function executeSwap(r1, c1, r2, c2) {
    isProcessingMatch = true;
    audio.playStoneScrape();

    // Perform swap
    const temp = gems[r1][c1];
    gems[r1][c1] = gems[r2][c2];
    gems[r2][c2] = temp;

    const matches = findMatches();
    if (matches.length > 0) {
      // Valid move!
      movesLeft--;
      updateHUD();
      await applyGravityAndCascade(1);

      if (movesLeft <= 0 && goldTileCount < totalRequiredTiles) {
        handleGameOver();
      }
    } else {
      // Invalid move: Revert swap
      await waitMs(160);
      gems[r2][c2] = gems[r1][c1];
      gems[r1][c1] = temp;
      audio.playStoneScrape();
    }

    isProcessingMatch = false;
  }

  function handleBoosterAction(r, c) {
    if (activeBooster === 'chisel') {
      if (boosterCounts.chisel > 0) {
        boosterCounts.chisel--;
        document.getElementById('countChisel').textContent = boosterCounts.chisel;
        transmuteTiles([{ r, c }]);
        gems[r][c] = 0;
        applyGravityAndCascade(1);
      }
    } else if (activeBooster === 'bomb') {
      if (boosterCounts.bomb > 0) {
        boosterCounts.bomb--;
        document.getElementById('countBomb').textContent = boosterCounts.bomb;
        const targets = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < boardHeight && nc >= 0 && nc < boardWidth && tiles[nr][nc].state !== 'empty') {
              targets.push({ r: nr, c: nc });
              gems[nr][nc] = 0;
            }
          }
        }
        transmuteTiles(targets);
        applyGravityAndCascade(1);
      }
    } else if (activeBooster === 'lightning') {
      if (boosterCounts.lightning > 0) {
        boosterCounts.lightning--;
        document.getElementById('countLightning').textContent = boosterCounts.lightning;
        const targetType = gems[r][c];
        const targets = [];
        for (let row = 0; row < boardHeight; row++) {
          for (let col = 0; col < boardWidth; col++) {
            if (gems[row][col] === targetType) {
              targets.push({ r: row, c: col });
              gems[row][col] = 0;
            }
          }
        }
        transmuteTiles(targets);
        applyGravityAndCascade(1);
      }
    }

    activeBooster = null;
    document.querySelectorAll('.booster-btn').forEach((btn) => btn.classList.remove('active'));
    updateHUD();
  }

  // Shuffle board if no matches possible
  function shuffleBoard() {
    if (isProcessingMatch || isGameOver) return;
    const activeGems = [];
    for (let r = 0; r < boardHeight; r++) {
      for (let c = 0; c < boardWidth; c++) {
        if (tiles[r][c].state !== 'empty') {
          activeGems.push(gems[r][c]);
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = activeGems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = activeGems[i];
      activeGems[i] = activeGems[j];
      activeGems[j] = t;
    }

    let idx = 0;
    for (let r = 0; r < boardHeight; r++) {
      for (let c = 0; c < boardWidth; c++) {
        if (tiles[r][c].state !== 'empty') {
          gems[r][c] = activeGems[idx++];
        }
      }
    }
    audio.playStoneScrape();
    applyGravityAndCascade(1);
  }

  // ==========================================================================
  // 9. VICTORY, GAME OVER & HUD
  // ==========================================================================
  function handleVictory() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    audio.playVictory();

    storage.setUnlockedLevel(currentLevelIdx + 2);
    storage.addRelic(level.artifact.id);
    storage.saveScore(level.id, score);

    document.getElementById('victoryTitle').textContent = `${level.name} Selesai!`;
    document.getElementById('victoryFinalScore').textContent = score.toLocaleString();
    document.getElementById('victoryRemainingMoves').textContent = `${movesLeft} langkah`;
    document.getElementById('victoryReward').textContent = `+${300 + currentLevelIdx * 50} Koin`;

    const art = level.artifact;
    document.getElementById('relicFoundIcon').textContent = art.icon;
    document.getElementById('relicFoundName').textContent = art.name;
    document.getElementById('relicFoundDesc').textContent = art.desc;

    victoryModal.classList.add('active');
    renderRelicCrate();
  }

  function handleGameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('gameOverGold').textContent = `${goldTileCount} / ${totalRequiredTiles}`;
    document.getElementById('gameOverScore').textContent = score.toLocaleString();
    gameOverModal.classList.add('active');
  }

  function updateHUD() {
    levelBadge.textContent = `LEVEL ${level.id}`;
    levelName.textContent = level.name;

    const pct = totalRequiredTiles > 0 ? Math.min(100, Math.floor((goldTileCount / totalRequiredTiles) * 100)) : 0;
    goldProgressBar.style.width = pct + '%';
    goldTileCountEl.textContent = `${goldTileCount} / ${totalRequiredTiles}`;

    scoreDisplay.textContent = score.toLocaleString();
    movesDisplay.textContent = movesLeft.toString();
    levelObjectiveText.textContent = level.desc;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function renderRelicCrate() {
    const unlocked = storage.getCollectedRelics();
    relicCrate.innerHTML = '';

    ARTIFACTS.forEach((art) => {
      const isOwned = unlocked.includes(art.id);
      const slot = document.createElement('div');
      slot.className = `relic-slot ${isOwned ? 'unlocked' : 'locked'}`;
      slot.innerHTML = `
        <span class="r-icon">${isOwned ? art.icon : '🔒'}</span>
        <span class="r-name">${isOwned ? art.name : 'Terkunci'}</span>
      `;
      slot.title = isOwned ? art.desc : 'Taklukkan kuil untuk mengungkap artefak kuno ini.';
      relicCrate.appendChild(slot);
    });
  }

  function renderWorldMap() {
    const grid = document.getElementById('levelGrid');
    const unlockedLvl = storage.getUnlockedLevel();
    const highScores = storage.getHighScores();
    grid.innerHTML = '';

    LEVELS.forEach((lvl, idx) => {
      const isUnlocked = idx + 1 <= unlockedLvl;
      const card = document.createElement('div');
      card.className = `level-card ${idx === currentLevelIdx ? 'active' : ''}`;
      card.style.opacity = isUnlocked ? '1' : '0.5';

      card.innerHTML = `
        <div class="card-top">
          <span class="card-num">KAMAR ${lvl.id} ${isUnlocked ? '🔓' : '🔒'}</span>
          <span class="card-size">${lvl.width}x${lvl.height}</span>
        </div>
        <div class="card-name">${lvl.name}</div>
        <div class="card-desc">${lvl.desc}</div>
        ${highScores[lvl.id] ? `<div style="font-size:10px; color:#fbbf24; margin-top:4px;">Skor Terbaik: ${highScores[lvl.id].toLocaleString()}</div>` : ''}
      `;

      if (isUnlocked) {
        card.onclick = () => {
          mapModal.classList.remove('active');
          initLevel(idx);
        };
      }
      grid.appendChild(card);
    });
  }

  // ==========================================================================
  // 10. MAIN 60FPS CANVAS RENDERING LOOP
  // ==========================================================================
  function render(time) {
    const { tileSize, width, height } = getTileDimensions();
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Board Tiles (Stone, Silver, Aztec Gold)
    for (let r = 0; r < boardHeight; r++) {
      for (let c = 0; c < boardWidth; c++) {
        const t = tiles[r][c];
        const x = c * tileSize;
        const y = r * tileSize;
        const isSelected = selectedTile && selectedTile.r === r && selectedTile.c === c;
        drawTile(ctx, r, c, t.state, x, y, tileSize, isSelected);
      }
    }

    // 2. Draw 3D Masterwork Gemstones
    const gemRadius = tileSize * 0.38;
    for (let r = 0; r < boardHeight; r++) {
      for (let c = 0; c < boardWidth; c++) {
        const gemType = gems[r][c];
        if (gemType > 0 && tiles[r][c].state !== 'empty') {
          const cx = c * tileSize + tileSize / 2;
          const cy = r * tileSize + tileSize / 2;
          drawGem(ctx, gemType, cx, cy, gemRadius);
        }
      }
    }

    // 3. Render Shimmering Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Render Floating Combo Scores
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.8;
      ft.life -= 0.02;
      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = ft.life;
      ctx.font = 'bold 15px "Cinzel", Georgia, serif';
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(render);
  }

  // ==========================================================================
  // 11. EVENT LISTENERS
  // ==========================================================================
  let isPointerDown = false;
  let pointerStartTile = null;

  function getTileFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { tileSize } = getTileDimensions();
    const c = Math.floor(x / tileSize);
    const r = Math.floor(y / tileSize);
    if (r >= 0 && r < boardHeight && c >= 0 && c < boardWidth) {
      return { r, c };
    }
    return null;
  }

  canvas.addEventListener('mousedown', (e) => {
    const tile = getTileFromEvent(e);
    if (tile) {
      isPointerDown = true;
      pointerStartTile = tile;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const tile = getTileFromEvent(e);
    if (tile && pointerStartTile) {
      if (tile.r === pointerStartTile.r && tile.c === pointerStartTile.c) {
        handleTileSelect(tile.r, tile.c);
      } else {
        const dr = Math.abs(tile.r - pointerStartTile.r);
        const dc = Math.abs(tile.c - pointerStartTile.c);
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
          executeSwap(pointerStartTile.r, pointerStartTile.c, tile.r, tile.c);
          selectedTile = null;
        }
      }
    }
    pointerStartTile = null;
  });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const tile = getTileFromEvent(e);
    if (tile) {
      isPointerDown = true;
      pointerStartTile = tile;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (pointerStartTile) {
      handleTileSelect(pointerStartTile.r, pointerStartTile.c);
    }
    pointerStartTile = null;
  });

  window.addEventListener('resize', () => {
    updateCanvasSize();
  });

  // Header Nav & Buttons
  document.getElementById('btnMap').onclick = () => {
    renderWorldMap();
    mapModal.classList.add('active');
  };
  document.getElementById('closeMap').onclick = () => mapModal.classList.remove('active');

  document.getElementById('btnAudio').onclick = (e) => {
    audio.enabled = !audio.enabled;
    e.currentTarget.textContent = audio.enabled ? '🔊 FX' : '🔇 FX';
    if (audio.enabled) audio.playGoldGong();
  };

  document.getElementById('btnHelp').onclick = () => helpModal.classList.add('active');
  document.getElementById('closeHelp').onclick = () => helpModal.classList.remove('active');
  document.getElementById('btnGotIt').onclick = () => helpModal.classList.remove('active');

  document.getElementById('btnDownloadSelf').onclick = () => downloadModal.classList.add('active');
  document.getElementById('closeDownload').onclick = () => downloadModal.classList.remove('active');

  // Booster buttons
  const setupBooster = (id, type) => {
    const el = document.getElementById(id);
    el.onclick = () => {
      if (activeBooster === type) {
        activeBooster = null;
        el.classList.remove('active');
      } else {
        document.querySelectorAll('.booster-btn').forEach((b) => b.classList.remove('active'));
        activeBooster = type;
        el.classList.add('active');
      }
    };
  };

  setupBooster('boosterChisel', 'chisel');
  setupBooster('boosterBomb', 'bomb');
  setupBooster('boosterLightning', 'lightning');
  document.getElementById('boosterShuffle').onclick = () => shuffleBoard();

  // Victory / Game Over buttons
  document.getElementById('btnNextLevel').onclick = () => {
    victoryModal.classList.remove('active');
    if (currentLevelIdx < LEVELS.length - 1) {
      initLevel(currentLevelIdx + 1);
    } else {
      initLevel(0);
    }
  };

  document.getElementById('btnReplay').onclick = () => {
    victoryModal.classList.remove('active');
    initLevel(currentLevelIdx);
  };

  document.getElementById('btnTryAgain').onclick = () => {
    gameOverModal.classList.remove('active');
    initLevel(currentLevelIdx);
  };

  document.getElementById('btnGiveUpMap').onclick = () => {
    gameOverModal.classList.remove('active');
    renderWorldMap();
    mapModal.classList.add('active');
  };

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });

  // ==========================================================================
  // 12. INITIALIZATION
  // ==========================================================================
  initLevel(0);
  requestAnimationFrame(render);

})();
