/**
 * Campaign projection model used by the ROI estimator widget.
 *
 * The figures are conservative benchmarks for well-managed accounts in the
 * Slovak / Czech market (blended Google Ads + Meta Ads). They are an
 * indicative estimate, not a guarantee.
 */

export type BusinessType = 'ecommerce' | 'b2b' | 'local';

export interface IndustryProfile {
  id: BusinessType;
  label: string;
  shortLabel: string;
  /** Unit the conversions are counted in (plural genitive, e.g. "objednávok"). */
  conversionUnit: string;
  resultLabel: string;
  /** Blended cost per click at the reference order value (€). */
  baseCpc: number;
  /** Blended click-through rate (impressions -> clicks). */
  ctr: number;
  /** Conversion rate (click -> order / lead) at the reference order value. */
  baseConversionRate: number;
  /** Share of leads that turn into paying customers (1 for e-commerce). */
  closeRate: number;
  /** Order value at which the base CPC & conversion rate apply (€). */
  referenceOrderValue: number;
  /** Advice shown when the projected PNO is too high. */
  highPnoAdvice: string;
  /** Default service slugs to pre-select in the proposal wizard. */
  recommendedServiceSlugs: string[];
}

export const INDUSTRY_PROFILES: readonly IndustryProfile[] = [
  {
    id: 'ecommerce',
    label: 'E-commerce (E-shop)',
    shortLabel: 'E-shop',
    conversionUnit: 'objednávok',
    resultLabel: 'Odhadovaný počet objednávok',
    baseCpc: 0.38,
    ctr: 0.021,
    baseConversionRate: 0.026,
    closeRate: 1,
    referenceOrderValue: 60,
    highPnoAdvice:
      'Vysoké PNO. Odporúčame zvýšiť hodnotu objednávky (balíčky, doprava zdarma nad limit) a posilniť SEO a e-mail retenciu.',
    recommendedServiceSlugs: [
      'vykonnostne-google-ads-a-meta-ads-kampane',
      'google-shopping-a-performance-max-pre-e-shopy',
    ],
  },
  {
    id: 'b2b',
    label: 'B2B Služby / Lead Generation',
    shortLabel: 'B2B',
    conversionUnit: 'dopytov',
    resultLabel: 'Odhadovaný počet dopytov',
    baseCpc: 1.1,
    ctr: 0.032,
    baseConversionRate: 0.05,
    closeRate: 0.3,
    referenceOrderValue: 250,
    highPnoAdvice:
      'Pri nižšej hodnote zákazky sa oplatí lepšie kvalifikovať dopyty a cieliť iba na rozhodovateľov – znížime tak cenu za obchod.',
    recommendedServiceSlugs: ['linkedin-ads-a-b2b-lead-generation', 'vykonnostne-google-ads-a-meta-ads-kampane'],
  },
  {
    id: 'local',
    label: 'Lokálny biznis & Služby',
    shortLabel: 'Lokálny biznis',
    conversionUnit: 'dopytov',
    resultLabel: 'Odhadovaný počet dopytov',
    baseCpc: 0.62,
    ctr: 0.045,
    baseConversionRate: 0.06,
    closeRate: 0.45,
    referenceOrderValue: 90,
    highPnoAdvice:
      'Vysoké PNO. Pomôže lokálne SEO, optimalizovaný Firemný profil Google a remarketing na existujúcich zákazníkov.',
    recommendedServiceSlugs: [
      'vykonnostne-google-ads-a-meta-ads-kampane',
      'sprava-socialnych-sieti-a-produkcia-reels-tiktok-videi',
    ],
  },
];

export interface EstimatorInput {
  businessType: BusinessType;
  monthlyBudget: number;
  averageOrderValue: number;
}

export interface EstimatorResult {
  revenue: number;
  revenueLow: number;
  revenueHigh: number;
  conversions: number;
  customers: number;
  clicks: number;
  impressions: number;
  conversionRate: number;
  /** Ad spend per conversion (order / lead) in €. */
  costPerConversion: number;
  roas: number;
  /** PNO (podiel nákladov na obrate) in percent. */
  pno: number;
}

export const BUDGET_RANGE = { min: 500, max: 25000, step: 250 } as const;
export const ORDER_VALUE_RANGE = { min: 25, max: 500, step: 5 } as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function profileFor(type: BusinessType): IndustryProfile {
  return INDUSTRY_PROFILES.find((p) => p.id === type) ?? INDUSTRY_PROFILES[0];
}

export function estimateCampaign(input: EstimatorInput): EstimatorResult {
  const profile = profileFor(input.businessType);
  const budget = clamp(input.monthlyBudget, BUDGET_RANGE.min, BUDGET_RANGE.max);
  const orderValue = clamp(input.averageOrderValue, ORDER_VALUE_RANGE.min, ORDER_VALUE_RANGE.max);
  const valueRatio = orderValue / profile.referenceOrderValue;

  // Pricier products cost more per click and convert less often.
  const cpc = profile.baseCpc * Math.pow(valueRatio, 0.3);
  const conversionRate = clamp(profile.baseConversionRate * Math.pow(valueRatio, -0.35), 0.004, 0.12);

  // Diminishing returns: each extra euro buys slightly less efficient traffic.
  const scaleEfficiency = Math.pow(budget / 1000, -0.08);

  const clicks = (budget / cpc) * scaleEfficiency;
  const impressions = clicks / profile.ctr;
  const conversions = clicks * conversionRate;
  const customers = conversions * profile.closeRate;
  const revenue = customers * orderValue;
  const roas = revenue / budget;
  const pno = revenue > 0 ? (budget / revenue) * 100 : 0;

  return {
    revenue,
    revenueLow: revenue * 0.8,
    revenueHigh: revenue * 1.2,
    conversions,
    customers,
    clicks,
    impressions,
    conversionRate: conversionRate * 100,
    costPerConversion: conversions > 0 ? budget / conversions : 0,
    roas,
    pno,
  };
}
