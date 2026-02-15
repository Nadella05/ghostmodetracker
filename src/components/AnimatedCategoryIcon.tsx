import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { HabitCategory } from '@/types/habit';
import { useHabitContext } from '@/contexts/HabitContext';

interface AnimatedCategoryIconProps {
  category: HabitCategory;
  className?: string;
  size?: number;
}

// SVG path animations for each category
const CATEGORY_ANIMATIONS: Record<HabitCategory, { paths: string[]; viewBox: string; color: string }> = {
  health: {
    viewBox: '0 0 24 24',
    color: 'hsl(347, 77%, 50%)',
    paths: [
      'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    ],
  },
  study: {
    viewBox: '0 0 24 24',
    color: 'hsl(217, 91%, 60%)',
    paths: [
      'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
      'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    ],
  },
  finance: {
    viewBox: '0 0 24 24',
    color: 'hsl(38, 92%, 50%)',
    paths: [
      'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    ],
  },
  personal: {
    viewBox: '0 0 24 24',
    color: 'hsl(45, 93%, 58%)',
    paths: [
      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    ],
  },
  work: {
    viewBox: '0 0 24 24',
    color: 'hsl(215, 16%, 47%)',
    paths: [
      'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    ],
  },
  fitness: {
    viewBox: '0 0 24 24',
    color: 'hsl(142, 76%, 36%)',
    paths: [
      'M6.5 6.5h11M4 10h16M6.5 17.5h11M4 14h16M9 6.5v11M15 6.5v11',
    ],
  },
  mindfulness: {
    viewBox: '0 0 24 24',
    color: 'hsl(262, 83%, 58%)',
    paths: [
      'M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z',
    ],
  },
  social: {
    viewBox: '0 0 24 24',
    color: 'hsl(189, 94%, 43%)',
    paths: [
      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
      'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    ],
  },
};

export function AnimatedCategoryIcon({ category, className, size = 20 }: AnimatedCategoryIconProps) {
  const { isGhostMode } = useHabitContext();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();
  const config = CATEGORY_ANIMATIONS[category];

  useEffect(() => {
    if (!svgRef.current || isGhostMode) return;

    const paths = svgRef.current.querySelectorAll('path');
    let progress = 0;
    
    const animate = () => {
      progress += 0.02;
      if (progress > 1) progress = 0;
      
      paths.forEach((path, i) => {
        const length = path.getTotalLength();
        const offset = Math.sin(progress * Math.PI * 2 + i * 0.5) * 2;
        path.style.strokeDashoffset = `${offset}`;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize stroke dash
    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = '0';
    });

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGhostMode]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={config.viewBox}
      fill="none"
      stroke={isGhostMode ? 'currentColor' : config.color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'transition-colors',
        isGhostMode && 'text-muted-foreground',
        className
      )}
    >
      {config.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
