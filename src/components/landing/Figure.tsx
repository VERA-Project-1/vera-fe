import Image from "next/image";

interface FigureProps {
  src: string;
  width: number;
  height: number;
  title: string;
  caption: string;
  label?: string;
  className?: string;
}

// A captioned diagram on a white card; clicking it opens the full-resolution image.
export default function Figure({ src, width, height, title, caption, label, className = "" }: FigureProps) {
  return (
    <figure className={`rounded-2xl bg-white border border-outline-variant overflow-hidden flex flex-col ${className}`}>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block p-4 md:p-6 border-b border-outline-variant/60"
        aria-label={`Open ${title} at full size`}
      >
        <Image src={src} alt={`${title} diagram`} width={width} height={height} className="w-full h-auto" sizes="(min-width: 1440px) 1376px, 100vw" />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 border border-outline-variant px-2.5 py-1 text-[12px] font-semibold text-on-surface-variant opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
            open_in_full
          </span>
          Full size
        </span>
      </a>
      <figcaption className="p-5 md:p-6">
        {label && <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-secondary">{label}</span>}
        <div className="text-[17px] font-bold tracking-tight text-on-surface">{title}</div>
        <p className="mt-1 text-[14px] leading-relaxed text-on-surface-variant">{caption}</p>
      </figcaption>
    </figure>
  );
}
