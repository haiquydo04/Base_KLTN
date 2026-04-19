import React, { useEffect, useRef } from 'react';

const NeonHeartBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let animationFrameId;
    let particles = [];
    
    // Resize callback
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Heart parametric function
    const getHeartPosition = (t, scale) => {
      // heart equation
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return { x: x * scale, y: y * scale };
    };

    // Particle settings
    const numParticles = 100;
    const baseScale = Math.min(width, height) / 45; // scale factor based on screen size

    class Particle {
      constructor(index) {
        this.index = index;
        // Evenly spread particles along the heart parameter 't'
        this.t = (index / numParticles) * Math.PI * 2;
        // Speed of movement along the path
        this.speed = 0.005 + Math.random() * 0.005;
        // Offset from the exact heart center for some organic thickness
        this.offsetX = (Math.random() - 0.5) * 20;
        this.offsetY = (Math.random() - 0.5) * 20;
        this.color = `hsla(${340 + Math.random() * 20}, 100%, 60%, ${0.6 + Math.random() * 0.4})`;
        this.size = 1 + Math.random() * 2;
        this.pulse = Math.random() * Math.PI * 2;
      }

      update() {
        this.t += this.speed;
        this.pulse += 0.05;
      }

      draw(ctx, width, height) {
        // dynamic scale for heartbeat effect
        const currentScale = baseScale * (1 + 0.05 * Math.sin(this.pulse));
        const pos = getHeartPosition(this.t, currentScale);
        
        const drawX = width / 2 + pos.x + this.offsetX;
        const drawY = height / 2 + pos.y + this.offsetY;

        ctx.beginPath();
        // Neon glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
        ctx.fill();
        // Reset shadow for performance on non-glowing parts if needed, but here we want glow
        ctx.shadowBlur = 0; 
      }
    }

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(i));
    }

    // Animation loop
    const render = () => {
      // Use destination-out to fade the previous frames, creating a trailing effect on a transparent canvas
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // The alpha value controls the length of the trail
      ctx.fillRect(0, 0, width, height);
      
      ctx.globalCompositeOperation = 'source-over';

      // Draw a subtle radial gradient in the center for depth (optional, keeping it very light)
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/3);
      gradient.addColorStop(0, 'rgba(255, 0, 50, 0.05)');
      gradient.addColorStop(1, 'rgba(255, 0, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw(ctx, width, height);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default NeonHeartBackground;
