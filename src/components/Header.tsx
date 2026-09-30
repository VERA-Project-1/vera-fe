"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Research" },
  { href: "/audio", label: "Audio" },
];

// Served straight from public/; the filename is case-sensitive.
const PAPER = {
  href: "/Submission.pdf",
  title: "Exploring Speech Emotion Recognition: From First Principles to State-of-the-Art Techniques",
};

// Training code and experiments behind the deployed model.
const MODELS_REPO = "https://github.com/VERA-Project-1/vera-system-models";

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  const teamActive = isActive("/team");

  return (
    <header className="bg-white/80 backdrop-blur-xl text-[#1a1c1d] font-['Manrope'] text-sm tracking-tight font-medium fixed top-0 w-full z-50 border-b border-[#e2e2e4] shadow-none">
      <div className="max-w-[1440px] mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 md:px-8 h-16">
        {/* Brand */}
        <Link href="/" className="text-xl font-bold tracking-tighter text-[#1a1c1d] hover:opacity-80 transition-opacity">
          VERA
        </Link>

        {/* Centered Navigation */}
        <nav className="flex justify-center items-center gap-1 md:gap-6" aria-label="Main">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`transition-all duration-200 active:scale-[0.98] cursor-pointer text-[13px] md:text-sm ${
                  active
                    ? "text-[#1a1c1d] border-b-2 border-[#1a1c1d] font-semibold py-1 px-2 md:px-0"
                    : "text-[#77767b] hover:text-[#1a1c1d] hover:bg-[#f3f3f5] px-2 md:px-3 py-2 rounded-lg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Highlighted tab */}
          <Link
            href="/team"
            aria-current={teamActive ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1.5 text-[13px] md:text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
              teamActive
                ? "bg-secondary text-white shadow-[0_4px_14px_rgba(0,92,186,0.35)]"
                : "bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary hover:text-white hover:shadow-[0_4px_14px_rgba(0,92,186,0.35)]"
            }`}
          >
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18 }} aria-hidden>
              groups
            </span>
            <span className="hidden sm:inline">Meet the team</span>
            <span className="sm:hidden">Team</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Model training code */}
          <a
            href={MODELS_REPO}
            target="_blank"
            rel="noopener noreferrer"
            title="Model training code on GitHub (vera-system-models)"
            aria-label="Model training code on GitHub (opens in a new tab)"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e2e4] bg-white px-2.5 md:px-3 py-2 text-[#1a1c1d] hover:border-[#1a1c1d] hover:bg-[#f3f3f5] transition-colors"
          >
            <svg viewBox="0 0 16 16" width={18} height={18} fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="hidden lg:inline font-semibold">Code</span>
          </a>

          {/* Research paper */}
          <a
            href={PAPER.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Read the paper: ${PAPER.title} (PDF)`}
            aria-label="Read the research paper (PDF, opens in a new tab)"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e2e4] bg-white px-2.5 md:px-3 py-2 text-[#1a1c1d] hover:border-[#1a1c1d] hover:bg-[#f3f3f5] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden>
              article
            </span>
            <span className="hidden lg:inline font-semibold">Paper</span>
            <span className="hidden lg:inline text-[11px] font-bold text-[#77767b] border border-[#e2e2e4] rounded px-1 py-px">PDF</span>
          </a>
        </div>
      </div>
    </header>
  );
}
