import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiService } from '../../core/services/api.service';
import { apiResource } from '../../core/utils/async-state';
import { plural } from '../../core/utils/format';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';

const ORDERING_OPTIONS = [
  { value: '', label: 'Odporúčané' },
  { value: 'name', label: 'Názov A – Z' },
  { value: 'management_fee_from_eur', label: 'Cena od najnižšej' },
  { value: '-management_fee_from_eur', label: 'Cena od najvyššej' },
] as const;

@Component({
  selector: 'app-services-page',
  imports: [RouterLink, IconComponent, ServiceCardComponent],
  templateUrl: './services.page.html',
  styleUrl: './services.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly orderingOptions = ORDERING_OPTIONS;

  // The URL is the source of truth for category & ordering (shareable filters).
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly category = computed(() => this.queryParams().get('kategoria'));
  protected readonly ordering = computed(() => this.queryParams().get('zoradit') ?? '');
  protected readonly search = signal(this.route.snapshot.queryParamMap.get('hladat') ?? '');

  protected readonly categories = apiResource(
    () => null,
    () => this.api.getCategories(),
  );

  protected readonly services = apiResource(
    () => ({ category: this.category(), search: this.search().trim(), ordering: this.ordering() }),
    (query) => this.api.getServices(query),
    { debounceMs: 250 },
  );

  protected readonly totalServices = computed(
    () => this.categories.data()?.reduce((sum, c) => sum + c.service_count, 0) ?? 0,
  );

  protected readonly activeCategory = computed(() =>
    this.categories.data()?.find((c) => c.slug === this.category()),
  );

  protected readonly resultLabel = computed(() => {
    const count = this.services.data()?.length ?? 0;
    return `${count} ${plural(count, ['služba', 'služby', 'služieb'])}`;
  });

  protected readonly hasFilters = computed(() => !!this.category() || !!this.search().trim());

  protected selectCategory(slug: string | null): void {
    this.updateUrl({ kategoria: slug });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.updateUrl({ hladat: value.trim() || null });
  }

  protected onOrdering(event: Event): void {
    this.updateUrl({ zoradit: (event.target as HTMLSelectElement).value || null });
  }

  protected resetFilters(): void {
    this.search.set('');
    this.updateUrl({ kategoria: null, hladat: null });
  }

  private updateUrl(params: Record<string, string | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
