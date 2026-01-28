"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="w-full h-[50vh] flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="w-5 h-5 border-[1.5px] border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
