"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/audio", label: "Audio" },
  { href: "/video", label: "Video" },
  { href: "/history", label: "History" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white/80 backdrop-blur-xl text-[#1a1c1d] font-['Manrope'] text-sm tracking-tight font-medium fixed top-0 w-full z-50 border-b border-[#e2e2e4] shadow-none">
      <div className="max-w-[1440px] mx-auto grid grid-cols-3 items-center px-8 h-16">
        {/* Brand */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-xl font-bold tracking-tighter text-[#1a1c1d] hover:opacity-80 transition-opacity"
          >
            VERA
          </Link>
        </div>

        {/* Centered Navigation */}
        <nav className="flex justify-center gap-8 hidden md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-200 active:scale-[0.98] cursor-pointer py-1 ${
                  isActive
                    ? "text-[#1a1c1d] border-b-2 border-[#1a1c1d] font-semibold"
                    : "text-[#77767b] hover:text-[#1a1c1d] hover:bg-[#f3f3f5] px-3 py-2 rounded-lg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            className="p-2 text-[#77767b] hover:text-[#1a1c1d] transition-colors rounded-full hover:bg-[#f3f3f5] active:scale-[0.98]"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined block text-[20px]">
              notifications
            </span>
          </button>
          <button
            className="p-2 text-[#77767b] hover:text-[#1a1c1d] transition-colors rounded-full hover:bg-[#f3f3f5] active:scale-[0.98]"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined block text-[20px]">
              settings
            </span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant ml-2">
            <div className="w-full h-full bg-gradient-to-br from-[#5095fe] to-[#005cba] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
