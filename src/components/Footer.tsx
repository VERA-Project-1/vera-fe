import Link from "next/link";
import { INSTITUTION, SPONSOR } from "@/lib/credits";

export default function Footer() {
  return (
    <footer className="w-full py-10 border-t border-[#e2e2e4] bg-[#F5F5F7] text-[#77767b] font-['Manrope'] text-xs tracking-normal mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3 px-8 text-center md:text-left">
        <div className="font-bold text-[#1a1c1d]">© 2026 VERA. Clinical Precision in Speech Analysis.</div>
        <div>
          Final-year project,{" "}
          <a href={INSTITUTION.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1a1c1d] underline underline-offset-2">
            {INSTITUTION.shortName}
          </a>{" "}
          · Sponsored by{" "}
          <a href={SPONSOR.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1a1c1d] underline underline-offset-2">
            {SPONSOR.name}
          </a>{" "}
          ·{" "}
          <Link href="/team" className="font-semibold text-[#1a1c1d] underline underline-offset-2">
            Meet the team
          </Link>
        </div>
      </div>
    </footer>
  );
}
