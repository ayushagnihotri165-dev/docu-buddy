import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/30"
                initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, scale: 0 }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
                transition={{ delay: 0.8 + i * 0.05, duration: 1.2, ease: "easeOut" }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center gap-6">
            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative"
            >
              <motion.div
                animate={{ boxShadow: ["0 0 0px hsl(160 84% 39% / 0)", "0 0 60px hsl(160 84% 39% / 0.4)", "0 0 30px hsl(160 84% 39% / 0.2)"] }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center"
              >
                <FileText className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="absolute inset-0 rounded-2xl border-2 border-primary"
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold tracking-tight font-['Space_Grotesk']">
                <span className="text-gradient-primary">Doc</span>Analyzer
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : {}}
                transition={{ duration: 0.4 }}
                className="text-sm text-muted-foreground mt-2"
              >
                AI-Powered Document Intelligence
              </motion.p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={phase >= 1 ? { opacity: 1, width: 160 } : {}}
              className="h-1 rounded-full bg-secondary overflow-hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={phase >= 1 ? { x: "100%" } : {}}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="h-full w-full bg-gradient-primary rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
