import type { Metadata } from "next";
import Credits from "@/components/landing/Credits";
import Publication from "@/components/landing/Publication";

export const metadata: Metadata = {
  title: "Meet the team — VERA",
  description: "The students, faculty guide, industry mentor and sponsor behind VERA, a final-year engineering project.",
};

export default function TeamPage() {
  return (
    <>
      <Credits />
      <div className="bg-surface-container-low">
        <Publication />
      </div>
    </>
  );
}
