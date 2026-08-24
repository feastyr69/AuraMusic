import React from "react";
import { motion } from "motion/react";

export default function Card({ title, description, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      className="w-full group"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ delay, duration: 0.32, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <div className="w-full h-full min-h-[200px] bg-white/4 backdrop-blur-xl border border-white/8 shadow-[0_12px_40px_rgba(0,0,0,0.35)] p-8 rounded-2xl m-auto transition-colors duration-300 hover:border-aura-400/25 hover:bg-white/5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-aura-400/10 border border-aura-400/25 text-aura-400 mb-5 group-hover:bg-aura-400/15 transition-colors">
          {Icon ? <Icon className="size-5" aria-hidden /> : null}
        </div>
        <h2 className="font-display font-semibold text-lg text-zinc-100 tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
