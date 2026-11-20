import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { AGENCY_PILLARS } from '../../core/content/home.content';
import { ApiService } from '../../core/services/api.service';
import { apiResource } from '../../core/utils/async-state';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, IconComponent],
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  private readonly api = inject(ApiService);

  protected readonly site = SITE_CONFIG;
  protected readonly pillars = AGENCY_PILLARS;
  protected readonly team = apiResource(
    () => null,
    () => this.api.getTeam(),
  );

  protected readonly values = [
    { value: '2016', label: 'Rok založenia' },
    { value: '18', label: 'Seniorných špecialistov' },
    { value: '30 dní', label: 'Výpovedná lehota' },
    { value: '24 h', label: 'Reakcia na dopyt' },
  ];

  protected certifications(raw: string): string[] {
    return raw
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  }
}
