import { motion } from "framer-motion";

export default function Card({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        transition: {
          duration: 0.2,
        },
      }}
      className={`
        rounded-xl
        border
        border-slate-800
        bg-slate-900
        shadow-md
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}