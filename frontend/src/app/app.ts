import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#obsah">Preskočiť na obsah</a>
    <app-navbar />
    <main id="obsah" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: `
    main {
      display: block;
      min-height: 70vh;
      outline: none;
    }
  `,
})
export class App {}
