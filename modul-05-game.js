window.OUTRUN_STARTER_CODE = String.raw`const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = 800;
const H = 600;
const SEGMENT_LENGTH = 200;
const TOTAL_SEGMENTS = 1800;
const TRACK_LENGTH = TOTAL_SEGMENTS * SEGMENT_LENGTH;
const DRAW_DISTANCE = 240;
const MAX_SPEED = SEGMENT_LENGTH * 80;
const ACCEL = MAX_SPEED / 4.5;
const BRAKE = -MAX_SPEED * 1.5;
const DECEL = -MAX_SPEED / 5;

let state = 'title';
let speed = 0;
let playerX = 0;
let steering = 0;
let position = 0;
let score = 0;
let timeLeft = 90;
let shake = 0;
let flash = 0;
let lastTime = performance.now();
let segments = [];
let traffic = [];
const keys = { left: false, right: false, accelerate: false, brake: false };

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
}

window.addEventListener('resize', resizeCanvas);

function buildTrack() {
  segments = [];
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    let curve = 0;
    let hill = 0;
    if (i > 90 && i < 270) curve = 0.8;
    if (i > 330 && i < 500) curve = -1.05;
    if (i > 570 && i < 820) curve = 0.72;
    if (i > 850 && i < 1080) curve = -0.9;
    if (i > 1190 && i < 1400) curve = 1.15;
    if (i > 250 && i < 410) hill = Math.sin((i - 250) / 160 * Math.PI) * 500;
    if (i > 680 && i < 920) hill = Math.sin((i - 680) / 240 * Math.PI) * 850;
    if (i > 1250 && i < 1500) hill = Math.sin((i - 1250) / 250 * Math.PI) * 650;
    segments.push({
      index: i,
      curve,
      elevation: hill,
      color: Math.floor(i / 3) % 2,
      props: i % 84 === 0 ? 'sign' : (i % 28 === 0 ? 'palm' : '')
    });
  }
}

function resetGame() {
  state = 'playing';
  speed = 0;
  playerX = 0;
  steering = 0;
  position = 0;
  score = 0;
  timeLeft = 90;
  shake = 0;
  flash = 0;
  traffic = [];
  for (let i = 0; i < 22; i++) {
    traffic.push({
      z: (i * 13700 + 9000) % (TOTAL_SEGMENTS * SEGMENT_LENGTH),
      lane: (Math.random() * 1.5) - 0.75,
      speed: MAX_SPEED * (0.28 + Math.random() * 0.3),
      color: ['#ffcc33', '#33d6ff', '#fa4c73', '#a7f05a'][i % 4]
    });
  }
}

function findSegment(z) {
  return segments[Math.floor(z / SEGMENT_LENGTH) % TOTAL_SEGMENTS];
}

function distanceAhead(z) {
  return (z - position + TRACK_LENGTH) % TRACK_LENGTH;
}

function polygon(points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function drawMountains(horizon) {
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#252556');
  sky.addColorStop(0.55, '#b94f86');
  sky.addColorStop(1, '#f49a79');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizon);
  const sun = ctx.createRadialGradient(610, 150, 16, 610, 150, 130);
  sun.addColorStop(0, '#fff6bb');
  sun.addColorStop(0.45, '#ffc45e');
  sun.addColorStop(1, 'rgba(255, 119, 95, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(450, 0, 320, 300);
  ctx.fillStyle = '#ffd77d';
  ctx.beginPath();
  ctx.arc(610, 150, 49, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbbf69';
  for (let y = 160; y < 194; y += 8) ctx.fillRect(563, y, 94, 3);

  const ridge = (peaks, color) => {
    const points = [[0, horizon]];
    for (const peak of peaks) points.push(peak);
    points.push([W, horizon]);
    polygon(points, color);
  };
  ridge([[0,205],[46,190],[87,202],[132,174],[174,199],[229,158],[273,194],[318,180],[362,205],[413,166],[461,196],[514,151],[559,192],[612,168],[661,204],[714,177],[756,197],[800,183]], '#78608d');
  ridge([[0,217],[55,203],[101,215],[151,185],[190,210],[238,168],[281,209],[333,188],[376,217],[425,180],[468,211],[523,164],[571,205],[619,178],[666,213],[719,190],[764,207],[800,198]], '#554f7b');
  ridge([[0,225],[0,216],[73,212],[127,220],[185,202],[244,218],[300,208],[358,226],[415,207],[473,220],[528,202],[590,222],[646,207],[706,222],[755,208],[800,218]], '#35466c');
  polygon([[204,185],[229,158],[246,176],[238,171],[229,166],[222,177],[216,172]], '#ddd2cf');
  polygon([[496,181],[514,151],[534,177],[526,171],[515,160],[508,174],[503,169]], '#e5d5cb');
  polygon([[401,188],[413,166],[430,186],[423,179],[414,173],[409,184]], '#d5cedb');
  ctx.fillStyle = 'rgba(249, 177, 153, .32)';
  ctx.fillRect(0, horizon - 4, W, 8);
}

function drawPalm(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(20, 28, 46, .35)';
  ctx.beginPath();
  ctx.ellipse(8, 1, 31, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#563847';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-17, -47, 2, -111);
  ctx.stroke();
  ctx.strokeStyle = '#ba7252';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-17, -47, 2, -111);
  ctx.stroke();
  const fronds = [[-2.55,82],[-2.08,96],[-1.62,104],[-1.16,99],[-0.72,88],[-0.25,78],[0.18,85],[0.58,99],[1.02,100],[1.48,89],[1.92,77],[2.42,86]];
  for (let i = 0; i < fronds.length; i++) {
    const [angle, length] = fronds[i];
    ctx.save();
    ctx.translate(2, -111);
    ctx.rotate(angle);
    ctx.strokeStyle = i % 3 === 0 ? '#0d654f' : '#138b5c';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.48, -11, length, 10);
    ctx.stroke();
    ctx.strokeStyle = '#31bd70';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.quadraticCurveTo(length * 0.48, -12, length, 9);
    ctx.stroke();
    for (let leaf = 1; leaf <= 7; leaf++) {
      const t = leaf / 8;
      const lx = length * t;
      const ly = -8 * Math.sin(t * Math.PI) + 8 * t;
      const leafLength = 13 * Math.sin(t * Math.PI) + 3;
      ctx.strokeStyle = leaf % 2 ? '#18a967' : '#43ce76';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - leafLength * 0.35, ly + leafLength);
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + leafLength * 0.35, ly + leafLength);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.fillStyle = '#ffd074';
  ctx.beginPath();
  ctx.arc(2, -111, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSign(x, y, scale, index) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const brands = [
    { title: 'SUNSET', detail: 'DRIVE IN', color: '#ff5aab' },
    { title: 'TURBO', detail: 'GAS  99', color: '#47e6f4' },
    { title: 'ARCADE', detail: 'NEXT EXIT', color: '#ffd45c' }
  ];
  const brand = brands[Math.floor(index / 42) % brands.length];
  ctx.fillStyle = 'rgba(14, 18, 42, .35)';
  ctx.beginPath();
  ctx.ellipse(4, 1, 28, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#52404a';
  ctx.fillRect(-19, -56, 8, 57);
  ctx.fillRect(11, -56, 8, 57);
  ctx.fillStyle = '#9b6653';
  ctx.fillRect(-16, -52, 3, 48);
  ctx.fillRect(14, -52, 3, 48);
  ctx.shadowColor = brand.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#171a38';
  ctx.fillRect(-57, -112, 114, 59);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = brand.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(-57, -112, 114, 59);
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  ctx.fillRect(-52, -107, 104, 49);
  ctx.fillStyle = brand.color;
  ctx.font = '900 21px Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(brand.title, 0, -91);
  ctx.fillStyle = '#fff2cb';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(brand.detail, 0, -69);
  ctx.fillStyle = '#ffe9a5';
  ctx.fillRect(-42, -58, 6, 2);
  ctx.fillRect(36, -58, 6, 2);
  ctx.restore();
}

function drawCar(x, y, scale, color, player) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.beginPath();
  ctx.ellipse(0, 3, player ? 67 : 58, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  if (player) {
    // Broad rear tires and dark underbody ground the car in the road.
    ctx.fillStyle = '#11131b';
    ctx.fillRect(-58, -28, 17, 31);
    ctx.fillRect(41, -28, 17, 31);
    ctx.fillStyle = '#343440';
    ctx.fillRect(-54, -25, 5, 23);
    ctx.fillRect(49, -25, 5, 23);
    ctx.fillStyle = '#1c2230';
    ctx.fillRect(-48, -17, 96, 20);
    ctx.fillStyle = '#9aa5b7';
    ctx.fillRect(-37, -1, 13, 5);
    ctx.fillRect(24, -1, 13, 5);

    // Rear body, wheel arches and the characteristic wide Testarossa tail.
    polygon([[-54,-18],[-51,-50],[-43,-63],[-34,-67],[34,-67],[43,-63],[51,-50],[54,-18],[46,-10],[-46,-10]], '#a91635');
    polygon([[-51,-22],[-46,-49],[-38,-60],[-29,-63],[29,-63],[38,-60],[46,-49],[51,-22],[43,-16],[-43,-16]], '#ed3158');
    polygon([[-45,-45],[-36,-57],[-27,-61],[27,-61],[36,-57],[45,-45],[34,-42],[-34,-42]], '#ff6173');
    ctx.fillStyle = '#ff8b87';
    ctx.fillRect(-39, -55, 16, 3);
    ctx.fillRect(23, -55, 16, 3);

    // Rear window with dark glass and small driver silhouettes.
    polygon([[-30,-61],[-22,-80],[22,-80],[30,-61],[23,-57],[-23,-57]], '#201f39');
    polygon([[-25,-62],[-19,-76],[19,-76],[25,-62],[20,-60],[-20,-60]], '#394966');
    ctx.fillStyle = '#f5c6c0';
    ctx.fillRect(-12, -70, 7, 9);
    ctx.fillRect(5, -70, 7, 9);
    ctx.fillStyle = '#251d2c';
    ctx.fillRect(-13, -73, 8, 4);
    ctx.fillRect(4, -73, 8, 4);
    ctx.fillStyle = '#f4b84e';
    ctx.fillRect(7, -68, 4, 3);

    // Rear grille, slats and bright arcade tail lamps.
    ctx.fillStyle = '#171923';
    ctx.fillRect(-39, -40, 78, 20);
    ctx.fillStyle = '#333340';
    for (let line = 0; line < 5; line++) ctx.fillRect(-37, -38 + line * 3, 74, 1);
    ctx.fillStyle = '#ff293f';
    ctx.fillRect(-47, -43, 14, 17);
    ctx.fillRect(33, -43, 14, 17);
    ctx.fillStyle = '#ff9a70';
    ctx.fillRect(-45, -41, 10, 4);
    ctx.fillRect(35, -41, 10, 4);
    ctx.fillStyle = '#ffdc7a';
    ctx.fillRect(-45, -31, 10, 3);
    ctx.fillRect(35, -31, 10, 3);
    ctx.fillStyle = '#d9e6ed';
    ctx.fillRect(-25, -14, 12, 3);
    ctx.fillRect(13, -14, 12, 3);

    // Center plate and low rear spoiler.
    ctx.fillStyle = '#29273a';
    ctx.fillRect(-49, -53, 5, 3);
    ctx.fillRect(44, -53, 5, 3);
    ctx.fillStyle = '#f4ead0';
    ctx.fillRect(-12, -18, 24, 9);
    ctx.fillStyle = '#25273a';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1986', 0, -13);
    ctx.fillStyle = '#171923';
    ctx.fillRect(-50, -66, 100, 3);
    ctx.fillRect(-43, -70, 86, 4);
    ctx.fillStyle = '#f04b66';
    ctx.fillRect(-47, -70, 9, 2);
    ctx.fillRect(38, -70, 9, 2);
    ctx.restore();
    return;
  }

  const trim = {
    '#ffcc33': { dark: '#a95627', light: '#ffe58a', glass: '#31506a' },
    '#33d6ff': { dark: '#126c9b', light: '#a8f4ff', glass: '#1e3c68' },
    '#fa4c73': { dark: '#992b62', light: '#ff9aab', glass: '#38264f' },
    '#a7f05a': { dark: '#41804b', light: '#deff9c', glass: '#244655' }
  }[color] || { dark: '#34415d', light: '#d9f4ff', glass: '#29374c' };

  ctx.fillStyle = '#15151e';
  ctx.fillRect(-47, -25, 14, 28);
  ctx.fillRect(33, -25, 14, 28);
  ctx.fillStyle = '#454653';
  ctx.fillRect(-43, -22, 4, 21);
  ctx.fillRect(39, -22, 4, 21);
  ctx.fillStyle = '#202430';
  ctx.fillRect(-44, -12, 88, 15);
  polygon([[-49,-13],[-46,-40],[-38,-54],[-27,-60],[27,-60],[38,-54],[46,-40],[49,-13],[40,-7],[-40,-7]], trim.dark);
  polygon([[-45,-17],[-42,-41],[-35,-52],[-25,-56],[25,-56],[35,-52],[42,-41],[45,-17],[38,-12],[-38,-12]], color);
  polygon([[-39,-43],[-32,-51],[-24,-54],[24,-54],[32,-51],[39,-43],[29,-40],[-29,-40]], trim.light);
  polygon([[-28,-54],[-20,-70],[20,-70],[28,-54],[22,-50],[-22,-50]], '#172039');
  polygon([[-23,-55],[-17,-66],[17,-66],[23,-55],[19,-53],[-19,-53]], trim.glass);
  ctx.fillStyle = '#d8bdac';
  ctx.fillRect(-10, -62, 6, 7);
  ctx.fillRect(4, -62, 6, 7);
  ctx.fillStyle = '#1a1a29';
  ctx.fillRect(-11, -65, 8, 3);
  ctx.fillRect(3, -65, 8, 3);
  ctx.fillStyle = '#11131c';
  ctx.fillRect(-36, -38, 72, 17);
  ctx.fillStyle = '#414453';
  for (let line = 0; line < 4; line++) ctx.fillRect(-33, -36 + line * 3, 66, 1);
  ctx.fillStyle = '#ff344d';
  ctx.fillRect(-43, -40, 11, 14);
  ctx.fillRect(32, -40, 11, 14);
  ctx.fillStyle = '#fff0a0';
  ctx.fillRect(-41, -38, 7, 3);
  ctx.fillRect(34, -38, 7, 3);
  ctx.fillStyle = '#dce5ec';
  ctx.fillRect(-22, -11, 9, 3);
  ctx.fillRect(13, -11, 9, 3);
  ctx.fillStyle = '#f4ead0';
  ctx.fillRect(-9, -18, 18, 7);
  ctx.fillStyle = '#22263a';
  ctx.font = 'bold 5px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('90', 0, -14);
  ctx.fillStyle = '#191b2a';
  ctx.fillRect(-44, -57, 88, 3);
  ctx.restore();
}

function drawRoad() {
  const horizon = 228;
  const base = findSegment(position);
  const segmentProgress = (position % SEGMENT_LENGTH) / SEGMENT_LENGTH;
  drawMountains(horizon);
  const ground = ctx.createLinearGradient(0, horizon, 0, H);
  ground.addColorStop(0, '#258c68');
  ground.addColorStop(1, '#75a65c');
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, W, H - horizon);

  const rows = [];
  let curveOffset = 0;
  for (let n = 0; n <= DRAW_DISTANCE; n++) {
    const segment = segments[(base.index + n) % TOTAL_SEGMENTS];
    const distance = Math.max(0, n - segmentProgress);
    const depth = Math.max(0, 1 - distance / DRAW_DISTANCE);
    const perspective = depth * depth;
    curveOffset += segment.curve * 0.035;
    const center = W / 2 + curveOffset * depth * 9 - playerX * 150 * perspective;
    const halfRoad = 18 + 342 * Math.pow(depth, 1.15);
    const y = horizon + Math.pow(depth, 1.48) * 365 - (segment.elevation - base.elevation) * depth * 0.11;
    rows.push({ segment, center, halfRoad, y, perspective, depth });
  }

  const drawStrip = (near, far, color, nearWidth, farWidth) => polygon([
    [near.center - near.halfRoad * nearWidth, near.y],
    [far.center - far.halfRoad * farWidth, far.y],
    [far.center + far.halfRoad * farWidth, far.y],
    [near.center + near.halfRoad * nearWidth, near.y]
  ], color);

  for (let n = DRAW_DISTANCE - 1; n >= 0; n--) {
    const near = rows[n];
    const far = rows[n + 1];
    const segment = near.segment;
    const stripe = Math.floor(segment.index / 3) % 2 === 0;
    const rumble = stripe ? '#f5e4c1' : '#ed4f63';

    ctx.fillStyle = stripe ? '#237d56' : '#2d9561';
    ctx.fillRect(0, far.y, W, Math.max(1, near.y - far.y + 1));
    drawStrip(near, far, rumble, 1.22, 1.22);
    drawStrip(near, far, '#282d3c', 1.12, 1.12);
    drawStrip(near, far, stripe ? '#444b5d' : '#3e4558', 1, 1);
    drawStrip(near, far, stripe ? 'rgba(255,255,255,.045)' : 'rgba(135,200,255,.055)', 0.48, 0.48);

    for (const side of [-1, 1]) {
      const nearEdge = near.center + side * near.halfRoad * 0.92;
      const farEdge = far.center + side * far.halfRoad * 0.92;
      const nearWidth = Math.max(1, near.halfRoad * 0.018);
      const farWidth = Math.max(0.5, far.halfRoad * 0.018);
      polygon([
        [nearEdge-nearWidth,near.y],[farEdge-farWidth,far.y],
        [farEdge+farWidth,far.y],[nearEdge+nearWidth,near.y]
      ], '#f6e7c7');
    }

    if (Math.floor(segment.index / 7) % 2 === 0) {
      for (const lane of [-1/3, 1/3]) {
        const nearLane = near.center + near.halfRoad * lane;
        const farLane = far.center + far.halfRoad * lane;
        const nearWidth = Math.max(1, near.halfRoad * 0.014);
        const farWidth = Math.max(0.5, far.halfRoad * 0.014);
        polygon([
          [nearLane-nearWidth,near.y],[farLane-farWidth,far.y],
          [farLane+farWidth,far.y],[nearLane+nearWidth,near.y]
        ], '#f5efd9');
      }
    }

    if (n > 4 && segment.props) {
      const spacing = segment.props === 'sign' ? 84 : 28;
      const side = Math.floor(segment.index / spacing) % 2 ? -1 : 1;
      const propX = far.center + side * far.halfRoad * 1.32;
      const propScale = 0.12 + far.depth * 1.15;
      if (segment.props === 'palm') drawPalm(propX, far.y, propScale);
      else drawSign(propX, far.y, propScale, segment.index);
    }

    const row = near;
    for (const car of traffic) {
      if (distanceAhead(car.z) >= DRAW_DISTANCE * SEGMENT_LENGTH) continue;
      const carSegment = findSegment(car.z);
      if (carSegment.index !== segment.index) continue;
      const trafficScale = 0.24 + row.depth * 0.72;
      drawCar(row.center + car.lane * row.halfRoad * 0.78, row.y, trafficScale, car.color, false);
    }
  }
}

function drawHud() {
  ctx.fillStyle = 'rgba(13, 17, 42, .83)';
  ctx.fillRect(14, 12, 772, 44);
  ctx.strokeStyle = '#64e7e2';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 12, 772, 44);
  ctx.font = 'bold 20px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#55f5ee';
  ctx.fillText('TIME', 28, 34);
  ctx.fillStyle = '#ffe75e';
  ctx.fillText(String(Math.ceil(timeLeft)).padStart(2, '0'), 86, 34);
  ctx.fillStyle = '#ff64bd';
  ctx.fillText('SCORE', 190, 34);
  ctx.fillStyle = '#fff5dc';
  ctx.fillText(String(Math.floor(score)).padStart(7, '0'), 270, 34);
  ctx.fillStyle = '#63e8ff';
  ctx.fillText('STAGE 1', 540, 34);
  ctx.fillStyle = '#ffdc67';
  ctx.textAlign = 'right';
  ctx.fillText(String(Math.floor(speed / MAX_SPEED * 280)).padStart(3, '0') + ' KM/H', 770, 34);

  ctx.fillStyle = '#10182c';
  ctx.fillRect(20, 550, 760, 34);
  ctx.fillStyle = '#f55383';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ARROWS / WASD  STEER   •   UP / W  ACCELERATE   •   DOWN / S  BRAKE   •   SPACE  PAUSE', 400, 567);
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = 'rgba(11, 14, 36, .78)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff4fa2';
  ctx.font = '900 58px Impact, sans-serif';
  ctx.shadowColor = '#36e7ec';
  ctx.shadowBlur = 16;
  ctx.fillText(title, 400, 250);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff5c9';
  ctx.font = 'bold 19px monospace';
  ctx.fillText(subtitle, 400, 310);
}

function update(dt) {
  if (state !== 'playing') return;
  timeLeft -= dt;
  if (timeLeft <= 0) {
    timeLeft = 0;
    state = 'gameover';
    return;
  }
  if (keys.accelerate) speed += ACCEL * dt;
  else if (keys.brake) speed += BRAKE * dt;
  else speed += DECEL * dt;
  speed = Math.max(0, Math.min(MAX_SPEED, speed));

  const current = findSegment(position);
  const speedRatio = speed / MAX_SPEED;
  const steerInput = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  steering += steerInput * dt * (1.5 + speedRatio * 2);
  steering *= steerInput ? 0.96 : 0.88;
  playerX += steering * dt;
  playerX -= current.curve * speedRatio * dt * 0.42;
  position = (position + speed * dt) % (TOTAL_SEGMENTS * SEGMENT_LENGTH);
  score += speedRatio * dt * 120;
  for (const car of traffic) {
    car.z = (car.z + car.speed * dt) % TRACK_LENGTH;
    if (distanceAhead(car.z) < SEGMENT_LENGTH * 0.65 && Math.abs(playerX - car.lane) < 0.22) {
      speed *= 0.45;
      shake = 0.28;
      flash = 0.22;
      car.z = (position + SEGMENT_LENGTH * 20) % TRACK_LENGTH;
    }
  }
  if (Math.abs(playerX) > 1.15) {
    speed *= Math.max(0.88, 1 - dt * 1.4);
    if (Math.random() < 0.12) flash = 0.08;
  }
  shake = Math.max(0, shake - dt);
  flash = Math.max(0, flash - dt);
}

function render(now) {
  const dt = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
  ctx.fillStyle = '#16213c';
  ctx.fillRect(0, 0, W, H);
  drawRoad();
  const carX = 400 + Math.max(-1.2, Math.min(1.2, playerX)) * 170;
  drawCar(carX, 535, 0.98, '#ed3158', true);
  drawHud();
  if (state === 'title') drawOverlay('SUNSET RUN', 'PRESS ENTER OR CLICK TO START');
  if (state === 'paused') drawOverlay('PAUSED', 'PRESS SPACE TO CONTINUE');
  if (state === 'gameover') drawOverlay('TIME UP!', 'PRESS ENTER OR CLICK TO RACE AGAIN');
  if (flash > 0) {
    ctx.fillStyle = 'rgba(255, 65, 103, ' + Math.min(0.38, flash * 1.7) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
  requestAnimationFrame(render);
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (['arrowleft','arrowright','arrowup','arrowdown',' '].includes(key)) event.preventDefault();
  if (key === 'enter' && (state === 'title' || state === 'gameover')) resetGame();
  else if (key === ' ' && (state === 'playing' || state === 'paused')) state = state === 'playing' ? 'paused' : 'playing';
  if (key === 'arrowleft' || key === 'a') keys.left = true;
  if (key === 'arrowright' || key === 'd') keys.right = true;
  if (key === 'arrowup' || key === 'w') keys.accelerate = true;
  if (key === 'arrowdown' || key === 's') keys.brake = true;
}

function onKeyUp(event) {
  const key = event.key.toLowerCase();
  if (key === 'arrowleft' || key === 'a') keys.left = false;
  if (key === 'arrowright' || key === 'd') keys.right = false;
  if (key === 'arrowup' || key === 'w') keys.accelerate = false;
  if (key === 'arrowdown' || key === 's') keys.brake = false;
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
canvas.addEventListener('click', () => {
  if (state === 'title' || state === 'gameover') resetGame();
});

buildTrack();
resizeCanvas();
requestAnimationFrame(render);
`;
