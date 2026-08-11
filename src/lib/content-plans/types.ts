export type ContentPlanStatus = "draft" | "pending_review" | "approved";

export type PlanVariableStatus = "recommended" | "custom" | "hold";

export type SectionApprovalStatus = "pending" | "approved" | "revise";

export interface PlanVariable {
  key: string;
  label: string;
  recommended: string;
  alternate?: string;
  source: string;
  value: string;
  status: PlanVariableStatus;
}

export interface PlanDecisionOption {
  id: string;
  label: string;
  recommended?: boolean;
}

export interface PlanDecision {
  id: string;
  title: string;
  context: string;
  options: PlanDecisionOption[];
  choice: string | null;
  notes: string;
}

export interface PlanPageHero {
  kicker: string;
  headline: string;
  headlineSecondary?: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export interface PlanPageSection {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
  status: SectionApprovalStatus;
}

export interface PlanPage {
  id: string;
  route: string;
  title: string;
  hero: PlanPageHero;
  sections: PlanPageSection[];
}

export interface PlanChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  checkedAt?: string | null;
}

export interface ContentPlanData {
  slug: string;
  title: string;
  variables: Record<string, PlanVariable>;
  decisions: Record<string, PlanDecision>;
  sectionApprovals: Record<string, SectionApprovalStatus>;
  checklist: Record<string, PlanChecklistItem>;
  pages: PlanPage[];
  status: ContentPlanStatus;
  approvalNote: string;
  updatedAt?: string;
}

export interface ContentPlanReadiness {
  pendingDecisions: number;
  openChecklist: number;
  holdVariables: number;
  pendingSections: number;
  ready: boolean;
}
