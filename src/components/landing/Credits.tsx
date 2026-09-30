import Image from "next/image";
import { INSTITUTION, MENTORS, PROJECT_CONTEXT, SPONSOR, TEAM, initials, type Person } from "@/lib/credits";

function LinkedInLink({ href, name }: { href: string; name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on LinkedIn`}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold bg-white/10 text-white hover:bg-white hover:text-black transition-colors"
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-[3px] bg-current" aria-hidden>
        <span className="text-[10px] font-extrabold leading-none text-[#030304]">in</span>
      </span>
      LinkedIn
    </a>
  );
}

function Avatar({ person, size }: { person: Person; size: number }) {
  if (person.photo) {
    return (
      <Image
        src={person.photo}
        alt={person.name}
        width={size}
        height={size}
        className="shrink-0 rounded-2xl object-cover ring-1 ring-white/15"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="shrink-0 rounded-2xl bg-gradient-to-br from-[#5095fe] to-[#005cba] text-white font-extrabold flex items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden
    >
      {initials(person.name)}
    </div>
  );
}

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-white/25 transition-colors";
const labelClass = "text-[12px] font-bold uppercase tracking-[0.14em] text-[#aac7ff]";

export default function Credits() {
  return (
    <section id="team" className="scroll-mt-16 bg-[#030304] text-white border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-28">
        <span className="inline-block text-[12px] md:text-[13px] font-bold uppercase tracking-[0.2em] mb-5 text-[#5095fe]">
          The team
        </span>
        <h2 className="text-[36px] md:text-[56px] leading-[1.02] tracking-[-0.035em] font-extrabold max-w-4xl">
          A final-year project, built end to end.
        </h2>
        <p className="mt-6 text-[17px] leading-[1.7] text-white/60 max-w-3xl">
          VERA was researched and developed by four Information Technology students as their final-year engineering project at{" "}
          <a href={INSTITUTION.url} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
            {INSTITUTION.name}
          </a>{" "}
          — from data preparation and 101 training runs to the deployed model and this app — with the problem statement set by{" "}
          {SPONSOR.name}.
        </p>

        {/* Researchers & developers */}
        <h3 className="mt-14 text-[13px] font-bold uppercase tracking-[0.14em] text-white/50">Researchers &amp; developers</h3>
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TEAM.map((p) => (
            <li key={p.name} className={cardClass}>
              <Avatar person={p} size={72} />
              <div>
                <div className="text-[20px] font-extrabold tracking-tight">{p.name}</div>
                <div className="text-[14px] font-semibold text-[#aac7ff]">Researcher &amp; Developer</div>
                <div className="mt-2 text-[13px] text-white/55 leading-snug">B.E. Information Technology, 2026</div>
                {p.current && <div className="text-[13px] text-white/55 leading-snug">Now: {p.current}</div>}
              </div>
              <div className="mt-auto pt-1">
                <LinkedInLink href={p.linkedin} name={p.name} />
              </div>
            </li>
          ))}
        </ul>

        {/* Mentors + sponsor */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {MENTORS.map((m) => (
            <div key={m.name} className={cardClass}>
              <span className={labelClass}>{m.label}</span>
              <div className="flex items-center gap-4">
                <Avatar person={m} size={56} />
                <div>
                  <div className="text-[18px] font-extrabold tracking-tight">{m.name}</div>
                  <div className="text-[13px] text-white/55">{m.role}</div>
                </div>
              </div>
              <p className="text-[14px] text-white/60 leading-relaxed">{m.note}</p>
              <div className="mt-auto">
                <LinkedInLink href={m.linkedin} name={m.name} />
              </div>
            </div>
          ))}

          <a
            href={SPONSOR.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-white/[0.06] border border-white/15 p-6 flex flex-col gap-4 hover:border-[#09e6a0]/60 transition-colors"
          >
            <span className={labelClass}>Sponsored by</span>
            <Image src={SPONSOR.logoLight} alt={SPONSOR.name} width={104} height={50} className="h-12 w-auto self-start" />
            <p className="text-[15px] font-bold text-white">“{SPONSOR.tagline}”</p>
            <p className="text-[14px] text-white/60 leading-relaxed">{SPONSOR.description}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-[14px] font-bold text-white group-hover:underline underline-offset-4">
              arraypointer.com
              <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
                open_in_new
              </span>
            </span>
          </a>
        </div>

        {/* Institution */}
        <a
          href={INSTITUTION.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 hover:border-white/25 transition-colors"
        >
          <div className="shrink-0 rounded-xl bg-white p-3 self-start md:self-auto">
            <Image src={INSTITUTION.logo} alt={INSTITUTION.fullName} width={520} height={103} className="h-auto w-[300px] md:w-[360px]" />
          </div>
          <div className="flex-1">
            <span className={labelClass}>{PROJECT_CONTEXT}</span>
            <div className="mt-2 text-[20px] md:text-[22px] font-extrabold tracking-tight">{INSTITUTION.name}</div>
            <p className="mt-1 text-[14px] text-white/60 leading-relaxed">{INSTITUTION.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold text-white group-hover:underline underline-offset-4">
              pvgcoet.ac.in
              <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
                open_in_new
              </span>
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
