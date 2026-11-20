import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ProposalDraftService, budgetToBracket } from '../../../core/services/proposal-draft.service';
import { formatEur, formatNumber } from '../../../core/utils/format';
import {
  BUDGET_RANGE,
  BusinessType,
  INDUSTRY_PROFILES,
  ORDER_VALUE_RANGE,
  estimateCampaign,
  profileFor,
} from '../../../core/utils/roi-estimator';
import { IconComponent } from '../icon/icon.component';

type PnoLevel = 'great' | 'ok' | 'high';

@Component({
  selector: 'app-campaign-roi-estimator',
  imports: [IconComponent],
  templateUrl: './campaign-roi-estimator.component.html',
  styleUrl: './campaign-roi-estimator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignRoiEstimatorComponent {
  private readonly router = inject(Router);
  private readonly drafts = inject(ProposalDraftService);

  protected readonly profiles = INDUSTRY_PROFILES;
  protected readonly budgetRange = BUDGET_RANGE;
  protected readonly orderValueRange = ORDER_VALUE_RANGE;

  // --- Inputs (state) ---
  protected readonly businessType = signal<BusinessType>('ecommerce');
  protected readonly monthlyBudget = signal(3000);
  protected readonly averageOrderValue = signal(65);

  // --- Derived projection ---
  protected readonly profile = computed(() => profileFor(this.businessType()));
  protected readonly result = computed(() =>
    estimateCampaign({
      businessType: this.businessType(),
      monthlyBudget: this.monthlyBudget(),
      averageOrderValue: this.averageOrderValue(),
    }),
  );

  protected readonly budgetFill = computed(() => this.fillPercent(this.monthlyBudget(), BUDGET_RANGE));
  protected readonly orderValueFill = computed(() => this.fillPercent(this.averageOrderValue(), ORDER_VALUE_RANGE));

  protected readonly pnoLevel = computed<PnoLevel>(() => {
    const pno = this.result().pno;
    if (pno <= 15) return 'great';
    if (pno <= 30) return 'ok';
    return 'high';
  });

  protected readonly pnoHint = computed(() => {
    switch (this.pnoLevel()) {
      case 'great':
        return 'Zdravá ziskovosť – priestor na ďalšie škálovanie rozpočtu.';
      case 'ok':
        return 'Bežné PNO pre rast. Optimalizáciou kreatív a feedu ho tlačíme nižšie.';
      default:
        return this.profile().highPnoAdvice;
    }
  });

  // --- Formatted output for the template ---
  protected readonly formatted = computed(() => {
    const r = this.result();
    return {
      budget: formatEur(this.monthlyBudget()),
      orderValue: formatEur(this.averageOrderValue()),
      revenue: formatEur(r.revenue),
      revenueRange: `${formatEur(r.revenueLow)} – ${formatEur(r.revenueHigh)}`,
      conversions: formatNumber(r.conversions),
      clicks: formatNumber(r.clicks),
      impressions: formatNumber(r.impressions),
      conversionRate: `${r.conversionRate.toFixed(1)} %`,
      costPerConversion: `${r.costPerConversion.toFixed(2)}\u00a0€`,
      roas: `${r.roas.toFixed(1)}×`,
      pno: `${r.pno.toFixed(1)} %`,
    };
  });

  protected selectBusinessType(type: BusinessType): void {
    this.businessType.set(type);
  }

  /** Arrow-key navigation for the business type radio group. */
  protected onSegmentKeydown(event: KeyboardEvent): void {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    const ids = this.profiles.map((p) => p.id);
    const next = ids[(ids.indexOf(this.businessType()) + step + ids.length) % ids.length];
    this.businessType.set(next);
    const group = event.currentTarget as HTMLElement;
    queueMicrotask(() => group.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
  }

  protected onBudgetInput(event: Event): void {
    this.monthlyBudget.set(this.readNumber(event, BUDGET_RANGE));
  }

  protected onOrderValueInput(event: Event): void {
    this.averageOrderValue.set(this.readNumber(event, ORDER_VALUE_RANGE));
  }

  /** Pre-fills the proposal wizard with the current scenario and navigates to it. */
  protected startProposal(): void {
    const profile = this.profile();
    const f = this.formatted();
    this.drafts.set({
      serviceSlugs: profile.recommendedServiceSlugs,
      budget: budgetToBracket(this.monthlyBudget()),
      goals:
        `Scenár z kalkulačky (${profile.shortLabel}): mesačný kredit do reklamy ${f.budget}, ` +
        `priemerná hodnota objednávky ${f.orderValue}. Chceme dosiahnuť približne ${f.revenue} ` +
        `mesačného obratu z kampaní (cca ${f.conversions} ${profile.conversionUnit}) pri PNO okolo ${f.pno}.`,
    });
    void this.router.navigate(['/kontakt'], { queryParams: { tab: 'ponuka' } });
  }

  private readNumber(event: Event, range: { min: number; max: number }): number {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(value)) return range.min;
    return Math.min(range.max, Math.max(range.min, value));
  }

  private fillPercent(value: number, range: { min: number; max: number }): string {
    return `${((value - range.min) / (range.max - range.min)) * 100}%`;
  }
}
