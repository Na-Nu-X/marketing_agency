import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-hero not-found">
      <div class="container">
        <p class="eyebrow">Chyba 404</p>
        <h1 class="display-xl">Táto stránka <span class="text-accent">nekonvertuje.</span></h1>
        <p class="lead">Stránku, ktorú hľadáte, sme nenašli. Možno bola presunutá, alebo je v odkaze preklep.</p>
        <div class="actions">
          <a class="btn btn--primary btn--lg" routerLink="/">Späť na úvod <app-icon name="arrow-right" [size]="18" /></a>
          <a class="btn btn--outline-light btn--lg" routerLink="/sluzby">Prezrieť služby</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .not-found {
      min-height: 80vh;
      display: flex;
      align-items: center;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 2rem;
    }
  `,
})
export class NotFoundPage {}
