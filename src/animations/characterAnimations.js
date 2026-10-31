/**
 * CharacterRenderer - Renders animated original character LUMI
 * Built with procedural Canvas illustration: glowing droplet body, antenna, expressive eyes, squash/stretch.
 */
import { PLAYER_STATES } from '../gameplay/player.js';

export const SKINS = {
  classic: {
    name: 'Classic Spark',
    bodyGradient: ['#ffeaa7', '#fdcb6e'],
    antennaGlow: '#ffeaa7',
    eyeColor: '#2d3436',
    auraColor: 'rgba(253, 203, 110, 0.45)',
    blushColor: 'rgba(255, 118, 117, 0.5)'
  },
  amethyst: {
    name: 'Amethyst Phantom',
    bodyGradient: ['#e056fd', '#be2edd'],
    antennaGlow: '#f8a5c2',
    eyeColor: '#130f40',
    auraColor: 'rgba(190, 46, 221, 0.45)',
    blushColor: 'rgba(248, 165, 194, 0.5)'
  },
  cyber: {
    name: 'Cyber Neon',
    bodyGradient: ['#00cec9', '#0984e3'],
    antennaGlow: '#55efc4',
    eyeColor: '#0c2461',
    auraColor: 'rgba(0, 206, 201, 0.45)',
    blushColor: 'rgba(129, 236, 236, 0.5)'
  },
  sakura: {
    name: 'Sakura Whisper',
    bodyGradient: ['#ffb8b8', '#ff7675'],
    antennaGlow: '#fab1a0',
    eyeColor: '#2d3436',
    auraColor: 'rgba(255, 118, 117, 0.45)',
    blushColor: 'rgba(255, 184, 184, 0.6)'
  },
  solar: {
    name: 'Solar Flare',
    bodyGradient: ['#ff9f43', '#ee5253'],
    antennaGlow: '#feca57',
    eyeColor: '#222f3e',
    auraColor: 'rgba(238, 82, 83, 0.45)',
    blushColor: 'rgba(254, 202, 87, 0.6)'
  },
  quantum: {
    name: 'Quantum Ghost',
    bodyGradient: ['#ffffff', '#dfe6e9'],
    antennaGlow: '#74b9ff',
    eyeColor: '#2d3436',
    auraColor: 'rgba(255, 255, 255, 0.55)',
    blushColor: 'rgba(116, 185, 255, 0.5)'
  }
};

export class CharacterRenderer {
  static render(ctx, player, centerX, centerY, cellSize, activeSkinId = 'classic') {
    const skin = SKINS[activeSkinId] || SKINS.classic;
    const time = performance.now() * 0.001;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Apply squash and stretch from player bottom pivot
    ctx.scale(player.scaleX, player.scaleY);

    const radius = cellSize * 0.32;

    // 1. Outer Ethereal Aura Glow
    const auraRadius = radius * 1.8 + Math.sin(time * 4) * 2;
    const auraGrad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, auraRadius);
    auraGrad.addColorStop(0, skin.auraColor);
    auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Soft shadow underneath Lumi
    ctx.fillStyle = 'rgba(10, 12, 24, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.95, radius * 0.75, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Antenna with glowing spark tip
    const antennaWiggle = Math.sin(time * 6 + (player.isMoving ? 10 : 0)) * 3;
    ctx.strokeStyle = skin.bodyGradient[1];
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.7);
    ctx.quadraticCurveTo(antennaWiggle * 0.5, -radius * 1.25, antennaWiggle, -radius * 1.45);
    ctx.stroke();

    // Antenna orb spark
    ctx.fillStyle = skin.antennaGlow;
    ctx.beginPath();
    ctx.arc(antennaWiggle, -radius * 1.45, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Main Body: cute pear / droplet shape
    const bodyGrad = ctx.createRadialGradient(
      -radius * 0.2, -radius * 0.2, radius * 0.1,
      0, 0, radius
    );
    bodyGrad.addColorStop(0, skin.bodyGradient[0]);
    bodyGrad.addColorStop(1, skin.bodyGradient[1]);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    // Droplet shape path
    ctx.moveTo(0, -radius * 0.9);
    ctx.bezierCurveTo(radius * 0.9, -radius * 0.8, radius * 1.05, radius * 0.7, 0, radius * 0.9);
    ctx.bezierCurveTo(-radius * 1.05, radius * 0.7, -radius * 0.9, -radius * 0.8, 0, -radius * 0.9);
    ctx.fill();

    // 5. Blush Cheeks
    ctx.fillStyle = skin.blushColor;
    ctx.beginPath();
    ctx.ellipse(-radius * 0.48, radius * 0.18, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(radius * 0.48, radius * 0.18, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Eyes: Big expressive luminous eyes that track the light
    if (player.state === PLAYER_STATES.CONFUSED) {
      // Swirly confused eyes
      ctx.strokeStyle = skin.eyeColor;
      ctx.lineWidth = 2;
      [-radius * 0.35, radius * 0.35].forEach(ex => {
        ctx.beginPath();
        ctx.arc(ex, -radius * 0.05, 4.5, 0, Math.PI * 1.5);
        ctx.stroke();
      });
    } else if (player.isBlinking) {
      // Closed happy blink arches
      ctx.strokeStyle = skin.eyeColor;
      ctx.lineWidth = 2.5;
      [-radius * 0.35, radius * 0.35].forEach(ex => {
        ctx.beginPath();
        ctx.arc(ex, -radius * 0.05, 4.5, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      });
    } else {
      // Open big expressive eyes
      const eyeOffsetX = player.lookX * 2.2 + (player.facing > 0 ? 1 : -1);
      const eyeOffsetY = player.lookY * 2.0;

      [-radius * 0.35, radius * 0.35].forEach(ex => {
        // White sclera
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(ex, -radius * 0.05, 5.5, 7.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark pupil shifting towards look direction
        ctx.fillStyle = skin.eyeColor;
        ctx.beginPath();
        ctx.arc(ex + eyeOffsetX, -radius * 0.05 + eyeOffsetY, 3.6, 0, Math.PI * 2);
        ctx.fill();

        // White specular reflection highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + eyeOffsetX - 1.2, -radius * 0.05 + eyeOffsetY - 1.4, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 7. Small smiling mouth
    if (player.state === PLAYER_STATES.CELEBRATING) {
      ctx.fillStyle = skin.eyeColor;
      ctx.beginPath();
      ctx.arc(0, radius * 0.32, 4, 0, Math.PI);
      ctx.fill();
    } else {
      ctx.strokeStyle = skin.eyeColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, radius * 0.28, 3, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
