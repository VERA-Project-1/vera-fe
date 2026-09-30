import Image from "next/image";
import { PUBLICATION } from "@/lib/research";

export default function Publication() {
  return (
    <section id="publication" className="scroll-mt-16 max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-success-container px-3 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-[#166534]">
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 16 }} aria-hidden>
              verified
            </span>
            {PUBLICATION.status}
          </span>
          <h2 className="mt-5 text-[36px] md:text-[52px] leading-[1.02] tracking-[-0.035em] font-extrabold">
            Accepted at <span className="whitespace-nowrap">{PUBLICATION.shortName}.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-[1.7] text-on-surface-variant">
            The research behind VERA passed peer review and was accepted for publication and presentation at the{" "}
            <strong className="text-on-surface">{PUBLICATION.conference}</strong>.
          </p>

          <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <dt className="text-[13px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Organised by</dt>
              <dd className="mt-1 text-[15px] font-semibold text-on-surface leading-snug">{PUBLICATION.organizer}</dd>
            </div>
            <div>
              <dt className="text-[13px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Conference dates</dt>
              <dd className="mt-1 text-[15px] font-semibold text-on-surface">{PUBLICATION.dates}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Conference tracks</div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {PUBLICATION.tracks.map((t) => (
                <li key={t} className="px-3 py-1.5 rounded-full bg-white border border-outline-variant text-[13px] font-semibold text-on-surface-variant">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/Submission.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-[#030304] text-white px-6 py-3.5 rounded-full text-[15px] font-bold hover:bg-[#2f3032] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden>
              article
            </span>
            Read the paper (PDF)
          </a>
        </div>

        <figure className="lg:col-span-6 order-1 lg:order-2">
          <Image
            src={PUBLICATION.photo.src}
            alt={`The VERA team at ${PUBLICATION.shortName}`}
            width={PUBLICATION.photo.width}
            height={PUBLICATION.photo.height}
            className="w-full h-auto rounded-2xl border border-outline-variant"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <figcaption className="mt-3 text-[13px] text-on-surface-variant">
            The team at {PUBLICATION.shortName}, {PUBLICATION.dates}.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
