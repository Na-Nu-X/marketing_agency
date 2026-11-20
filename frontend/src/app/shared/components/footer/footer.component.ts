import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly year = new Date().getFullYear();

  protected readonly navigation = [
    { label: 'Domov', path: '/' },
    { label: 'Služby', path: '/sluzby' },
    { label: 'Prípadové štúdie', path: '/pripadove-studie' },
    { label: 'O agentúre', path: '/o-agenture' },
    { label: 'Kontakt', path: '/kontakt' },
  ];

  protected readonly serviceLinks = [
    { label: 'Performance & PPC', category: 'performance-marketing-ppc' },
    { label: 'SEO & Organický rast', category: 'seo-organicky-rast' },
    { label: 'Social Media & Video', category: 'social-media-content-studio' },
    { label: 'Branding & Kreatíva', category: 'strategia-znacky-kreativa' },
    { label: 'Weby & CRO', category: 'tvorba-webov-cro' },
    { label: 'E-mail & Automatizácia', category: 'e-mail-marketing-automatizacia' },
  ];
}
