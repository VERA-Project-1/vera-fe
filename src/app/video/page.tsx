export default function VideoPage() {
  return (
    <div className="flex-grow pt-16 pb-12 px-8 max-w-[1440px] mx-auto w-full flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full bg-surface-container mx-auto flex items-center justify-center shadow-sm">
            <span
              className="material-symbols-outlined text-[64px] text-on-surface-variant"
              style={{ fontVariationSettings: "'wght' 200" }}
            >
              videocam
            </span>
          </div>
        </div>

        <h1 className="text-[48px] leading-[1.1] tracking-tight font-bold text-on-surface mb-6">
          Video Analysis Platform
        </h1>
        <p className="text-[19px] leading-relaxed text-on-surface-variant max-w-2xl mx-auto mb-10">
          Real-time video meeting analysis with clinical emotion recognition and 
          participant engagement insights is currently in development.
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-[14px] font-medium text-on-surface-variant">
            In Development
          </span>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          {[
            {
              icon: "face",
              title: "Facial Analysis",
              desc: "Real-time facial expression recognition and micro-expression detection with clinical precision.",
            },
            {
              icon: "record_voice_over",
              title: "Multimodal Fusion",
              desc: "Combined audio-visual emotion analysis for comprehensive insight into patient/client states.",
            },
            {
              icon: "group",
              title: "Group Dynamics",
              desc: "Track emotional synchrony and communication patterns across all meeting participants.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-white border border-outline-variant rounded-2xl text-center shadow-sm hover:border-secondary transition-colors"
            >
              <span
                className="material-symbols-outlined text-[40px] text-secondary mb-4 block"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                {feature.icon}
              </span>
              <h3 className="text-[16px] font-bold text-on-surface mb-2">
                {feature.title}
              </h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
