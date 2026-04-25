import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-[#e2e2e4] bg-[#F5F5F7] text-[#77767b] font-['Manrope'] text-xs tracking-normal mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-4">
        <div className="font-bold text-[#1a1c1d]">
          © 2024 VERA. Clinical Precision in Speech Analysis.
        </div>
        <div className="flex gap-6">
          <Link
            href="#"
            className="text-[#77767b] hover:text-[#1a1c1d] underline transition-all"
          >
            Documentation
          </Link>
          <Link
            href="#"
            className="text-[#77767b] hover:text-[#1a1c1d] underline transition-all"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-[#77767b] hover:text-[#1a1c1d] underline transition-all"
          >
            Terms
          </Link>
          <Link
            href="#"
            className="text-[#77767b] hover:text-[#1a1c1d] underline transition-all"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
