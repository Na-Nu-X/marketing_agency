/**
 * White-label configuration.
 *
 * Every agency-specific detail (name, contacts, legal data, partner badges,
 * social links, trust metrics) lives here. To rebrand the site for a new
 * client, edit this file and the color tokens in `src/styles/_variables.scss`.
 *
 * NOTE: The default values below are fictitious placeholders.
 */

export type SocialNetwork = 'instagram' | 'linkedin' | 'tiktok' | 'facebook';

export interface SocialLink {
  network: SocialNetwork;
  label: string;
  url: string;
}

export interface TrustMetric {
  value: string;
  label: string;
  /** Render the value in the growth (emerald) color. */
  growth?: boolean;
}

export interface PartnerBadge {
  name: string;
  status: string;
}

export interface SiteConfig {
  agencyName: string;
  /** Wordmark is rendered as `wordmark` + accent `wordmarkAccent`. */
  wordmark: string;
  wordmarkAccent: string;
  tagline: string;
  description: string;
  contact: {
    phone: string;
    phoneHref: string;
    newBusinessEmail: string;
    generalEmail: string;
    officeHours: string;
    responseTime: string;
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
    mapUrl: string;
  };
  legal: {
    companyName: string;
    ico: string;
    dic: string;
    icDph: string;
    registry: string;
  };
  partners: PartnerBadge[];
  socials: SocialLink[];
  trustMetrics: TrustMetric[];
  gdprNotice: string;
}

export const SITE_CONFIG: SiteConfig = {
  agencyName: 'Rastlab',
  wordmark: 'rastlab',
  wordmarkAccent: '.',
  tagline: 'Performance & kreatívna agentúra',
  description:
    'Rastlab je full-service performance agentúra. Spájame dáta a kreatívu pod jednou strechou – PPC, SEO, sociálne siete, branding a weby, ktoré merateľne zvyšujú tržby.',
  contact: {
    phone: '+421 2 3300 4455',
    phoneHref: '+421233004455',
    newBusinessEmail: 'spolupraca@rastlab.sk',
    generalEmail: 'ahoj@rastlab.sk',
    officeHours: 'Po – Pi, 9:00 – 17:30',
    responseTime: 'Na dopyty odpovedáme do 24 hodín v pracovných dňoch.',
  },
  address: {
    street: 'Mlynské nivy 16',
    postalCode: '821 09',
    city: 'Bratislava',
    country: 'Slovensko',
    mapUrl: 'https://maps.google.com/?q=Mlynské+nivy+16,+Bratislava',
  },
  legal: {
    companyName: 'Rastlab s. r. o.',
    ico: '54 321 987',
    dic: '2121987654',
    icDph: 'SK2121987654',
    registry: 'Zapísaná v Obchodnom registri Mestského súdu Bratislava III, odd. Sro, vl. č. 160123/B',
  },
  partners: [
    { name: 'Google Partner', status: 'Premier Partner 2026' },
    { name: 'Meta Business Partner', status: 'Certifikovaný partner' },
    { name: 'TikTok Marketing Partner', status: 'Agency Partner' },
  ],
  socials: [
    { network: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/' },
    { network: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { network: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/' },
    { network: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/' },
  ],
  trustMetrics: [
    { value: '2.4M+ €', label: 'Spravovaný rozpočet ročne' },
    { value: '7.8×', label: 'Priemerné ROAS klientov', growth: true },
    { value: '65+', label: 'Rastúcich značiek' },
    { value: '94 %', label: 'Klientov s nami viac ako rok' },
  ],
  gdprNotice:
    'Osobné údaje spracúvame v súlade s nariadením GDPR výlučne na účel spracovania vášho dopytu. Údaje neposkytujeme tretím stranám a môžete kedykoľvek požiadať o ich vymazanie.',
};
