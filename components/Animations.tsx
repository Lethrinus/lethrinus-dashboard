import React, { useEffect, useRef, useState } from 'react';

// --- 1. DECRYPTED TEXT EFFECT ---
interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({ 
  text, 
  speed = 50, 
  maxIterations = 10,
  className = '',
  revealDirection = 'start',
  useOriginalCharsOnly = false,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const iterations = useRef(0);
  
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

  useEffect(() => {
    let interval: any;

    const startScramble = () => {
      setIsScrambling(true);
      iterations.current = 0;

      interval = setInterval(() => {
        setDisplayText((prev) => 
          text.split('').map((char, index) => {
            if (char === ' ') return ' ';
            
            if (iterations.current > index + maxIterations) {
              return char;
            }
            
            return characters[Math.floor(Math.random() * characters.length)];
          }).join('')
        );

        iterations.current += 1 / 3;

        if (iterations.current > text.length + maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsScrambling(false);
        }
      }, speed);
    };

    startScramble();

    return () => clearInterval(interval);
  }, [text, speed, maxIterations]);

  return (
    <span className={`${className} inline-block font-mono`}>
      {displayText}
    </span>
  );
};


// --- 2. SPOTLIGHT CARD EFFECT ---
interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ 
  children, 
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.15)'
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#131316] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};


// --- 3. STARFIELD BACKGROUND ---
interface StarFieldProps {
  speed?: number;
  backgroundColor?: string;
  starColor?: string;
  count?: number;
}

export const StarField: React.FC<StarFieldProps> = ({ 
  speed = 0.05, 
  backgroundColor = 'black', 
  starColor = '#ffffff',
  count = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const stars: {x: number, y: number, z: number}[] = [];

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w - w / 2,
          y: Math.random() * h - h / 2,
          z: Math.random() * w
        });
      }
    };

    initStars();

    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = backgroundColor;
      ctx.clearRect(0, 0, w, h);
      
      ctx.fillStyle = starColor;
      
      stars.forEach((star) => {
        star.z -= speed * 20; 

        if (star.z <= 0) {
          star.x = Math.random() * w - w / 2;
          star.y = Math.random() * h - h / 2;
          star.z = w;
        }

        const x = (star.x / star.z) * w + w / 2;
        const y = (star.y / star.z) * h + h / 2;
        
        const size = (1 - star.z / w) * 3;
        const alpha = (1 - star.z / w);

        if (x >= 0 && x < w && y >= 0 && y < h) {
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, size > 0 ? size : 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [speed, backgroundColor, starColor, count]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};


// --- 4. MAGNET EFFECT ---
interface MagnetProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  strength?: number; // Higher is weaker pull
  activeScale?: number;
}

export const Magnet: React.FC<MagnetProps> = ({ 
  children, 
  className = '',
  disabled = false,
  strength = 5,
  activeScale = 1.1
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    setPosition({ 
      x: distX / strength, 
      y: distY / strength 
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className} transition-transform duration-200 ease-out will-change-transform`}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px) scale(${isHovered ? activeScale : 1})`,
      }}
    >
      {children}
    </div>
  );
};

// --- 5. SHINY TEXT ---
export const ShinyText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  return (
    <span 
      className={`bg-clip-text text-transparent bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-[length:200%_auto] animate-[shine_3s_linear_infinite] ${className}`}
    >
      {text}
    </span>
  );
};

// --- 6. GLITCH EFFECT ---
export const GlitchEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <div className={`relative group ${className}`}>
             <div className="absolute top-0 left-0 w-full h-full opacity-50 group-hover:animate-glitch text-red-500 hidden group-hover:block" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-2px, 0)' }}>
                {children}
             </div>
             <div className="absolute top-0 left-0 w-full h-full opacity-50 group-hover:animate-glitch text-blue-500 hidden group-hover:block" style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)', transform: 'translate(2px, 0)', animationDirection: 'reverse' }}>
                {children}
             </div>
             <div className="relative z-10">{children}</div>
        </div>
    )
}

// --- 7. FAULTY TERMINAL BACKGROUND ---
interface FaultyTerminalProps {
  text?: string;
  speed?: number;
  textColor?: string;
  fadeSpeed?: number;
}

export const FaultyTerminal: React.FC<FaultyTerminalProps> = ({ 
  text = '0123456789ABCDEF', 
  speed = 50,
  textColor = '#8b5cf6', // Violet default
  fadeSpeed = 0.05
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const fontSize = 14;
    const columns = Math.floor(w / fontSize);
    const rows = Math.floor(h / fontSize);
    
    // Grid of random characters
    const grid: { char: string, opacity: number }[][] = [];
    
    const initGrid = () => {
        grid.length = 0;
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < columns; x++) {
                row.push({
                    char: text[Math.floor(Math.random() * text.length)],
                    opacity: Math.random()
                });
            }
            grid.push(row);
        }
    };
    initGrid();

    let animationFrameId: number;

    const draw = () => {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.3)'; // Trail effect
        ctx.fillRect(0, 0, w, h);

        ctx.font = `${fontSize}px monospace`;
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                const cell = grid[y][x];
                
                // Randomly change character and opacity
                if (Math.random() > 0.95) {
                    cell.char = text[Math.floor(Math.random() * text.length)];
                }
                if (Math.random() > 0.95) {
                    cell.opacity = Math.random();
                }

                ctx.fillStyle = textColor;
                ctx.globalAlpha = cell.opacity * 0.5; // Base opacity lower
                ctx.fillText(cell.char, x * fontSize, y * fontSize);
            }
        }
        
        ctx.globalAlpha = 1;
        animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initGrid();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [text, speed, textColor, fadeSpeed]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-20" />;
};
