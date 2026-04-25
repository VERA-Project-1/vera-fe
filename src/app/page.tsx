import Link from "next/link";

const cards = [
  {
    icon: "mic",
    title: "Audio",
    description: "Analyze speech patterns and emotional cues from voice recordings or uploaded audio files.",
    href: "/audio",
  },
  {
    icon: "videocam",
    title: "Video Meeting",
    description: "Conduct real-time meetings with live emotion recognition and participant insights.",
    href: "/video",
  },
  {
    icon: "history",
    title: "History",
    description: "Explore your session archives, detailed transcripts, and historical emotion trends.",
    href: "/history",
  },
];

export default function HomePage() {
  return (
    <div className="flex-grow pt-[100px] pb-[80px] px-8 max-w-[1440px] mx-auto w-full flex flex-col items-center justify-center">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-on-surface mb-4">
          Start Analysis
        </h1>
        <p className="text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
          Select an input method to begin clinical speech and emotion evaluation.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {cards.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col items-center justify-center p-12 bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
            id={`card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="mb-6 text-primary transition-transform duration-300 group-hover:scale-110">
              <span
                className="material-symbols-outlined text-[80px]"
                style={{ fontVariationSettings: "'wght' 200" }}
              >
                {card.icon}
              </span>
            </div>
            <h2 className="text-[24px] leading-[1.3] font-semibold text-on-surface mb-2">
              {card.title}
            </h2>
            <p className="text-[14px] leading-[1.5] text-on-surface-variant text-center">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
