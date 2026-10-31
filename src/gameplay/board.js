/**
 * BoardRenderer & Board Controller
 * Renders the full 2D shadow theater puzzle world, volumetric light rays,
 * solid stones, glowing shadow platforms, exit portal, collectibles, and Lumi.
 */
import { CharacterRenderer } from '../animations/characterAnimations.js';
import { ParticleSystem } from '../animations/particleSystem.js';
import { storage } from '../core/storage.js';

export class BoardRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = new ParticleSystem();

    this.levelData = null;
    this.lightSystem = null;
    this.shadowSystem = null;
    this.player = null;

    this.cellSize = 48;
    this.offsetX = 0;
    this.offsetY = 0;

    this.exitPulse = 0;
    this.resize();
  }

  setContext(levelData, lightSystem, shadowSystem, player) {
    this.levelData = levelData;
    this.lightSystem = lightSystem;
    this.shadowSystem = shadowSystem;
    this.player = player;
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const displayWidth = Math.floor(rect.width);
    const displayHeight = Math.floor(rect.height);

    if (this.canvas.width !== displayWidth * dpr || this.canvas.height !== displayHeight * dpr) {
      this.canvas.width = displayWidth * dpr;
      this.canvas.height = displayHeight * dpr;
      this.canvas.style.width = `${displayWidth}px`;
      this.canvas.style.height = `${displayHeight}px`;
    }

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    if (this.levelData) {
      const { width, height } = this.levelData;
      // Add margin for projector lanterns on board edges
      const margin = 56;
      const availW = displayWidth - margin * 2;
      const availH = displayHeight - margin * 2;

      const sizeX = Math.floor(availW / width);
      const sizeY = Math.floor(availH / height);
      this.cellSize = Math.max(28, Math.min(68, Math.min(sizeX, sizeY)));

      this.offsetX = Math.floor((displayWidth - width * this.cellSize) / 2);
      this.offsetY = Math.floor((displayHeight - height * this.cellSize) / 2);
    }
  }

  update(dt) {
    if (!this.levelData) return;
    this.exitPulse += dt * 3;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    this.particles.update(dt, w, h);
    if (this.shadowSystem) {
      this.shadowSystem.updateTransition(dt);
    }
  }

  render() {
    if (!this.levelData || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    // 1. Atmospheric Deep Vignette Background
    this.renderBackground(ctx, w, h);

    // 2. Volumetric Light Ray Beams
    this.renderLightRays(ctx, w, h);

    // 3. Dark Zones (Chapter 8)
    this.renderDarkZones(ctx);

    // 4. Background Grid Lines (subtle theater scaffolding)
    this.renderGrid(ctx);

    // 5. Shadow Platforms (Materialized walk surfaces)
    this.renderShadowPlatforms(ctx);

    // 6. Solid Platforms (Stone foundation)
    this.renderSolidPlatforms(ctx);

    // 7. Interactive Switches (Chapter 7)
    this.renderSwitches(ctx);

    // 8. Solid Shadow-Casting Objects (Pillars, Blocks, Prisms)
    this.renderObjects(ctx);

    // 9. Collectibles (Star crystals / coins)
    this.renderCollectibles(ctx);

    // 10. Exit Portal
    this.renderExitPortal(ctx);

    // 11. Lumi (Player character)
    if (this.player) {
      const px = this.offsetX + (this.player.renderX + 0.5) * this.cellSize;
      const py = this.offsetY + (this.player.renderY + 0.5) * this.cellSize;
      const activeSkin = storage.get('activeSkin') || 'classic';
      CharacterRenderer.render(ctx, this.player, px, py, this.cellSize, activeSkin);
    }

    // 12. Projector Lantern device(s)
    this.renderProjector(ctx, w, h);

    // 13. Particles & Sparks
    this.particles.render(ctx, w, h);
  }

  renderBackground(ctx, w, h) {
    // Deep starry theater gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.75);
    grad.addColorStop(0, '#12162d');
    grad.addColorStop(0.65, '#0b0d1b');
    grad.addColorStop(1, '#05070e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  renderGrid(ctx) {
    const { width, height } = this.levelData;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(this.offsetX + x * this.cellSize, this.offsetY);
      ctx.lineTo(this.offsetX + x * this.cellSize, this.offsetY + height * this.cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(this.offsetX, this.offsetY + y * this.cellSize);
      ctx.lineTo(this.offsetX + width * this.cellSize, this.offsetY + y * this.cellSize);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderLightRays(ctx, w, h) {
    if (!this.lightSystem) return;
    const { width, height } = this.levelData;
    const dir = this.lightSystem.currentDirection;

    ctx.save();
    let grad;
    const boardL = this.offsetX;
    const boardR = this.offsetX + width * this.cellSize;
    const boardT = this.offsetY;
    const boardB = this.offsetY + height * this.cellSize;

    if (dir === 'left') {
      grad = ctx.createLinearGradient(boardL - 40, 0, boardR + 40, 0);
    } else if (dir === 'right') {
      grad = ctx.createLinearGradient(boardR + 40, 0, boardL - 40, 0);
    } else if (dir === 'up') {
      grad = ctx.createLinearGradient(0, boardT - 40, 0, boardB + 40);
    } else {
      grad = ctx.createLinearGradient(0, boardB + 40, 0, boardT - 40);
    }

    grad.addColorStop(0, 'rgba(255, 225, 140, 0.16)');
    grad.addColorStop(0.35, 'rgba(255, 200, 100, 0.06)');
    grad.addColorStop(1, 'rgba(255, 200, 100, 0.00)');

    ctx.fillStyle = grad;
    ctx.fillRect(boardL - 10, boardT - 10, width * this.cellSize + 20, height * this.cellSize + 20);
    ctx.restore();
  }

  renderDarkZones(ctx) {
    const { darkZones = [] } = this.levelData;
    ctx.save();
    darkZones.forEach(zone => {
      const zx = this.offsetX + zone.x * this.cellSize;
      const zy = this.offsetY + zone.y * this.cellSize;
      const zw = zone.w * this.cellSize;
      const zh = zone.h * this.cellSize;

      ctx.fillStyle = 'rgba(6, 7, 15, 0.82)';
      ctx.fillRect(zx, zy, zw, zh);

      ctx.strokeStyle = 'rgba(108, 92, 231, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(zx + 2, zy + 2, zw - 4, zh - 4);
    });
    ctx.restore();
  }

  renderSolidPlatforms(ctx) {
    const { solidPlatforms = [], start } = this.levelData;
    const allSolids = [...solidPlatforms];
    if (start && !allSolids.some(s => s.x === start.x && s.y === start.y)) {
      allSolids.push(start);
    }

    ctx.save();
    allSolids.forEach(p => {
      const px = this.offsetX + p.x * this.cellSize;
      const py = this.offsetY + p.y * this.cellSize;
      const s = this.cellSize;

      // Solid ivory/slate platform with chamfered top
      const grad = ctx.createLinearGradient(px, py, px, py + s);
      grad.addColorStop(0, '#e4e7eb');
      grad.addColorStop(0.12, '#cbd3dc');
      grad.addColorStop(1, '#8392a5');

      ctx.fillStyle = grad;
      ctx.fillRect(px + 1, py + 1, s - 2, s - 2);

      // Top highlighted walking edge
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 2, py + 1, s - 4, 3);

      // Subtle drop shadow beneath
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(px + 1, py + s - 3, s - 2, 2);
    });
    ctx.restore();
  }

  renderShadowPlatforms(ctx) {
    if (!this.shadowSystem) return;
    const shadows = this.shadowSystem.activeShadows;
    const progress = this.shadowSystem.transitionProgress;
    const time = performance.now() * 0.001;

    ctx.save();
    shadows.forEach(shadow => {
      const sx = this.offsetX + shadow.x * this.cellSize;
      const sy = this.offsetY + shadow.y * this.cellSize;
      const s = this.cellSize;

      const alpha = Math.min(1.0, progress * 1.2) * (shadow.intensity || 0.85);

      // Ethereal translucent violet/indigo glass platform
      const grad = ctx.createLinearGradient(sx, sy, sx, sy + s);
      if (shadow.isFragile) {
        // Red-tinted fragile shadow
        grad.addColorStop(0, `rgba(235, 77, 75, ${alpha * 0.85})`);
        grad.addColorStop(1, `rgba(108, 92, 231, ${alpha * 0.5})`);
      } else {
        grad.addColorStop(0, `rgba(162, 155, 254, ${alpha * 0.85})`);
        grad.addColorStop(0.5, `rgba(108, 92, 231, ${alpha * 0.65})`);
        grad.addColorStop(1, `rgba(50, 40, 110, ${alpha * 0.75})`);
      }

      ctx.fillStyle = grad;
      ctx.fillRect(sx + 2, sy + 2, s - 4, s - 4);

      // Glowing neon edge
      ctx.strokeStyle = shadow.isFragile ? `rgba(255, 107, 129, ${alpha})` : `rgba(0, 206, 201, ${alpha * 0.9})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx + 2.5, sy + 2.5, s - 5, s - 5);

      // Top walking highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.fillRect(sx + 4, sy + 2, s - 8, 2);

      // Fragile step indicator
      if (shadow.isFragile) {
        const remaining = Math.max(0, shadow.fragileSteps - shadow.steppedCount);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⚡${remaining}`, sx + s / 2, sy + s / 2 + 4);
      }
    });
    ctx.restore();
  }

  renderObjects(ctx) {
    const { objects = [] } = this.levelData;
    ctx.save();
    objects.forEach(obj => {
      const ox = this.offsetX + obj.x * this.cellSize;
      const oy = this.offsetY + obj.y * this.cellSize;
      const s = this.cellSize;

      if (obj.type === 'prism') {
        // Rotating Crystal Prism
        ctx.save();
        ctx.translate(ox + s / 2, oy + s / 2);
        ctx.rotate(((obj.rotation || 90) * Math.PI) / 180);

        ctx.fillStyle = '#00cec9';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.42);
        ctx.lineTo(s * 0.38, s * 0.35);
        ctx.lineTo(-s * 0.38, s * 0.35);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else {
        // Monolithic Pillar / Dark Obelisk
        const grad = ctx.createLinearGradient(ox, oy, ox + s, oy + s);
        grad.addColorStop(0, '#2d3436');
        grad.addColorStop(0.6, '#1e272e');
        grad.addColorStop(1, '#0f1418');

        ctx.fillStyle = grad;
        ctx.fillRect(ox + 2, oy + 2, s - 4, s - 4);

        // Mystical glowing carved rune in center
        ctx.strokeStyle = 'rgba(255, 221, 89, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ox + s / 2, oy + s / 2, s * 0.22, 0, Math.PI * 2);
        ctx.moveTo(ox + s / 2, oy + s * 0.28);
        ctx.lineTo(ox + s / 2, oy + s * 0.72);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(ox + 2, oy + 2, s - 4, s - 4);
      }
    });
    ctx.restore();
  }

  renderSwitches(ctx) {
    const { switches = [] } = this.levelData;
    ctx.save();
    switches.forEach(sw => {
      const sx = this.offsetX + sw.x * this.cellSize;
      const sy = this.offsetY + sw.y * this.cellSize;
      const s = this.cellSize;

      // Heavy brass plate
      ctx.fillStyle = sw.active ? '#00b894' : '#636e72';
      ctx.fillRect(sx + 6, sy + s - 10, s - 12, 8);

      // Glowing core
      ctx.fillStyle = sw.active ? '#55efc4' : '#fab1a0';
      ctx.beginPath();
      ctx.arc(sx + s / 2, sy + s - 6, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  renderCollectibles(ctx) {
    const { collectibles = [] } = this.levelData;
    const time = performance.now() * 0.001;

    ctx.save();
    collectibles.forEach(col => {
      if (col.collected) return;
      const cx = this.offsetX + (col.x + 0.5) * this.cellSize;
      const floatY = Math.sin(time * 3 + col.x) * 4;
      const cy = this.offsetY + (col.y + 0.5) * this.cellSize + floatY;
      const r = this.cellSize * 0.22;

      // Golden Star Crystal
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 1.5);

      // Star shape
      ctx.fillStyle = '#ffd32a';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = i % 2 === 0 ? r : r * 0.45;
        const a = (i * Math.PI) / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();

      // Core sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
    ctx.restore();
  }

  renderExitPortal(ctx) {
    const { exit } = this.levelData;
    if (!exit) return;

    const ex = this.offsetX + (exit.x + 0.5) * this.cellSize;
    const ey = this.offsetY + (exit.y + 0.5) * this.cellSize;
    const s = this.cellSize;

    ctx.save();
    ctx.translate(ex, ey);

    // Glowing arched doorway
    const pulse = 1.0 + Math.sin(this.exitPulse) * 0.08;
    ctx.scale(pulse, pulse);

    const auraGrad = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 0.55);
    auraGrad.addColorStop(0, 'rgba(0, 206, 201, 0.6)');
    auraGrad.addColorStop(0.7, 'rgba(108, 92, 231, 0.3)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Archway frame
    ctx.fillStyle = '#1e272e';
    ctx.strokeStyle = '#55efc4';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.32, Math.PI, 0);
    ctx.lineTo(s * 0.32, s * 0.4);
    ctx.lineTo(-s * 0.32, s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Swirling portal vortex inside door
    const vortexGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, s * 0.28);
    vortexGrad.addColorStop(0, '#ffffff');
    vortexGrad.addColorStop(0.4, '#00cec9');
    vortexGrad.addColorStop(1, '#0984e3');
    ctx.fillStyle = vortexGrad;

    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.22, Math.PI, 0);
    ctx.lineTo(s * 0.22, s * 0.36);
    ctx.lineTo(-s * 0.22, s * 0.36);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  renderProjector(ctx, w, h) {
    if (!this.lightSystem) return;
    const { width, height } = this.levelData;
    const dir = this.lightSystem.currentDirection;

    // Calculate position along board perimeter
    let px, py;
    const midX = this.offsetX + (width * this.cellSize) / 2;
    const midY = this.offsetY + (height * this.cellSize) / 2;

    if (dir === 'left') {
      px = this.offsetX - 26;
      py = midY;
    } else if (dir === 'right') {
      px = this.offsetX + width * this.cellSize + 26;
      py = midY;
    } else if (dir === 'up') {
      px = midX;
      py = this.offsetY - 26;
    } else {
      px = midX;
      py = this.offsetY + height * this.cellSize + 26;
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((this.lightSystem.currentAngle * Math.PI) / 180);

    // Glowing golden lantern lens
    const lensGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
    lensGrad.addColorStop(0, '#ffffff');
    lensGrad.addColorStop(0.3, '#fed330');
    lensGrad.addColorStop(1, 'rgba(254, 211, 48, 0)');

    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Brass projector body housing
    ctx.fillStyle = '#d1a657';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Directional beam emitter cone
    ctx.fillStyle = '#fed330';
    ctx.beginPath();
    ctx.moveTo(6, -6);
    ctx.lineTo(16, -11);
    ctx.lineTo(16, 11);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
