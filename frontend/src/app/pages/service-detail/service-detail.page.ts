import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, of } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { PageTitleStrategy } from '../../core/services/page-title.strategy';
import { apiResource } from '../../core/utils/async-state';
import { formatMonthlyFee } from '../../core/utils/format';
import { CaseStudyCardComponent } from '../../shared/components/case-study-card/case-study-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';

@Component({
  selector: 'app-service-detail-page',
  imports: [RouterLink, IconComponent, ServiceCardComponent, CaseStudyCardComponent],
  templateUrl: './service-detail.page.html',
  styleUrl: './service-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailPage {
  private readonly api = inject(ApiService);
  private readonly titles = inject(PageTitleStrategy);

  /** Bound from the `:slug` route parameter. */
  readonly slug = input.required<string>();

  protected readonly service = apiResource(
    () => this.slug(),
    (slug) => this.api.getService(slug),
  );

  private readonly categorySlug = computed(() => this.service.data()?.category.slug ?? null);

  protected readonly relatedCaseStudies = apiResource(
    () => this.categorySlug(),
    (category) => (category ? this.api.getCaseStudies({ category }).pipe(map((items) => items.slice(0, 2))) : of([])),
  );

  protected readonly siblingServices = apiResource(
    () => ({ category: this.categorySlug(), current: this.slug() }),
    ({ category, current }) =>
      category
        ? this.api.getServices({ category }).pipe(map((items) => items.filter((s) => s.slug !== current).slice(0, 3)))
        : of([]),
  );

  protected readonly fee = computed(() => {
    const service = this.service.data();
    return service ? formatMonthlyFee(service.management_fee_from_eur) : '';
  });

  protected readonly paragraphs = computed(() =>
    (this.service.data()?.detailed_description ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
  );

  protected readonly hasFee = computed(() => this.service.data()?.management_fee_from_eur != null);

  constructor() {
    effect(() => {
      const service = this.service.data();
      if (service) this.titles.setDynamicTitle(service.name, service.short_description);
    });
  }
}
