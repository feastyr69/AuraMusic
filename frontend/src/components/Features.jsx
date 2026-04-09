import React from "react";
import { IoRadioOutline, IoSyncOutline, IoChatbubblesOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import Card from "./Card";
import { motion } from "motion/react";
import { IoPlayCircleOutline, IoSparklesOutline } from "react-icons/io5";

const items = [
  {
    title: "Create a room",
    description:
      "No sign-in required. Share the link so that your friends can jump in and hear the same moment.",
    icon: IoRadioOutline,
  },
  {
    title: "Synced playback",
    description:
      "Play, pause, and seek stay aligned for everyone in the session, no more counting down to press play.",
    icon: IoSyncOutline,
  },
  {
    title: "Queue & chat",
    description:
      "Search tracks, build the queue together, and keep the vibe going with room chat beside the player.",
    icon: IoChatbubblesOutline,
  },
];

export default function Features() {
  const stats = [
    { label: "Avg room setup", value: "< 10 sec" },
    { label: "Playback state", value: "Real-time sync" },
    { label: "Collaboration", value: "Queue + chat" },
  ];

  return (
    <>
      <motion.section
        className="w-full mt-16 md:mt-24 pb-20 px-6 lg:px-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.35 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
              Flex your music-taste with Friends
            </h2>
            <p className="mt-3 text-zinc-500 text-sm md:text-base max-w-xl mx-auto">
              Everything you need for a shared session without leaving the music.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {items.map((item, index) => (
              <Card
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </motion.section>
      <section className="w-full px-6 lg:px-12 pb-20">
        <motion.div
          className="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl p-8 md:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-aura-300 mb-3">
                POWERED BY YT MUSIC
              </p>
              <h3 className="font-display text-3xl md:text-4xl font-semibold text-zinc-100 tracking-tight">
                Built for communities, friend groups, and live listening sessions.
              </h3>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Host a room that feels reliable and fast. Everyone gets the same
                timeline, shared queue controls, and live chat in one interface.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-aura-400 text-zinc-950 font-semibold text-sm hover:bg-aura-300 transition-colors"
                >
                  <IoPlayCircleOutline className="size-5" />
                  Launch a room
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 border border-white/15 text-zinc-100 font-medium text-sm bg-white/3 hover:bg-white/6 transition-colors"
                >
                  <IoSparklesOutline className="size-5" />
                  Join the platform
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl border border-white/8 bg-black/20 p-5"
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.08, duration: 0.35 }}
                  whileHover={{ y: -3 }}
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-zinc-100">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
