import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CaseStudy } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

interface Kpi {
  value: string;
  label: string;
  growth: boolean;
}

/** A KPI is "positive" (emerald) when it shows a gain, multiplier, or reduced cost. */
function isGrowthKpi(value: string): boolean {
  return /^[+−-]|×/.test(value.trim());
}

@Component({
  selector: 'app-case-study-card',
  imports: [RouterLink, IconComponent],
  templateUrl: './case-study-card.component.html',
  styleUrl: './case-study-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-full]': 'variant() === "full"' },
})
export class CaseStudyCardComponent {
  readonly caseStudy = input.required<CaseStudy>();
  /** `compact` for teaser grids, `full` shows the challenge vs. strategy breakdown. */
  readonly variant = input<'compact' | 'full'>('compact');

  protected readonly kpis = computed<Kpi[]>(() => {
    const cs = this.caseStudy();
    return [
      { value: cs.primary_kpi_value, label: cs.primary_kpi_label },
      { value: cs.secondary_kpi_value, label: cs.secondary_kpi_label },
      { value: cs.tertiary_kpi_value, label: cs.tertiary_kpi_label },
    ]
      .filter((kpi) => kpi.value)
      .map((kpi) => ({ ...kpi, growth: isGrowthKpi(kpi.value) }));
  });

  protected readonly visibleKpis = computed(() => this.kpis().slice(0, this.variant() === 'full' ? 3 : 2));
}
