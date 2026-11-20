import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SITE_CONFIG } from '../config/site.config';

/** Appends the agency name to every route title and sets a meta description. */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle ? `${pageTitle} | ${SITE_CONFIG.agencyName}` : `${SITE_CONFIG.agencyName} – ${SITE_CONFIG.tagline}`);
    this.meta.updateTag({ name: 'description', content: SITE_CONFIG.description });
  }

  /** Lets pages with dynamic content (e.g. a service detail) set their own title. */
  setDynamicTitle(pageTitle: string, description?: string): void {
    this.title.setTitle(`${pageTitle} | ${SITE_CONFIG.agencyName}`);
    if (description) this.meta.updateTag({ name: 'description', content: description });
  }
}
