import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  label: string;
  index: number;
}

const AnimatedCounter = ({ value, label, index }: AnimatedCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric part and suffix
    const match = value.match(/^([<>]?)(\d+\.?\d*)(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1];
    const num = parseFloat(match[2]);
    const suffix = match[3];
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;

      if (num % 1 !== 0) {
        setDisplayValue(`${prefix}${current.toFixed(1)}${suffix}`);
      } else {
        setDisplayValue(`${prefix}${Math.round(current)}${suffix}`);
      }

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-glow"
    >
      <div className="text-2xl md:text-3xl font-bold color-cycle">{displayValue}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
};

export default AnimatedCounter;
