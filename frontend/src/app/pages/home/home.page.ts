import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { TESTIMONIALS, WORKFLOW_STEPS } from '../../core/content/home.content';
import { ApiService } from '../../core/services/api.service';
import { apiResource } from '../../core/utils/async-state';
import { CampaignRoiEstimatorComponent } from '../../shared/components/campaign-roi-estimator/campaign-roi-estimator.component';
import { CaseStudyCardComponent } from '../../shared/components/case-study-card/case-study-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, IconComponent, ServiceCardComponent, CaseStudyCardComponent, CampaignRoiEstimatorComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly api = inject(ApiService);

  protected readonly site = SITE_CONFIG;
  protected readonly steps = WORKFLOW_STEPS;
  protected readonly testimonials = TESTIMONIALS;

  protected readonly services = apiResource(
    () => ({ featured: true }),
    (query) => this.api.getServices(query),
  );
  protected readonly caseStudies = apiResource(
    () => ({ featured: true }),
    (query) => this.api.getCaseStudies(query),
  );

  /** Bar heights (%) for the decorative revenue chart in the hero report card. */
  protected readonly chartBars = [22, 28, 26, 35, 33, 42, 47, 45, 58, 64, 72, 88];
  protected readonly skeletons = [0, 1, 2];
}
