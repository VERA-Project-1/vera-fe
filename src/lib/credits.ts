// People and organisations behind VERA, shown in the credits section at the bottom of the landing page.
// Roles and photos are taken from each person's public LinkedIn profile.

export const INSTITUTION = {
  name: "PVG's College of Engineering, Technology and Management, Pune",
  shortName: "PVG's COETM, Pune",
  fullName: "Pune Vidyarthi Griha's College of Engineering, Technology and Management, Pune",
  url: "https://www.pvgcoet.ac.in/",
  logo: "/institutions/pvgcoet-logo.jpg", // white background — render on a light tile
  description:
    "An autonomous institute affiliated to Savitribai Phule Pune University, NAAC 'A' accredited, run by Pune Vidyarthi Griha (est. 1909).",
};

export const PROJECT_CONTEXT = "Final-year B.E. Information Technology project, 2025–26";

export interface Person {
  name: string;
  linkedin: string;
  photo?: string;
  current?: string; // current role, from LinkedIn
}

export const TEAM: Person[] = [
  {
    name: "Harsh Doshi",
    linkedin: "https://www.linkedin.com/in/harsh-doshi-86a457294/",
    photo: "/team/harsh-doshi.jpg",
    current: "Software Engineer, Out Of The Blue",
  },
  {
    name: "Anish Sapre",
    linkedin: "https://www.linkedin.com/in/anish-sapre-95b205299/",
    photo: "/team/anish-sapre.jpg",
    current: "Software Engineer, Avegen",
  },
  {
    name: "Varad Chaskar",
    linkedin: "https://www.linkedin.com/in/varad-chaskar/",
    photo: "/team/varad-chaskar.jpg",
    current: "AI Software Engineer, KPi-Tech Services",
  },
  {
    name: "Sudesh Bansode",
    linkedin: "https://www.linkedin.com/in/sudesh-bansode-518777249/",
    photo: "/team/sudesh-bansode.jpg",
    current: "Data pipelines · ML · AI backends",
  },
];

export const MENTORS: (Person & { label: string; role: string; note: string })[] = [
  {
    label: "Guided by",
    name: "Prof. Minal Apsangi",
    role: `Assistant Professor, ${INSTITUTION.shortName}`,
    note: "Faculty guide for the final-year project. Works in machine learning and information technology (M.E. IT, SPPU).",
    linkedin: "https://www.linkedin.com/in/minal-apsangi-81a36776/",
  },
  {
    label: "Industry mentor",
    name: "Anway Kulkarni",
    role: "Founder, ArrayPointer",
    note: "Set the problem statement and guided the project from the industry side. Also a PVG alumnus.",
    linkedin: "https://www.linkedin.com/in/anway-kulkarni/",
    photo: "/team/anway-kulkarni.jpg",
  },
];

// Summarised from arraypointer.com.
export const SPONSOR = {
  name: "ArrayPointer",
  url: "https://arraypointer.com/",
  logoLight: "/sponsors/arraypointer-logo-light.svg", // light lettering, for dark backgrounds
  tagline: "Build Intelligence within Your Business",
  description:
    "An AI, automation and retail-commerce company that designs custom systems for growing businesses — from AI systems development and legacy modernisation to workflow automation and D2C commerce.",
};

export const initials = (name: string) =>
  name
    .replace(/^Prof\.\s*/, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
