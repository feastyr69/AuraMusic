import React from "react";
import { IoRadioOutline, IoSyncOutline, IoChatbubblesOutline } from "react-icons/io5";
import Card from "./Card";

const items = [
  {
    title: "Create a room",
    description:
      "Spin up a public listening room in seconds. Share the link so friends can jump in and hear the same moment.",
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
  return (
    <section className="w-full mt-16 md:mt-24 pb-20 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
            Built for listening together
          </h2>
          <p className="mt-3 text-zinc-500 text-sm md:text-base max-w-xl mx-auto">
            Everything you need for a shared session without leaving the music.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((item) => (
            <Card
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
