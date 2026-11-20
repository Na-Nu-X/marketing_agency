export interface CategoryBrief {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
}

export interface ServiceCategory extends CategoryBrief {
  short_summary: string;
  display_order: number;
  service_count: number;
}

export interface MarketingService {
  id: number;
  name: string;
  slug: string;
  category: CategoryBrief;
  short_description: string;
  deliverables: string[];
  tools_used: string[];
  /** Decimal serialized as string by DRF, e.g. "690.00"; null = individual pricing. */
  management_fee_from_eur: string | null;
  is_featured: boolean;
}

export interface MarketingServiceDetail extends MarketingService {
  detailed_description: string;
  ideal_for: string[];
  success_metrics: string[];
}

export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  client_sector: string;
  category: CategoryBrief;
  challenge_summary: string;
  strategy_executed: string;
  primary_kpi_value: string;
  primary_kpi_label: string;
  secondary_kpi_value: string;
  secondary_kpi_label: string;
  tertiary_kpi_value: string;
  tertiary_kpi_label: string;
  channels_used: string[];
  duration_label: string;
  cover_image_url: string;
  is_featured: boolean;
}

export interface TeamMember {
  id: number;
  full_name: string;
  role_title: string;
  bio: string;
  certifications: string;
  photo_url: string;
  linkedin_url: string;
}

export type MonthlyBudget = 'do_1500' | '1500_5000' | '5000_15000' | 'nad_15000';

export const MONTHLY_BUDGET_OPTIONS: ReadonlyArray<{ value: MonthlyBudget; label: string }> = [
  { value: 'do_1500', label: 'Do 1 500 € / mes.' },
  { value: '1500_5000', label: '1 500 € – 5 000 € / mes.' },
  { value: '5000_15000', label: '5 000 € – 15 000 € / mes.' },
  { value: 'nad_15000', label: 'Nad 15 000 € / mes.' },
];

export interface ProjectProposalPayload {
  selected_services: string[];
  monthly_ad_budget: MonthlyBudget;
  website_url: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  project_goals: string;
  company_fax: string;
}

export type AuditType = 'ppc_audit' | 'seo_ux_audit' | 'social_audit';

export const AUDIT_TYPE_OPTIONS: ReadonlyArray<{ value: AuditType; label: string; hint: string }> = [
  {
    value: 'ppc_audit',
    label: 'Bezplatný audit Google & Meta Ads',
    hint: 'Štruktúra účtu, meranie konverzií, plytvanie rozpočtom',
  },
  {
    value: 'seo_ux_audit',
    label: 'SEO & Konverzný audit webu / e-shopu',
    hint: 'Technické SEO, rýchlosť, UX bariéry v nákupe',
  },
  {
    value: 'social_audit',
    label: 'Audit Instagramu a TikToku',
    hint: 'Obsah, formáty, dosah a potenciál pre reklamu',
  },
];

export interface MarketingAuditPayload {
  audit_type: AuditType;
  website_or_profile_url: string;
  contact_name: string;
  email: string;
  company_fax: string;
}

/** DRF validation error shape: field -> messages. */
export type ApiFieldErrors = Record<string, string[]>;
