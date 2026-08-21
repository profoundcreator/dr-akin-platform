export function platformLabel(platform: string | null): string | null {
  switch (platform) {
    case "aald":
      return "AALD";
    case "performx":
      return "PerformX Nexus";
    case "erudio-hub":
      return "Erudio Hub";
    case "auctus-africa":
      return "Auctus Africa";
    case "future-africa":
      return "Future Africa";
    default:
      return null;
  }
}
