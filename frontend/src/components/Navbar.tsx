import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const navLink =
  "text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-aura-300";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
            <AnimatePresence>
              {user ? (
                <li className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-white/[0.1] hover:border-aura-400/50 transition-all focus:outline-none"
                  >
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-6 w-32 flex flex-col py-2 bg-zinc-900 border border-white/[0.1] shadow-2xl rounded-xl overflow-hidden z-50">
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent onBlur from firing before click
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-aura-300 transition-colors"
                      >
                        Log out
                      </button>
                    </motion.div>
                  )}
                </li>
              ) : (
                <>
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
                </>
              )}
            </AnimatePresence>
          </ul>
        </nav>
      </div>
    </header>
  );
}
