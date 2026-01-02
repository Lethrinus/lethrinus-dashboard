// filepath: c:\Users\yavuz\OneDrive\Masaüstü\Longhorn\lethrinus-dashboard\components\Animations.tsx
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, Variants } from 'framer-motion';

// ============================================================================
// PAGE TRANSITION WRAPPER
// ============================================================================
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const PageTransition: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================================================
// STAGGER CONTAINER
// ============================================================================
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const StaggerContainer: React.FC<{ children: ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0.1
}) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={className}
    style={{ '--delay': delay } as React.CSSProperties}
  >
    {children}
  </motion.div>
);

// ============================================================================
// FADE IN ITEM
// ============================================================================
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

export const FadeIn: React.FC<{
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
}> = ({ children, className = '', direction = 'up', delay = 0 }) => {
  const variants = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight,
    scale: scaleIn,
  };

  return (
    <motion.div
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// DECRYPTED TEXT EFFECT
// ============================================================================
interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  onComplete?: () => void;
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 50,
  maxIterations = 10,
  className = '',
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const iterations = useRef(0);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const startScramble = () => {
      iterations.current = 0;

      interval = setInterval(() => {
        setDisplayText(
          text.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (iterations.current > index + maxIterations) return char;
            return characters[Math.floor(Math.random() * characters.length)];
          }).join('')
        );

        iterations.current += 1 / 3;

        if (iterations.current > text.length + maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          onComplete?.();
        }
      }, speed);
    };

    startScramble();
    return () => clearInterval(interval);
  }, [text, speed, maxIterations, onComplete]);

  return (
    <motion.span
      className={`${className} inline-block font-mono`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayText}
    </motion.span>
  );
};

// ============================================================================
// SPOTLIGHT CARD EFFECT
// ============================================================================
interface SpotlightCardProps {
  children: ReactNode;
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

  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#131316] ${className}`}
      whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.3)' }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
};

// ============================================================================
// MAGNETIC EFFECT
// ============================================================================
interface MagnetProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  strength?: number;
  activeScale?: number;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  className = '',
  disabled = false,
  strength = 5,
  activeScale = 1.05
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const springConfig = { damping: 20, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  const scaleSpring = useSpring(scale, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    x.set((e.clientX - centerX) / strength);
    y.set((e.clientY - centerY) / strength);
  };

  const handleMouseEnter = () => {
    if (!disabled) scale.set(activeScale);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className} will-change-transform`}
      style={{ x: xSpring, y: ySpring, scale: scaleSpring }}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// SHINY TEXT
// ============================================================================
export const ShinyText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <motion.span
    className={`bg-clip-text text-transparent bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-[length:200%_auto] ${className}`}
    animate={{ backgroundPosition: ['0% center', '200% center'] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
  >
    {text}
  </motion.span>
);

// ============================================================================
// GLITCH EFFECT
// ============================================================================
export const GlitchText: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    className={`relative ${className}`}
    whileHover="glitch"
  >
    <motion.div
      className="absolute top-0 left-0 w-full h-full text-red-500/50"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}
      variants={{
        glitch: {
          x: [0, -2, 2, -2, 0],
          transition: { duration: 0.3, repeat: Infinity }
        }
      }}
    >
      {children}
    </motion.div>
    <motion.div
      className="absolute top-0 left-0 w-full h-full text-cyan-500/50"
      style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)' }}
      variants={{
        glitch: {
          x: [0, 2, -2, 2, 0],
          transition: { duration: 0.3, repeat: Infinity }
        }
      }}
    >
      {children}
    </motion.div>
    <div className="relative z-10">{children}</div>
  </motion.div>
);

// ============================================================================
// AURORA BACKGROUND - Beautiful flowing gradient animation
// ============================================================================
interface AuroraBackgroundProps {
  colorStops?: string[];
  speed?: number;
  blur?: number;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  colorStops = ['#8b5cf6', '#6366f1', '#3b82f6', '#8b5cf6'],
  speed = 0.5,
  blur = 150
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute -inset-[100%] opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, ${colorStops[0]}40, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, ${colorStops[1]}30, transparent 50%),
            radial-gradient(ellipse 70% 60% at 40% 80%, ${colorStops[2]}35, transparent 50%),
            radial-gradient(ellipse 50% 50% at 70% 60%, ${colorStops[3]}25, transparent 50%)
          `,
          filter: `blur(${blur}px)`,
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 60 / speed, repeat: Infinity, ease: 'linear' },
          scale: { duration: 20 / speed, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
};

// ============================================================================
// PARTICLES FIELD - Floating particles animation
// ============================================================================
interface ParticlesFieldProps {
  particleCount?: number;
  color?: string;
  speed?: number;
  connectionDistance?: number;
  showConnections?: boolean;
}

export const ParticlesField: React.FC<ParticlesFieldProps> = ({
  particleCount = 50,
  color = '#8b5cf6',
  speed = 1,
  connectionDistance = 150,
  showConnections = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let animationFrameId: number;
    let mouse = { x: w / 2, y: h / 2 };

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    createParticles();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Update and draw particles
      particles.forEach((p, i) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Draw connections
        if (showConnections) {
          particles.slice(i + 1).forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = color;
              ctx.globalAlpha = (1 - dist / connectionDistance) * 0.2;
              ctx.stroke();
            }
          });

          // Connect to mouse
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance * 1.5) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = color;
            ctx.globalAlpha = (1 - dist / (connectionDistance * 1.5)) * 0.4;
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      createParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [particleCount, color, speed, connectionDistance, showConnections]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

// ============================================================================
// MATRIX RAIN - Falling code animation (improved)
// ============================================================================
interface MatrixRainProps {
  color?: string;
  charset?: string;
  fontSize?: number;
  speed?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  color = '#8b5cf6',
  charset = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789',
  fontSize = 16,
  speed = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const columns = Math.floor(w / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    let animationFrameId: number;
    let lastTime = 0;
    const frameInterval = 50 / speed;

    const draw = (time: number) => {
      if (time - lastTime > frameInterval) {
        lastTime = time;

        ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = charset[Math.floor(Math.random() * charset.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Create gradient effect for each character
          const gradient = ctx.createLinearGradient(x, y - fontSize * 10, x, y);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(0.8, color + '60');
          gradient.addColorStop(1, color);

          ctx.fillStyle = gradient;
          ctx.fillText(char, x, y);

          // Head of the stream is brighter
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8;
          ctx.fillText(char, x, y);
          ctx.globalAlpha = 1;

          if (y > h && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += 0.5;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw(0);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const newColumns = Math.floor(w / fontSize);
      drops.length = newColumns;
      for (let i = 0; i < newColumns; i++) {
        if (drops[i] === undefined) drops[i] = Math.random() * -100;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, charset, fontSize, speed]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-30" />;
};

// ============================================================================
// FAULTY TERMINAL BACKGROUND (Legacy - kept for compatibility)
// ============================================================================
interface FaultyTerminalProps {
  text?: string;
  speed?: number;
  textColor?: string;
  fadeSpeed?: number;
}

export const FaultyTerminal: React.FC<FaultyTerminalProps> = ({
  text = '01LETHRINUS_OS_SYSTEM',
  speed = 50,
  textColor = '#8b5cf6',
  fadeSpeed = 0.05
}) => {
  // Use the new ParticlesField instead
  return <ParticlesField color={textColor} particleCount={60} speed={0.5} connectionDistance={120} />;
};

// ============================================================================
// PULSE RING
// ============================================================================
export const PulseRing: React.FC<{ color?: string; size?: number }> = ({
  color = 'rgba(139, 92, 246, 0.5)',
  size = 100
}) => (
  <div className="relative" style={{ width: size, height: size }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full"
        style={{ border: `2px solid ${color}` }}
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.6,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

// ============================================================================
// FLOATING ELEMENT
// ============================================================================
export const Float: React.FC<{ children: ReactNode; className?: string; duration?: number }> = ({
  children,
  className = '',
  duration = 3
}) => (
  <motion.div
    className={className}
    animate={{ y: [0, -10, 0] }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    {children}
  </motion.div>
);

// ============================================================================
// TYPEWRITER EFFECT
// ============================================================================
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  className = '',
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle"
      />
    </span>
  );
};

// ============================================================================
// GRADIENT BORDER
// ============================================================================
export const GradientBorder: React.FC<{
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  gradient?: string;
}> = ({
  children,
  className = '',
  borderWidth = 2,
  gradient = 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #8b5cf6)'
}) => (
  <div className={`relative ${className}`}>
    <motion.div
      className="absolute inset-0 rounded-xl"
      style={{
        padding: borderWidth,
        background: gradient,
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
    <div className="relative h-full bg-[#131316] rounded-xl">
      {children}
    </div>
  </div>
);

// ============================================================================
// MODAL WRAPPER
// ============================================================================
export const ModalWrapper: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode
}> = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================================================
// CONFIRM DIALOG - Custom themed confirmation dialog
// ============================================================================
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const variantStyles = {
    danger: {
      icon: '⚠️',
      confirmBg: 'bg-red-500/20 hover:bg-red-500/30',
      confirmText: 'text-red-400',
      confirmBorder: 'border-red-500/30',
    },
    warning: {
      icon: '⚡',
      confirmBg: 'bg-amber-500/20 hover:bg-amber-500/30',
      confirmText: 'text-amber-400',
      confirmBorder: 'border-amber-500/30',
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-blue-500/20 hover:bg-blue-500/30',
      confirmText: 'text-blue-400',
      confirmBorder: 'border-blue-500/30',
    }
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 bg-[#131316] rounded-2xl w-full max-w-md p-6 border border-white/10 shadow-2xl"
          >
            <div className="text-center mb-6">
              <motion.div 
                className="text-4xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                {styles.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{message}</p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-bold uppercase transition-colors border border-white/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3 px-4 ${styles.confirmBg} ${styles.confirmText} rounded-xl text-sm font-bold uppercase transition-colors border ${styles.confirmBorder}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// LIST ITEM
// ============================================================================
export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const ListItem: React.FC<{ children: ReactNode; className?: string; index?: number }> = ({
  children,
  className = '',
  index = 0
}) => (
  <motion.div
    variants={listItemVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ delay: index * 0.05 }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================================================
// CARD HOVER EFFECT
// ============================================================================
export const CardHover: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <motion.div
    className={className}
    whileHover={{
      y: -5,
      boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.3)',
      borderColor: 'rgba(139, 92, 246, 0.3)'
    }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {children}
  </motion.div>
);

// ============================================================================
// BUTTON PRESS
// ============================================================================
export const ButtonPress: React.FC<{
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, className = '', onClick, disabled }) => (
  <motion.button
    className={className}
    onClick={onClick}
    disabled={disabled}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
  >
    {children}
  </motion.button>
);

// ============================================================================
// LOADING SPINNER
// ============================================================================
export const LoadingSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 40,
  color = '#8b5cf6'
}) => (
  <motion.div
    className="rounded-full border-4 border-t-transparent"
    style={{
      width: size,
      height: size,
      borderColor: `${color}30`,
      borderTopColor: color
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

// ============================================================================
// NOTIFICATION BADGE
// ============================================================================
export const NotificationBadge: React.FC<{ count: number }> = ({ count }) => (
  <AnimatePresence>
    {count > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    )}
  </AnimatePresence>
);

// ============================================================================
// PROGRESS BAR
// ============================================================================
export const ProgressBar: React.FC<{ progress: number; color?: string }> = ({
  progress,
  color = '#8b5cf6'
}) => (
  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{ backgroundColor: color }}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </div>
);

// ============================================================================
// SKELETON LOADER
// ============================================================================
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    className={`bg-white/5 rounded ${className}`}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
  />
);

// ============================================================================
// CONFETTI EXPLOSION
// ============================================================================
export const ConfettiExplosion: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: colors[i % colors.length],
              }}
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 500,
                y: (Math.random() - 0.5) * 500,
                scale: [0, 1, 0],
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// CYBER CAT - Animated cat mascot with eyes following mouse
// ============================================================================
interface CyberCatProps {
  isPasswordFocused?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
  showDialogue?: boolean;
}

export const CyberCat: React.FC<CyberCatProps> = ({
  isPasswordFocused = false,
  size = 120,
  className = '',
  onClick,
  showDialogue = false
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [dialogue, setDialogue] = useState('Mrrp?');
  const catRef = useRef<HTMLDivElement>(null);

  const catDialogues = [
    'Mrrp!',
    '*purrs*',
    'Meow~',
    'System purr-fect!',
    '*blinks slowly*',
    'Nya~',
    'Access granted, hooman.',
    '*stretches*',
    'Debug complete!',
    '01001101 01100101 01101111 01110111',
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (catRef.current) {
        const rect = catRef.current.getBoundingClientRect();
        const catCenterX = rect.left + rect.width / 2;
        const catCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - catCenterX;
        const deltaY = e.clientY - catCenterY;

        // Limit eye movement
        const maxMove = 8;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 20, maxMove) : 0;
        const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 20, maxMove) : 0;

        setMousePos({ x: normalizedX, y: normalizedY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClick = () => {
    const randomDialogue = catDialogues[Math.floor(Math.random() * catDialogues.length)];
    setDialogue(randomDialogue);
    setIsHovered(true);
    setTimeout(() => setIsHovered(false), 2500);
    onClick?.();
  };

  const scale = size / 120;

  return (
    <motion.div
      ref={catRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !showDialogue && setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      {/* Dialogue Bubble */}
      <AnimatePresence>
        {(isHovered || showDialogue) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-violet-600/90 text-white text-xs font-mono py-2 px-3 rounded-lg shadow-lg whitespace-nowrap backdrop-blur-sm border border-violet-400/30 z-10"
          >
            {dialogue}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-violet-600/90 border-r border-b border-violet-400/30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat SVG */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Glow Effect */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="earGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Ears */}
        <motion.path
          d="M25 45 L35 15 L50 40 Z"
          fill="url(#earGradient)"
          stroke="#c4b5fd"
          strokeWidth="1"
          animate={{ rotate: isHovered ? [0, -5, 0] : 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: '37px 30px' }}
        />
        <motion.path
          d="M95 45 L85 15 L70 40 Z"
          fill="url(#earGradient)"
          stroke="#c4b5fd"
          strokeWidth="1"
          animate={{ rotate: isHovered ? [0, 5, 0] : 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: '83px 30px' }}
        />

        {/* Inner Ears */}
        <path d="M30 42 L37 22 L47 38 Z" fill="#1e1b4b" opacity="0.5" />
        <path d="M90 42 L83 22 L73 38 Z" fill="#1e1b4b" opacity="0.5" />

        {/* Head */}
        <motion.ellipse
          cx="60"
          cy="60"
          rx="40"
          ry="35"
          fill="url(#catGradient)"
          stroke="#c4b5fd"
          strokeWidth="1.5"
          filter="url(#glow)"
          animate={{
            scale: isHovered ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Face Pattern */}
        <ellipse cx="60" cy="65" rx="25" ry="20" fill="#1e1b4b" opacity="0.2" />

        {/* Eyes Container */}
        <g>
          {/* Left Eye */}
          <ellipse cx="45" cy="55" rx="12" ry="10" fill="#0f0a1e" />
          {!isPasswordFocused && (
            <>
              <motion.ellipse
                cx="45"
                cy="55"
                rx="8"
                ry="8"
                fill="#8b5cf6"
                animate={{
                  cx: 45 + mousePos.x,
                  cy: 55 + mousePos.y
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              />
              <motion.ellipse
                cx="45"
                cy="55"
                rx="4"
                ry="4"
                fill="#0f0a1e"
                animate={{
                  cx: 45 + mousePos.x,
                  cy: 55 + mousePos.y
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              />
              <motion.ellipse
                cx="47"
                cy="53"
                rx="2"
                ry="2"
                fill="white"
                animate={{
                  cx: 47 + mousePos.x * 0.5,
                  cy: 53 + mousePos.y * 0.5
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              />
            </>
          )}

          {/* Right Eye */}
          <ellipse cx="75" cy="55" rx="12" ry="10" fill="#0f0a1e" />
          {!isPasswordFocused && (
            <>
              <motion.ellipse
                cx="75"
                cy="55"
                rx="8"
                ry="8"
                fill="#8b5cf6"
                animate={{
                  cx: 75 + mousePos.x,
                  cy: 55 + mousePos.y
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              />
              <motion.ellipse
                cx="75"
                cy="55"
                rx="4"
                ry="4"
                fill="#0f0a1e"
                animate={{
                  cx: 75 + mousePos.x,
                  cy: 55 + mousePos.y
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              />
              <motion.ellipse
                cx="77"
                cy="53"
                rx="2"
                ry="2"
                fill="white"
                animate={{
                  cx: 77 + mousePos.x * 0.5,
                  cy: 53 + mousePos.y * 0.5
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              />
            </>
          )}
        </g>

        {/* PAWS - Cover eyes when password focused */}
        <AnimatePresence>
          {isPasswordFocused && (
            <>
              {/* Left Paw */}
              <motion.g
                initial={{ y: 40, opacity: 0, rotate: -10 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 40, opacity: 0, rotate: -10 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              >
                {/* Paw base */}
                <ellipse cx="42" cy="55" rx="18" ry="14" fill="#a78bfa" />
                {/* Paw pad main */}
                <ellipse cx="42" cy="58" rx="10" ry="7" fill="#ddd6fe" />
                {/* Paw pad beans */}
                <ellipse cx="35" cy="52" rx="4" ry="3" fill="#ddd6fe" />
                <ellipse cx="42" cy="49" rx="4" ry="3" fill="#ddd6fe" />
                <ellipse cx="49" cy="52" rx="4" ry="3" fill="#ddd6fe" />
                {/* Paw outline */}
                <ellipse cx="42" cy="55" rx="18" ry="14" fill="none" stroke="#c4b5fd" strokeWidth="1" />
              </motion.g>

              {/* Right Paw */}
              <motion.g
                initial={{ y: 40, opacity: 0, rotate: 10 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 40, opacity: 0, rotate: 10 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.05 }}
              >
                {/* Paw base */}
                <ellipse cx="78" cy="55" rx="18" ry="14" fill="#a78bfa" />
                {/* Paw pad main */}
                <ellipse cx="78" cy="58" rx="10" ry="7" fill="#ddd6fe" />
                {/* Paw pad beans */}
                <ellipse cx="71" cy="52" rx="4" ry="3" fill="#ddd6fe" />
                <ellipse cx="78" cy="49" rx="4" ry="3" fill="#ddd6fe" />
                <ellipse cx="85" cy="52" rx="4" ry="3" fill="#ddd6fe" />
                {/* Paw outline */}
                <ellipse cx="78" cy="55" rx="18" ry="14" fill="none" stroke="#c4b5fd" strokeWidth="1" />
              </motion.g>
            </>
          )}
        </AnimatePresence>

        {/* Nose */}
        <path d="M57 68 L60 72 L63 68 Z" fill="#f0abfc" />

        {/* Mouth */}
        <motion.path
          d="M50 76 Q55 80 60 76 Q65 80 70 76"
          stroke="#f0abfc"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isHovered
              ? "M50 76 Q55 82 60 76 Q65 82 70 76"
              : "M50 76 Q55 80 60 76 Q65 80 70 76"
          }}
        />

        {/* Whiskers */}
        <g stroke="#c4b5fd" strokeWidth="1" opacity="0.6">
          <motion.line x1="20" y1="60" x2="35" y2="62" animate={{ x1: isHovered ? 15 : 20 }} />
          <motion.line x1="20" y1="68" x2="35" y2="68" animate={{ x1: isHovered ? 15 : 20 }} />
          <motion.line x1="20" y1="76" x2="35" y2="74" animate={{ x1: isHovered ? 15 : 20 }} />
          <motion.line x1="100" y1="60" x2="85" y2="62" animate={{ x1: isHovered ? 105 : 100 }} />
          <motion.line x1="100" y1="68" x2="85" y2="68" animate={{ x1: isHovered ? 105 : 100 }} />
          <motion.line x1="100" y1="76" x2="85" y2="74" animate={{ x1: isHovered ? 105 : 100 }} />
        </g>

        {/* Tech Lines */}
        <g stroke="#a78bfa" strokeWidth="0.5" opacity="0.4">
          <path d="M25 50 L20 45" />
          <path d="M95 50 L100 45" />
          <circle cx="60" cy="40" r="2" fill="#a78bfa" />
        </g>
      </svg>

      {/* Floating particles around cat */}
      <motion.div
        className="absolute -top-2 -left-2 w-2 h-2 rounded-full bg-violet-400/50"
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-1 -right-3 w-1.5 h-1.5 rounded-full bg-blue-400/50"
        animate={{
          y: [0, -8, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute top-1/2 -right-2 w-1 h-1 rounded-full bg-violet-300/50"
        animate={{
          x: [0, 5, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </motion.div>
  );
};

// ============================================================================
// SHIMMER EFFECT - ReactBits inspired
// ============================================================================
export const Shimmer: React.FC<{
  children: ReactNode;
  className?: string;
  duration?: number;
}> = ({ children, className = '', duration = 2 }) => (
  <div className={`relative overflow-hidden ${className}`}>
    {children}
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ translateX: ['0%', '200%'] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  </div>
);

// ============================================================================
// BORDER GLOW - Animated border glow effect (Optimized)
// ============================================================================
export const BorderGlow: React.FC<{
  children: ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
}> = ({ children, className = '', color = '#8b5cf6', intensity = 0.5 }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const opacity = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    opacity.set(1);
  };

  const handleMouseLeave = () => {
    opacity.set(0);
  };

  const mouseXSpring = useSpring(mouseX, { stiffness: 500, damping: 50 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 500, damping: 50 });
  const opacitySpring = useSpring(opacity, { stiffness: 300, damping: 30 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className} will-change-transform`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mouseXSpring}px ${mouseYSpring}px, ${color}${Math.floor(intensity * 255).toString(16)}, transparent 40%)`,
          opacity: opacitySpring,
          filter: 'blur(20px)',
          willChange: 'opacity, background-position',
        }}
      />
      <div className="relative border border-white/10 rounded-xl bg-black/20 backdrop-blur-sm">
        {children}
      </div>
    </motion.div>
  );
};

// ============================================================================
// GRADIENT TEXT - Animated gradient text
// ============================================================================
export const GradientText: React.FC<{
  text: string;
  className?: string;
  gradient?: string[];
  speed?: number;
}> = ({ text, className = '', gradient = ['#8b5cf6', '#3b82f6', '#10b981'], speed = 3 }) => (
  <motion.span
    className={`bg-clip-text text-transparent bg-gradient-to-r ${className}`}
    style={{
      backgroundImage: `linear-gradient(90deg, ${gradient.join(', ')})`,
      backgroundSize: '200% auto',
    }}
    animate={{ backgroundPosition: ['0% center', '200% center', '0% center'] }}
    transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
  >
    {text}
  </motion.span>
);

// ============================================================================
// TILT CARD - 3D tilt effect on hover (Optimized for performance)
// ============================================================================
export const TiltCard: React.FC<{
  children: ReactNode;
  className?: string;
  intensity?: number;
}> = ({ children, className = '', intensity = 15 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const rotateXSpring = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const rotateYSpring = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateXValue = ((e.clientY - centerY) / rect.height) * intensity;
    const rotateYValue = ((centerX - e.clientX) / rect.width) * intensity;
    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} will-change-transform`}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// BLUR REVEAL - Blur to reveal animation
// ============================================================================
export const BlurReveal: React.FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className = '', delay = 0, duration = 0.8 }) => (
  <motion.div
    className={className}
    initial={{ filter: 'blur(10px)', opacity: 0 }}
    animate={{ filter: 'blur(0px)', opacity: 1 }}
    transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

// ============================================================================
// RIPPLE BUTTON - Ripple effect on click
// ============================================================================
export const RippleButton: React.FC<{
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, className = '', onClick, disabled }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.();
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          animate={{
            width: 300,
            height: 300,
            x: -150,
            y: -150,
            opacity: [0.5, 0],
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </button>
  );
};

// ============================================================================
// FLIP CARD - 3D flip card animation
// ============================================================================
export const FlipCard: React.FC<{
  front: ReactNode;
  back: ReactNode;
  className?: string;
  flipOnHover?: boolean;
}> = ({ front, back, className = '', flipOnHover = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => flipOnHover && setIsFlipped(true)}
      onMouseLeave={() => flipOnHover && setIsFlipped(false)}
      onClick={() => !flipOnHover && setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
          {front}
        </div>
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MORPHING BLOB - Animated blob shape
// ============================================================================
export const MorphingBlob: React.FC<{
  className?: string;
  color?: string;
  size?: number;
  speed?: number;
}> = ({ className = '', color = '#8b5cf6', size = 400, speed = 20 }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const animate = () => {
      const points = Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = size / 2 + Math.sin(Date.now() / speed + i) * 50;
        const x = Math.cos(angle) * radius + size / 2;
        const y = Math.sin(angle) * radius + size / 2;
        return { x, y };
      });

      const pathData = `M ${points[0].x} ${points[0].y} ${points
        .slice(1)
        .map((p, i) => {
          const next = points[(i + 2) % points.length];
          return `Q ${points[i + 1].x} ${points[i + 1].y} ${(p.x + next.x) / 2} ${(p.y + next.y) / 2}`;
        })
        .join(' ')} Z`;

      if (pathRef.current) {
        pathRef.current.setAttribute('d', pathData);
      }
      requestAnimationFrame(animate);
    };

    animate();
  }, [size, speed]);

  return (
    <svg width={size} height={size} className={className}>
      <defs>
        <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        fill="url(#blobGradient)"
        filter="blur(40px)"
      />
    </svg>
  );
};

// ============================================================================
// SCROLL PROGRESS - Scroll progress indicator
// ============================================================================
export const ScrollProgress: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#8b5cf6',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setProgress(progress);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial calculation
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 z-50 ${className}`}
      style={{ 
        backgroundColor: color,
        transformOrigin: 'left',
        scaleX: progress / 100 
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress / 100 }}
      transition={{ duration: 0.1 }}
    />
  );
};

// ============================================================================
// GLASSMORPHISM CARD - Glass effect card
// ============================================================================
export const GlassCard: React.FC<{
  children: ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  hoverScale?: boolean;
}> = ({ children, className = '', blur = 10, opacity = 0.1, hoverScale = false }) => (
  <motion.div
    className={`backdrop-blur-md border border-white/20 rounded-xl ${className}`}
    style={{
      background: `rgba(255, 255, 255, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
    }}
    whileHover={hoverScale ? { borderColor: 'rgba(255, 255, 255, 0.4)', scale: 1.02 } : { borderColor: 'rgba(255, 255, 255, 0.4)' }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// ============================================================================
// COUNTER ANIMATION - Animated number counter
// ============================================================================
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
}> = ({ value, duration = 1, className = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startValue = displayValue;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(startValue + (endValue - startValue) * easeOutQuart);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{displayValue.toFixed(decimals)}</span>;
};