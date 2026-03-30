import React from "react";
import { Link, useLocation } from "react-router-dom";

const navLink =
  "text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-aura-300";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `${navLink} ${pathname === path ? "text-aura-400" : ""}`;

  return (
    <header className="w-full flex justify-center items-center h-24 md:h-28 pt-4 relative z-20 px-4">
      <div className="w-full max-w-6xl flex justify-between items-center min-h-14 md:min-h-16 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] px-5 md:px-8 border border-white/[0.08] rounded-full">
        <Link to="/" className="flex flex-col items-start justify-center gap-0.5 shrink-0">
          <span className="font-display font-semibold text-xl md:text-2xl tracking-tight text-zinc-100">
            aura<span className="text-aura-400">.</span>
          </span>
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Listen together
          </span>
        </Link>
        <nav className="h-full flex items-center">
          <ul className="flex list-none gap-4 md:gap-8 items-center">
            <li>
              <Link to="/" className={linkClass("/")}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/create" className={linkClass("/create")}>
                Rooms
              </Link>
            </li>
            <li className="hidden sm:list-item">
              <Link to="/login" className={linkClass("/login")}>
                Log in
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-aura-400/15 border border-aura-400/35 text-aura-300 text-sm font-medium px-4 py-2 hover:bg-aura-400/25 hover:border-aura-400/50 transition-colors"
              >
                Join
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
