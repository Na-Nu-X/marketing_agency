import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Performance & kreatívna agentúra',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'sluzby',
    title: 'Služby',
    loadComponent: () => import('./pages/services/services.page').then((m) => m.ServicesPage),
  },
  {
    path: 'sluzby/:slug',
    title: 'Detail služby',
    loadComponent: () => import('./pages/service-detail/service-detail.page').then((m) => m.ServiceDetailPage),
  },
  {
    path: 'pripadove-studie',
    title: 'Prípadové štúdie',
    loadComponent: () => import('./pages/case-studies/case-studies.page').then((m) => m.CaseStudiesPage),
  },
  {
    path: 'o-agenture',
    title: 'O agentúre a náš tím',
    loadComponent: () => import('./pages/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'kontakt',
    title: 'Nezáväzná ponuka & bezplatný audit',
    loadComponent: () => import('./pages/contact/contact.page').then((m) => m.ContactPage),
  },
  {
    path: '**',
    title: 'Stránka nenájdená',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
