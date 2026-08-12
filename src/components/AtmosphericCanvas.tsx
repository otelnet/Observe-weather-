import React, { useEffect, useRef } from 'react';

interface AtmosphericCanvasProps {
  conditionCode: string; // 'sunny', 'cloudy', 'rain', 'heavy_rain', 'thunderstorm', 'typhoon'
  windSpeed: number; // km/h
}

export const AtmosphericCanvas: React.FC<AtmosphericCanvasProps> = ({ conditionCode, windSpeed }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool setup
    const particleCount = conditionCode === 'typhoon' ? 180 : conditionCode === 'heavy_rain' ? 140 : conditionCode === 'rain' ? 80 : 35;
    const particles: any[] = [];

    const windAngle = (Math.min(windSpeed, 150) / 150) * (Math.PI / 6); // slanted rain

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 18 + 8,
        speed: Math.random() * 12 + 8 + windSpeed * 0.15,
        opacity: Math.random() * 0.5 + 0.2,
        size: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2, // for typhoon swirl
        radius: Math.random() * (Math.min(width, height) * 0.4) + 20,
      });
    }

    let flashTimer = 0;
    let flashAlpha = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render condition-specific background atmosphere overlay
      if (conditionCode === 'thunderstorm' || conditionCode === 'typhoon') {
        flashTimer++;
        if (flashTimer % 180 === 0 && Math.random() > 0.4) {
          flashAlpha = 0.8;
        }
        if (flashAlpha > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, width, height);
          flashAlpha *= 0.88;
        }
      }

      if (conditionCode === 'typhoon') {
        // Render eyewall swirl animation
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.lineWidth = 1.5;
        particles.forEach((p) => {
          p.angle += 0.02 + (windSpeed / 1000);
          p.radius -= 0.5;
          if (p.radius < 15) p.radius = Math.min(width, height) * 0.4;

          const px = centerX + Math.cos(p.angle) * p.radius;
          const py = centerY + Math.sin(p.angle) * p.radius;

          ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (conditionCode === 'rain' || conditionCode === 'heavy_rain' || conditionCode === 'thunderstorm') {
        // Render slanted rainfall lines
        ctx.strokeStyle = conditionCode === 'heavy_rain' ? 'rgba(191, 219, 254, 0.6)' : 'rgba(219, 234, 254, 0.4)';
        ctx.lineWidth = conditionCode === 'heavy_rain' ? 2 : 1;

        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.sin(windAngle) * p.length, p.y + Math.cos(windAngle) * p.length);
          ctx.stroke();

          p.y += p.speed;
          p.x += Math.sin(windAngle) * (p.speed * 0.4);

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        });
      } else {
        // Sunny or Cloudy floating ambient dust/cloud mist particles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();

          p.x += Math.cos(p.angle) * 0.4;
          p.y += Math.sin(p.angle) * 0.2;
          p.angle += 0.01;

          if (p.x < 0 || p.x > width) p.x = Math.random() * width;
          if (p.y < 0 || p.y > height) p.y = Math.random() * height;
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [conditionCode, windSpeed]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};
