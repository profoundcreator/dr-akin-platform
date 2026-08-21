export const PERSON_IDENTITY = {
  publicName: "Akin Akinpelu, Ph.D., Amb., FLPi",
  shortName: "Akin Akinpelu",
  auTitle: "Special Emissary, African Union",
  descriptors: [
    "Leadership Scholar",
    "Governance Strategist",
    "Diplomat",
    "Institution Builder",
  ],
  pillars: ["Governance", "Enterprise", "Education"],
  /** Use when expanding the AALD acronym in public copy. */
  aaldExpandedName: "Akin Akinpelu Learning & Development",
  /** Full trading name in running prose (not the old “African Academy…” form). */
  aaldCompanyName: "Akin Akinpelu Learning & Development Company",
  metrics: {
    peopleReached: "1,000,000+",
    yearsExperience: "26+",
    countries: "20+",
  },
} as const;

export const PUBLIC_NAME = PERSON_IDENTITY.publicName;
export const AU_TITLE = PERSON_IDENTITY.auTitle;
export const AALD_EXPANDED_NAME = PERSON_IDENTITY.aaldExpandedName;
export const AALD_COMPANY_NAME = PERSON_IDENTITY.aaldCompanyName;
