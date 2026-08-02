export type OrganizerResourceStatus = "available" | "retired";
export type OrganizerResourceAudience = "professional" | "christian" | "universal";

export interface OrganizerResourceFile {
  id: string;
  logicalKey: string;
  title: string;
  category: string;
  audienceVariant: OrganizerResourceAudience;
  version: number;
  fileName: string;
  objectPath: string;
  mimeType: string;
  sizeBytes: number;
  status: OrganizerResourceStatus;
  isCurrent: boolean;
  createdBy: string;
  createdAt: string;
  retiredAt: string | null;
}

export interface BookingResourceGrant {
  id: string;
  bookingRequestId: string;
  resourceFileId: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt: string | null;
  revokedBy: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
}

export interface OrganizerGrantedResource {
  grantId: string;
  resourceId: string;
  title: string;
  category: string;
  audienceVariant: OrganizerResourceAudience;
  version: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  grantedAt: string;
  expiresAt: string | null;
}
