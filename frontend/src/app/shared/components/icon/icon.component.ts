import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Stroke icons (24×24 grid), stored as path data so no sanitization is needed. */
const ICONS = {
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up-right': ['M7 7h10v10', 'M7 17 17 7'],
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  check: ['M20 6 9 17l-5-5'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  'chevron-down': ['m6 9 6 6 6-6'],
  target: [
    'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20',
    'M12 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12',
    'M12 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
  ],
  search: ['M11 3a8 8 0 1 0 0 16a8 8 0 1 0 0-16', 'm21 21-4.3-4.3'],
  camera: [
    'm16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11',
    'M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
  ],
  palette: [
    'M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2.5a1.5 1.5 0 0 0-1.1 2.6c.4.4.6.9.6 1.4 0 1.1-1 2-3 2z',
    'M7.5 11.5h.01',
    'M10 7.5h.01',
    'M15 7.5h.01',
  ],
  monitor: ['M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M8 21h8', 'M12 17v4'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm22 7-10 6L2 7'],
  phone: [
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  ],
  'map-pin': ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 7a3 3 0 1 0 0 6a3 3 0 1 0 0-6'],
  'trending-up': ['m22 7-8.5 8.5-5-5L2 17', 'M16 7h6v6'],
  clock: ['M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20', 'M12 6v6l4 2'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4'],
  zap: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
  users: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8',
    'M22 21v-2a4 4 0 0 0-3-3.9',
    'M16 3.1a4 4 0 0 1 0 7.8',
  ],
  award: ['M12 2a6 6 0 1 0 0 12a6 6 0 1 0 0-12', 'M15.5 12.9 17 22l-5-3-5 3 1.5-9.1'],
  alert: ['M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20', 'M12 8v4', 'M12 16h.01'],
  refresh: ['M3 12a9 9 0 0 1 15.5-6.2L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-15.5 6.2L3 16', 'M8 16H3v5'],
  instagram: [
    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
    'M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z',
    'M17.5 6.5h.01',
  ],
  linkedin: [
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z',
    'M2 9h4v12H2z',
    'M4 2a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
  ],
  facebook: ['M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'],
  tiktok: ['M16 3c.3 2.4 1.9 4.2 4.5 4.5v3.2c-1.7 0-3.2-.5-4.5-1.4V15a6 6 0 1 1-6-6v3.3A2.8 2.8 0 1 0 12.8 15V3z'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICONS;

export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, name);
}

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class]': '"icon-" + resolvedName()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  /** Icon name; unknown names fall back to `target`. */
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly strokeWidth = input(1.75);

  protected readonly resolvedName = computed<IconName>(() => {
    const name = this.name();
    return isIconName(name) ? name : 'target';
  });

  protected readonly paths = computed<readonly string[]>(() => ICONS[this.resolvedName()]);
}
