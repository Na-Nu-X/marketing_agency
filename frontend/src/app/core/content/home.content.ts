/** Static marketing copy for the home and about pages (Slovak UI content). */

export interface WorkflowStep {
  title: string;
  description: string;
  duration: string;
  outputs: string[];
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: 'Hĺbkový audit a dáta',
    description:
      'Prejdeme reklamné účty, analytiku, web aj konkurenciu. Zistíme, kde unikajú peniaze a kde je najrýchlejší priestor na rast.',
    duration: '1. – 2. týždeň',
    outputs: ['Audit účtov a meraní', 'Analýza konkurencie', 'Mapa príležitostí'],
  },
  {
    title: 'Stratégia a kreatívny koncept',
    description:
      'Nastavíme ciele v eurách – tržby, PNO, cenu za lead. Navrhneme mix kanálov a kreatívny koncept, ktorý zastaví scrollovanie.',
    duration: '2. – 3. týždeň',
    outputs: ['Mediaplán a KPI', 'Kreatívny koncept', 'Plán testov'],
  },
  {
    title: 'Spustenie a A/B testovanie',
    description:
      'Spúšťame kampane s presným meraním a každý týždeň testujeme kreatívy, publiká aj vstupné stránky. Rozhodujú dáta, nie dojmy.',
    duration: '4. – 8. týždeň',
    outputs: ['Spustenie kampaní', 'Týždenné A/B testy', 'Server-side meranie'],
  },
  {
    title: 'Škálovanie zisku a transparentný reporting',
    description:
      'Rozpočet presúvame tam, kde zarába najviac. Každý mesiac dostanete prehľadný report a stretnutie so seniorom, ktorý účet riadi.',
    duration: 'Od 3. mesiaca',
    outputs: ['Live dashboard', 'Mesačný strategický call', 'Plán škálovania'],
  },
];

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  metric: string;
  metricLabel: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Prvýkrát máme agentúru, ktorá rozpráva o zisku, nie o kliknutiach. Za necelý rok sme strojnásobili tržby a PNO máme stále pod kontrolou.',
    author: 'Petra Kollárová',
    role: 'CEO & spoluzakladateľka',
    company: 'Módny e-shop',
    metric: '+245 %',
    metricLabel: 'tržby',
  },
  {
    quote:
      'Obchodný tím konečne dostáva leady, ktoré má zmysel volať. Prepojenie kampaní s CRM nám ukázalo, ktoré reklamy skutočne prinášajú zmluvy.',
    author: 'Ing. Rastislav Ďurica',
    role: 'Obchodný riaditeľ',
    company: 'B2B softvér pre logistiku',
    metric: '−42 %',
    metricLabel: 'cena za lead',
  },
  {
    quote:
      'Od rebrandingu po virálne videá – všetko pod jednou strechou. Vďaka novej značke a obsahu nás zalistovali dva veľké retailové reťazce.',
    author: 'Michal Hudák',
    role: 'Majiteľ',
    company: 'Rodinná pražiareň kávy',
    metric: '1.4 M',
    metricLabel: 'organický dosah',
  },
];

export interface Pillar {
  icon: 'zap' | 'shield' | 'users';
  title: string;
  description: string;
}

export const AGENCY_PILLARS: Pillar[] = [
  {
    icon: 'zap',
    title: 'Dáta + kreatíva pod jednou strechou',
    description:
      'Performance špecialisti, dizajnéri, copywriteri a video tím sedia pri jednom stole. Kreatívy navrhujeme podľa dát a dáta vyhodnocujeme s ohľadom na značku.',
  },
  {
    icon: 'shield',
    title: 'Žiadne dlhé viazanosti bez výsledkov',
    description:
      'Spolupráca s výpovednou lehotou 30 dní. Klienti s nami zostávajú, pretože vidia výsledky v eurách – nie preto, že musia.',
  },
  {
    icon: 'users',
    title: 'Priamy prístup k špecialistom',
    description:
      'Žiadny tichý telefón cez account manažérov. S vaším účtom pracuje a komunikuje priamo senior, ktorý zaň zodpovedá.',
  },
];
