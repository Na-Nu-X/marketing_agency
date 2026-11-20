import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, computed, effect, inject, Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CategoryBrief } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { apiResource } from '../../core/utils/async-state';
import { CaseStudyCardComponent } from '../../shared/components/case-study-card/case-study-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface CategoryFilter extends CategoryBrief {
  count: number;
}

@Component({
  selector: 'app-case-studies-page',
  imports: [RouterLink, IconComponent, CaseStudyCardComponent],
  templateUrl: './case-studies.page.html',
  styleUrl: './case-studies.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudiesPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly fragment = toSignal(this.route.fragment, { initialValue: this.route.snapshot.fragment });
  protected readonly category = computed(() => this.queryParams().get('kategoria'));

  /** Unfiltered list, used to build the filter chips with counts. */
  private readonly all = apiResource(
    () => null,
    () => this.api.getCaseStudies(),
  );

  protected readonly caseStudies = apiResource(
    () => this.category(),
    (category) => this.api.getCaseStudies({ category }),
  );

  protected readonly filters = computed<CategoryFilter[]>(() => {
    const byCategory = new Map<number, CategoryFilter>();
    for (const cs of this.all.data() ?? []) {
      const existing = byCategory.get(cs.category.id);
      if (existing) existing.count++;
      else byCategory.set(cs.category.id, { ...cs.category, count: 1 });
    }
    return [...byCategory.values()];
  });

  protected readonly totalCount = computed(() => this.all.data()?.length ?? 0);

  constructor() {
    // Content loads asynchronously, so scroll to `#slug` once the cards are rendered.
    effect(() => {
      const fragment = this.fragment();
      if (!fragment || !this.caseStudies.data()) return;
      afterNextRender(
        () => this.document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        { injector: this.injector },
      );
    });
  }

  protected selectCategory(slug: string | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { kategoria: slug },
      replaceUrl: true,
    });
  }
}
