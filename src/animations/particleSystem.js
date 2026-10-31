/**
 * ParticleSystem - Atmospheric and Interactive Particle Effects
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.ambientParticles = [];
    this.initAmbient(40);
  }

  initAmbient(count) {
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random(), // 0..1 relative to canvas
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.02,
        vy: -0.01 - Math.random() * 0.03,
        size: 1 + Math.random() * 2.5,
        alpha: 0.1 + Math.random() * 0.35,
        baseAlpha: 0.1 + Math.random() * 0.35,
        pulseSpeed: 1 + Math.random() * 2
      });
    }
  }

  createStepPuff(x, y) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x,
        y: y + 8,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 15,
        size: 2 + Math.random() * 3,
        color: 'rgba(162, 155, 254, ',
        alpha: 0.6,
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  createCollectBurst(x, y) {
    // Golden sparkling burst
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.4 ? 'rgba(255, 215, 0, ' : 'rgba(255, 255, 255, ',
        alpha: 1.0,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.8
      });
    }
  }

  createRewindTrail(fromX, fromY, toX, toY) {
    for (let i = 0; i < 15; i++) {
      const t = i / 15;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 15,
        vy: -10 - Math.random() * 20,
        size: 2.5 + Math.random() * 3,
        color: 'rgba(108, 92, 231, ',
        alpha: 0.8,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  createVictoryConfetti(width, height) {
    const colors = [
      'rgba(255, 215, 0, ',
      'rgba(108, 92, 231, ',
      'rgba(0, 206, 201, ',
      'rgba(253, 121, 168, ',
      'rgba(255, 234, 167, '
    ];

    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: -10 - Math.random() * 50,
        vx: (Math.random() - 0.5) * 120,
        vy: 80 + Math.random() * 150,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 2.0 + Math.random() * 1.5,
        maxLife: 3.0,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 10
      });
    }
  }

  update(dt, width, height) {
    // Update ambient particles
    for (const p of this.ambientParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < 0) p.x += 1;
      if (p.x > 1) p.x -= 1;
      if (p.y < 0) p.y += 1;
      if (p.y > 1) p.y -= 1;
    }

    // Update dynamic particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.rot !== undefined) p.rot += p.vrot * dt;
    }
  }

  render(ctx, width, height) {
    // Draw ambient motes
    ctx.save();
    const time = performance.now() * 0.001;
    for (const p of this.ambientParticles) {
      const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(time * p.pulseSpeed + p.x * 10));
      ctx.fillStyle = `rgba(220, 225, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw dynamic particles
    for (const p of this.particles) {
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
