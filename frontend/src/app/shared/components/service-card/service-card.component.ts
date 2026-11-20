import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MarketingService } from '../../../core/models/api.models';
import { formatMonthlyFee } from '../../../core/utils/format';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, IconComponent],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCardComponent {
  readonly service = input.required<MarketingService>();
  /** Optional running index shown as an editorial number ("01"). */
  readonly index = input<number | null>(null);

  private readonly maxTools = 4;

  protected readonly fee = computed(() => formatMonthlyFee(this.service().management_fee_from_eur));
  protected readonly deliverablesPreview = computed(() => this.service().deliverables.slice(0, 3));
  protected readonly tools = computed(() => this.service().tools_used.slice(0, this.maxTools));
  protected readonly hiddenTools = computed(() => Math.max(0, this.service().tools_used.length - this.maxTools));
  protected readonly number = computed(() => {
    const i = this.index();
    return i === null ? null : String(i + 1).padStart(2, '0');
  });
}
