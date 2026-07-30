export type AdminRole =
  | "super_admin"
  | "admin_manager"
  | "technical_admin"
  | "executive_assistant"
  | "executive_reviewer"
  | "inbox_manager"
  | "resource_manager"
  | "read_only_auditor";

export type EventType = "hosted_by_dr_akin" | "featured_appearance" | "org_brand";

export type EventBrand =
  | "dr_akin"
  | "aald"
  | "erudio"
  | "performx"
  | "tc_resource"
  | "other";

export type EventStatus = "draft" | "pending_approval" | "published" | "hidden";

export type AdminAccountState = "invited" | "active" | "suspended" | "revoked";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  account_state: AdminAccountState;
  invited_by: string | null;
  invited_at: string | null;
  last_sign_in_at: string | null;
  session_revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBookingRequest {
  id: string;
  reference: string;
  access_token: string;
  organizer_email: string;
  status: string;
  internal_status: string;
  priority: string;
  assigned_ea_id: string | null;
  conflict_detected: boolean;
  submission_source: string;
  form_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  assigned_ea?: { full_name: string } | null;
}

export interface DbBookingStatusEvent {
  id: string;
  booking_request_id: string;
  previous_status: string | null;
  new_status: string;
  actor: string;
  internal_reason: string | null;
  organizer_message: string | null;
  created_at: string;
}

export interface DbEnquiry {
  id: string;
  source: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  organization: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  priority: string;
  assigned_admin_id: string | null;
  booking_request_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DbAuditEvent {
  id: string;
  actor_id: string | null;
  actor_role: AdminRole | null;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  summary: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DbEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  seo_description: string | null;
  event_type: EventType;
  brand: EventBrand;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location: string | null;
  location_type: string;
  cover_image_path: string | null;
  registration_url: string | null;
  registration_embed_url: string | null;
  payment_url: string | null;
  payment_label: string | null;
  status: EventStatus;
  manually_hidden: boolean;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbFeaturedPodcastEpisode {
  id: string;
  title: string;
  description: string | null;
  spotify_url: string;
  episode_date: string | null;
  duration_label: string | null;
  sort_order: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingResult {
  id: string;
  reference: string;
  access_token: string;
}

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: AdminProfile;
        Insert: Partial<AdminProfile> & Pick<AdminProfile, "id" | "email" | "full_name" | "role">;
        Update: Partial<AdminProfile>;
      };
      booking_requests: {
        Row: DbBookingRequest;
        Insert: never;
        Update: Partial<DbBookingRequest>;
      };
      booking_status_events: {
        Row: DbBookingStatusEvent;
        Insert: Partial<DbBookingStatusEvent>;
        Update: never;
      };
      enquiries: {
        Row: DbEnquiry;
        Insert: Partial<DbEnquiry>;
        Update: Partial<DbEnquiry>;
      };
      audit_events: {
        Row: DbAuditEvent;
        Insert: Partial<DbAuditEvent>;
        Update: never;
      };
      featured_podcast_episodes: {
        Row: DbFeaturedPodcastEpisode;
        Insert: Partial<DbFeaturedPodcastEpisode> &
          Pick<DbFeaturedPodcastEpisode, "title" | "spotify_url">;
        Update: Partial<DbFeaturedPodcastEpisode>;
      };
      events: {
        Row: DbEvent;
        Insert: Partial<DbEvent> & Pick<DbEvent, "slug" | "title" | "starts_at" | "ends_at">;
        Update: Partial<DbEvent>;
      };
    };
    Functions: {
      create_booking_request: {
        Args: { p_form: Record<string, unknown>; p_source?: string };
        Returns: CreateBookingResult;
      };
      get_booking_for_organizer: {
        Args: { p_reference: string; p_access_token: string };
        Returns: Record<string, unknown> | null;
      };
      log_audit_event: {
        Args: {
          p_event_type: string;
          p_target_type?: string;
          p_target_id?: string;
          p_summary?: Record<string, unknown>;
          p_metadata?: Record<string, unknown>;
        };
        Returns: string;
      };
    };
  };
}
