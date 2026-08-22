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

export function contactRoutingHint(platform: string): string | null {
  if (platform === "future-africa") {
    return "Your enquiry is for Future Africa. It will be sent to the Erudio Hub team for now — they will handle it on behalf of Future Africa until Future Africa has its own inbox.";
  }

  const label = platformLabel(platform);
  return label ? `Your enquiry will be routed to the ${label} team.` : null;
}

export function bookingRoutingHint(area: string): string | null {
  if (area === "speaking-office") {
    return "Your request will be reviewed by Dr. Akin's executive assistant team.";
  }
  if (area === "future-africa") {
    return "This booking is for Future Africa. The Erudio Hub team will receive it (with EA copied) and handle it on behalf of Future Africa.";
  }

  const label = platformLabel(area);
  return label
    ? `The ${label} team will receive this booking request, with Dr. Akin's EA copied.`
    : null;
}

export function bookingRequestAreaLabel(area: string | null | undefined): string {
  if (!area || area === "speaking-office") {
    return "Dr. Akin Akinpelu — speaking & advisory";
  }
  return platformLabel(area) ?? area;
}
