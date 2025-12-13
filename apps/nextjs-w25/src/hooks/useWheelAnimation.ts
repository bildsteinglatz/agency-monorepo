import { useRef, useEffect } from 'react';

interface WheelAnimationOptions {
  speed: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export function useWheelAnimation({ speed, svgRef }: WheelAnimationOptions) {
  const wheelState = useRef({
    isAnimating: false,
    startTime: 0,
    startAngle: 0,
    speed,
  });
  const animRef = useRef<number | null>(null);

  // Extract rotation angle from transform string
  const extractRotationAngle = (transformStr: string): number => {
    if (!transformStr || transformStr === 'none') return 0;
    const rotateMatch = transformStr.match(/rotate\(([0-9.-]+)deg\)/);
    if (rotateMatch && rotateMatch[1]) {
      return parseFloat(rotateMatch[1]);
    }
    return 0;
  };

  // Main animation function (always clockwise)
  const animateWheel = (timestamp: number) => {
    if (!svgRef.current || !wheelState.current.isAnimating) {
      animRef.current = requestAnimationFrame(animateWheel);
      return;
    }
    const elapsed = timestamp - wheelState.current.startTime;
    const degreesPerSecond = 360 / Math.max(0.5, wheelState.current.speed);
    const rotation = (wheelState.current.startAngle + (elapsed * degreesPerSecond / 1000)) % 360;
    svgRef.current.style.transform = `rotate(${rotation}deg)`;
    animRef.current = requestAnimationFrame(animateWheel);
  };

  // Update speed and preserve current angle
  const updateAnimationSpeed = (targetSpeed: number) => {
    if (!svgRef.current) return;
    const currentAngleValue = extractRotationAngle(svgRef.current.style.transform || 'rotate(0deg)');
    wheelState.current.startTime = performance.now();
    wheelState.current.startAngle = currentAngleValue;
    wheelState.current.speed = targetSpeed;
  };

  useEffect(() => {
    wheelState.current.isAnimating = true;
    wheelState.current.startTime = performance.now();
    wheelState.current.speed = speed;
    animRef.current = requestAnimationFrame(animateWheel);
    return () => {
      wheelState.current.isAnimating = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  return { updateAnimationSpeed };
}
