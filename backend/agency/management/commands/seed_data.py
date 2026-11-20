"""Seed the database with demo agency content (Slovak copy).

Idempotent: records are matched by slug (or full name) and updated in place,
so the command can be re-run safely at any time.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from agency.models import CaseStudy, MarketingService, ServiceCategory, TeamMember


def unsplash(photo_id: str, width: int = 1200) -> str:
    return f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w={width}&q=80"


CATEGORIES = [
    {
        "slug": "performance-marketing-ppc",
        "name": "Performance Marketing & PPC",
        "short_summary": "Google Ads, Meta Ads a LinkedIn kampane riadené ziskom, nie kliknutiami.",
        "icon_name": "target",
    },
    {
        "slug": "seo-organicky-rast",
        "name": "SEO & Organický rast",
        "short_summary": "Technické SEO, obsah a linkbuilding, ktoré budujú dlhodobý a lacný zdroj predajov.",
        "icon_name": "search",
    },
    {
        "slug": "social-media-content-studio",
        "name": "Social Media & Content Studio",
        "short_summary": "Reels, TikTok a kreatívy, ktoré zastavia scrollovanie a predávajú.",
        "icon_name": "camera",
    },
    {
        "slug": "strategia-znacky-kreativa",
        "name": "Stratégia značky & Kreatíva",
        "short_summary": "Positioning, vizuálna identita a komunikačný koncept, ktorý si zákazník zapamätá.",
        "icon_name": "palette",
    },
    {
        "slug": "tvorba-webov-cro",
        "name": "Tvorba webov & CRO (Optimalizácia konverzií)",
        "short_summary": "Rýchle weby a e-shopy navrhnuté na konverzie, testované na reálnych dátach.",
        "icon_name": "monitor",
    },
    {
        "slug": "e-mail-marketing-automatizacia",
        "name": "E-mail marketing & Automatizácia",
        "short_summary": "Automatizované scenáre v Klaviyo a Ecomail, ktoré zvyšujú návratnosť zákazníkov.",
        "icon_name": "mail",
    },
]


SERVICES = [
    {
        "slug": "vykonnostne-google-ads-a-meta-ads-kampane",
        "category": "performance-marketing-ppc",
        "name": "Výkonnostné Google Ads a Meta Ads kampane",
        "short_description": "Kampane vo vyhľadávaní, Performance Max a na Facebooku či Instagrame, ktoré optimalizujeme na zisk a cieľové PNO – nie na lacné kliky.",
        "detailed_description": (
            "Prevezmeme vaše reklamné účty, nájdeme miesta, kde unikajú peniaze, a postavíme štruktúru kampaní, "
            "ktorá škáluje zisk. Pracujeme s maržami produktov, sezónnosťou aj kapacitou vášho skladu. "
            "Každý týždeň testujeme nové kreatívy a publiká a rozpočet presúvame tam, kde prináša najvyšší výnos.\n\n"
            "Nepredávame hodiny – predávame výsledok. Ku každému klientovi pristupuje senior špecialista, "
            "ktorý s vami komunikuje priamo, bez account manažérov v strede."
        ),
        "ideal_for": [
            "E-shopy s obratom od 10 000 € mesačne, ktoré chcú škálovať pri udržaní PNO",
            "Značky, ktorým predchádzajúca agentúra reportovala kliky namiesto tržieb",
            "Firmy so sezónnym predajom, ktoré potrebujú pružne riadiť rozpočet",
        ],
        "deliverables": [
            "Hĺbkový audit reklamných účtov a konkurencie",
            "Návrh kampaní a tvorba výkonnostných kreatív",
            "Nastavenie pokročilej analytiky (GA4, Server-Side GTM)",
            "Týždenné A/B testovanie reklám a vstupných stránok",
            "Pravidelný reporting s dôrazom na zisk a PNO",
        ],
        "tools_used": ["Google Ads", "Meta Ads", "GA4", "Server-Side GTM", "Looker Studio"],
        "success_metrics": ["ROAS a PNO", "Hrubý zisk z kampaní", "Cena za akvizíciu nového zákazníka", "Podiel nových zákazníkov"],
        "management_fee_from_eur": Decimal("690"),
        "is_featured": True,
    },
    {
        "slug": "google-shopping-a-performance-max-pre-e-shopy",
        "category": "performance-marketing-ppc",
        "name": "Google Shopping a Performance Max pre e-shopy",
        "short_description": "Optimalizovaný produktový feed, segmentácia podľa marže a Performance Max kampane, ktoré nepredávajú len bestsellery.",
        "detailed_description": (
            "Produktový feed je základ úspechu v Google Shopping. Prepíšeme názvy produktov, doplníme atribúty "
            "a rozdelíme sortiment podľa marže a výkonu. Performance Max kampane následne riadime tak, aby "
            "algoritmus nemíňal rozpočet na brandové vyhľadávania a produkty s nulovou maržou."
        ),
        "ideal_for": [
            "E-shopy so sortimentom nad 200 produktov",
            "Obchody, ktoré predávajú cez Google Merchant Center, Heureku či Pricemanie",
        ],
        "deliverables": [
            "Audit a optimalizácia produktového feedu",
            "Segmentácia produktov podľa marže a obrátkovosti",
            "Nastavenie Performance Max s vylúčením brandu",
            "Mesačný reporting ziskovosti po kategóriách",
        ],
        "tools_used": ["Google Ads", "Merchant Center", "Mergado", "GA4"],
        "success_metrics": ["ROAS po kategóriách", "Podiel predajov mimo bestsellerov", "PNO"],
        "management_fee_from_eur": Decimal("590"),
        "is_featured": False,
    },
    {
        "slug": "linkedin-ads-a-b2b-lead-generation",
        "category": "performance-marketing-ppc",
        "name": "LinkedIn Ads a B2B lead generation",
        "short_description": "Cielenie na rozhodovateľov podľa pozície, odvetvia a veľkosti firmy. Merateľné dopyty, ktoré váš obchod naozaj uzavrie.",
        "detailed_description": (
            "V B2B nerozhoduje počet leadov, ale ich kvalita. Prepojíme kampane s vaším CRM, aby sme vedeli, "
            "ktoré reklamy prinášajú podpísané zmluvy. Kombinujeme LinkedIn Ads, Google Search a remarketing "
            "s obsahom, ktorý buduje dôveru počas dlhého nákupného cyklu."
        ),
        "ideal_for": [
            "Softvérové firmy a SaaS s hodnotou zmluvy nad 3 000 €",
            "Poradenské, výrobné a IT spoločnosti s dlhým obchodným cyklom",
        ],
        "deliverables": [
            "Definícia ideálneho zákazníka (ICP) a buyer persón",
            "LinkedIn Lead Gen formuláre a vstupné stránky",
            "Prepojenie s CRM (HubSpot, Pipedrive) a offline konverzie",
            "Reporting ceny za kvalifikovaný lead (SQL)",
        ],
        "tools_used": ["LinkedIn Ads", "Google Ads", "HubSpot", "Pipedrive", "GA4"],
        "success_metrics": ["Cena za kvalifikovaný lead", "Pomer MQL → SQL", "Hodnota obchodného pipeline"],
        "management_fee_from_eur": Decimal("750"),
        "is_featured": False,
    },
    {
        "slug": "komplexne-seo-a-obsahovy-marketing",
        "category": "seo-organicky-rast",
        "name": "Komplexné SEO a obsahový marketing",
        "short_description": "Technické SEO, analýza kľúčových slov, obsahová stratégia a linkbuilding pre stabilný rast organickej návštevnosti a tržieb.",
        "detailed_description": (
            "SEO je najlacnejší zdroj zákazníkov – ak sa robí systematicky. Začíname technickým auditom "
            "a analýzou kľúčových slov s reálnym nákupným potenciálom. Potom tvoríme obsah, ktorý odpovedá na "
            "otázky vašich zákazníkov, a budujeme autoritu domény kvalitnými odkazmi zo slovenských a českých webov."
        ),
        "ideal_for": [
            "E-shopy a weby, ktoré chcú znížiť závislosť od platenej reklamy",
            "Firmy v konkurenčných odvetviach s dlhodobým horizontom rastu",
        ],
        "deliverables": [
            "Technický SEO audit a prioritizovaný plán opráv",
            "Analýza kľúčových slov a mapovanie na stránky",
            "Tvorba SEO článkov a optimalizácia kategórií",
            "Linkbuilding zo slovenských a českých médií",
            "Mesačný report pozícií a organických tržieb",
        ],
        "tools_used": ["Ahrefs", "Screaming Frog", "Google Search Console", "GA4", "Marketing Miner"],
        "success_metrics": ["Organická návštevnosť", "Tržby z organiky", "Počet kľúčových slov v TOP 3"],
        "management_fee_from_eur": Decimal("650"),
        "is_featured": True,
    },
    {
        "slug": "technicke-seo-a-migracia-webu",
        "category": "seo-organicky-rast",
        "name": "Technické SEO a bezpečná migrácia webu",
        "short_description": "Rýchlosť načítania, Core Web Vitals, indexácia a presmerovania – aby ste pri redizajne neprišli o roky budovanú návštevnosť.",
        "detailed_description": (
            "Pri prechode na nový web či e-shopovú platformu firmy často stratia až polovicu organickej "
            "návštevnosti. Pripravíme mapu presmerovaní, skontrolujeme štruktúrované dáta a indexáciu "
            "a po spustení monitorujeme každú dôležitú URL."
        ),
        "ideal_for": [
            "Firmy pred redizajnom alebo zmenou e-shopovej platformy",
            "Weby s problémami s indexáciou alebo pomalým načítaním",
        ],
        "deliverables": [
            "Crawl a audit pôvodného webu",
            "Mapa 301 presmerovaní a kontrola po spustení",
            "Optimalizácia Core Web Vitals",
            "Štruktúrované dáta (Schema.org)",
        ],
        "tools_used": ["Screaming Frog", "Google Search Console", "PageSpeed Insights", "Ahrefs"],
        "success_metrics": ["Zachovaná organická návštevnosť", "Core Web Vitals", "Počet indexovaných stránok"],
        "management_fee_from_eur": Decimal("490"),
        "is_featured": False,
    },
    {
        "slug": "sprava-socialnych-sieti-a-produkcia-reels-tiktok-videi",
        "category": "social-media-content-studio",
        "name": "Správa sociálnych sietí a produkcia Reels / TikTok videí",
        "short_description": "Obsahová stratégia, vlastná video produkcia a komunita, ktorá z followerov robí zákazníkov.",
        "detailed_description": (
            "Na sociálnych sieťach vyhráva ten, kto zastaví scrollovanie v prvej sekunde. Naše content studio "
            "pripravuje scenáre, natáča a strihá krátke videá priamo pre Instagram Reels a TikTok. "
            "Obsah plánujeme podľa dát – sledujeme dopozeranie, uloženia a zdieľania, nie iba lajky."
        ),
        "ideal_for": [
            "Gastro, beauty, móda a lifestyle značky",
            "Firmy, ktoré chcú budovať značku a zároveň predávať",
        ],
        "deliverables": [
            "Obsahová stratégia a mesačný redakčný plán",
            "Produkcia 8–16 Reels / TikTok videí mesačne",
            "Copywriting, grafika a community management",
            "Mesačná analýza výkonu obsahu",
        ],
        "tools_used": ["Instagram", "TikTok", "Meta Business Suite", "CapCut", "Adobe Premiere Pro"],
        "success_metrics": ["Dosah a miera dopozerania", "Rast komunity", "Návštevy webu a predaje zo sociálnych sietí"],
        "management_fee_from_eur": Decimal("890"),
        "is_featured": True,
    },
    {
        "slug": "influencer-a-ugc-kampane",
        "category": "social-media-content-studio",
        "name": "Influencer a UGC kampane",
        "short_description": "Výber overených tvorcov, autentické UGC videá do reklám a merateľné influencer kampane s jasnými KPI.",
        "detailed_description": (
            "Autentický obsah od skutočných ľudí dnes v reklamách prekonáva štúdiové kreatívy. Vyberieme "
            "tvorcov podľa kvality publika, nie počtu followerov, pripravíme brief a obsah nasadíme do "
            "výkonnostných kampaní."
        ),
        "ideal_for": [
            "D2C značky a e-shopy, ktoré potrebujú neustály prísun reklamných kreatív",
            "Nové produkty, ktoré potrebujú rýchlo získať dôveru",
        ],
        "deliverables": [
            "Výber tvorcov a vyjednanie spolupráce",
            "Kreatívny brief a schvaľovanie obsahu",
            "Produkcia UGC videí pre reklamy",
            "Meranie výkonu cez promo kódy a UTM",
        ],
        "tools_used": ["TikTok", "Instagram", "Meta Ads", "GA4"],
        "success_metrics": ["Cena za tisíc zobrazení (CPM)", "Predaje cez promo kódy", "Výkon UGC kreatív v reklamách"],
        "management_fee_from_eur": Decimal("590"),
        "is_featured": False,
    },
    {
        "slug": "strategia-znacky-rebranding-a-vizualna-identita",
        "category": "strategia-znacky-kreativa",
        "name": "Stratégia značky, rebranding a vizuálna identita",
        "short_description": "Positioning, naming, logo a kompletný dizajn manuál. Značka, ktorá sa odlíši od konkurencie a obhájí vyššiu cenu.",
        "detailed_description": (
            "Silná značka znižuje cenu za akvizíciu a zvyšuje ochotu zákazníka zaplatiť viac. Začíname "
            "workshopom a výskumom zákazníkov, definujeme positioning a tón komunikácie. Následne navrhneme "
            "vizuálnu identitu, ktorá funguje na webe, v reklame, na obale aj na sociálnych sieťach."
        ),
        "ideal_for": [
            "Nové značky pred vstupom na trh",
            "Zavedené firmy, ktorých vizuál prestal zodpovedať kvalite produktu",
        ],
        "deliverables": [
            "Strategický workshop a výskum zákazníkov",
            "Positioning, tón komunikácie a hlavný claim",
            "Logo, typografia, farby a dizajn manuál",
            "Šablóny pre sociálne siete a reklamy",
        ],
        "tools_used": ["Figma", "Adobe Illustrator", "Adobe After Effects", "Miro"],
        "success_metrics": ["Spontánna znalosť značky", "Miera prekliku kreatív", "Priemerná hodnota objednávky"],
        "management_fee_from_eur": None,
        "is_featured": True,
    },
    {
        "slug": "tvorba-webstranok-e-shopov-a-zvysovanie-konverzii-cro",
        "category": "tvorba-webov-cro",
        "name": "Tvorba webstránok, e-shopov a zvyšovanie konverzií (CRO)",
        "short_description": "Rýchle weby a e-shopy navrhnuté podľa dát. Heatmapy, A/B testy a UX úpravy, ktoré z rovnakej návštevnosti spravia viac objednávok.",
        "detailed_description": (
            "Zdvojnásobiť konverzný pomer je často lacnejšie ako zdvojnásobiť rozpočet na reklamu. "
            "Analyzujeme správanie návštevníkov, identifikujeme bariéry v nákupnom procese a navrhujeme "
            "úpravy, ktoré overujeme A/B testami. Nové weby staviame mobile-first, s dôrazom na rýchlosť a SEO."
        ),
        "ideal_for": [
            "E-shopy s návštevnosťou nad 10 000 relácií mesačne",
            "Firmy, ktorých web nevyzerá dôveryhodne alebo nepredáva",
        ],
        "deliverables": [
            "UX a konverzný audit s heatmapami",
            "Wireframy a dizajn v Figme",
            "Vývoj webu alebo e-shopu (Shopify, Shoptet, WordPress)",
            "Priebežné A/B testovanie a CRO úpravy",
        ],
        "tools_used": ["Figma", "Hotjar", "Microsoft Clarity", "Shopify", "Shoptet", "GA4"],
        "success_metrics": ["Konverzný pomer", "Priemerná hodnota objednávky", "Miera opustenia košíka"],
        "management_fee_from_eur": Decimal("790"),
        "is_featured": True,
    },
    {
        "slug": "automatizovany-e-mail-marketing-a-retencia-klaviyo-ecomail",
        "category": "e-mail-marketing-automatizacia",
        "name": "Automatizovaný e-mail marketing a retencia (Klaviyo / Ecomail)",
        "short_description": "Opustený košík, uvítacia séria, win-back a segmentované kampane. E-mail, ktorý zarába aj keď spíte.",
        "detailed_description": (
            "Získať nového zákazníka je 5× drahšie ako udržať existujúceho. Nastavíme automatizované scenáre "
            "podľa správania zákazníkov, segmentujeme databázu a pripravujeme pravidelné kampane s dizajnom "
            "a textami, ktoré sú v súlade so značkou. Všetko v súlade s GDPR."
        ),
        "ideal_for": [
            "E-shopy s databázou nad 2 000 kontaktov",
            "Značky s opakovaným nákupom – kozmetika, potraviny, móda, doplnky výživy",
        ],
        "deliverables": [
            "Audit databázy a nastavenie segmentácie",
            "Automatizácie: uvítacia séria, opustený košík, post-purchase, win-back",
            "2–4 newslettre mesačne vrátane dizajnu a copywritingu",
            "Reporting tržieb z e-mailového kanála",
        ],
        "tools_used": ["Klaviyo", "Ecomail", "Mailchimp", "Shopify", "GA4"],
        "success_metrics": ["Podiel tržieb z e-mailu", "Miera opakovaného nákupu", "Tržba na odberateľa"],
        "management_fee_from_eur": Decimal("450"),
        "is_featured": True,
    },
]


CASE_STUDIES = [
    {
        "slug": "skalovanie-slovenskeho-e-shopu-o-245-pri-udrzani-pno-pod-12",
        "title": "Škálovanie slovenského e-shopu o 245 % pri udržaní PNO pod 12 %",
        "client_sector": "E-commerce & Móda",
        "category": "performance-marketing-ppc",
        "challenge_summary": (
            "Módny e-shop stagnoval na úrovni 38 000 € mesačne. Kampane predchádzajúcej agentúry míňali "
            "rozpočet na brandové vyhľadávania a PNO sa pri každom pokuse o navýšenie rozpočtu vyšplhalo nad 20 %."
        ),
        "strategy_executed": (
            "Prestavali sme účet podľa marží produktov, oddelili brand od Performance Max a nasadili server-side "
            "meranie. Každý týždeň sme testovali nové UGC kreatívy na Meta Ads a postupne navyšovali rozpočet iba "
            "v kampaniach, ktoré držali cieľové PNO."
        ),
        "primary_kpi_value": "+245 %",
        "primary_kpi_label": "Nárast mesačných tržieb",
        "secondary_kpi_value": "8.6×",
        "secondary_kpi_label": "Priemerné ROAS",
        "tertiary_kpi_value": "11.6 %",
        "tertiary_kpi_label": "PNO",
        "channels_used": ["Google Ads", "Performance Max", "Meta Ads", "Server-Side GTM"],
        "duration_label": "11 mesiacov",
        "cover_image_url": unsplash("photo-1441986300917-64674bd600d8"),
        "is_featured": True,
    },
    {
        "slug": "380-kvalifikovanych-b2b-leadov-mesacne-cez-linkedin-a-google-search",
        "title": "Získanie 380+ kvalifikovaných B2B leadov mesačne cez LinkedIn a Google Search",
        "client_sector": "B2B Software & Služby",
        "category": "performance-marketing-ppc",
        "challenge_summary": (
            "Softvérová firma pre logistiku získavala dopyty najmä z odporúčaní. Pokusy s reklamou priniesli "
            "množstvo kontaktov, ale obchodný tím ich nedokázal premeniť na zmluvy."
        ),
        "strategy_executed": (
            "Zadefinovali sme ideálneho zákazníka, prepojili kampane s HubSpotom a do Google Ads aj LinkedIn sme "
            "posielali offline konverzie z uzavretých obchodov. Algoritmy sa tak učili hľadať firmy, ktoré naozaj "
            "kupujú, nie tie, ktoré iba vyplnia formulár."
        ),
        "primary_kpi_value": "380+",
        "primary_kpi_label": "Kvalifikovaných leadov mesačne",
        "secondary_kpi_value": "−42 %",
        "secondary_kpi_label": "Cena za lead",
        "tertiary_kpi_value": "2.1 M €",
        "tertiary_kpi_label": "Hodnota obchodného pipeline",
        "channels_used": ["LinkedIn Ads", "Google Search", "HubSpot", "Remarketing"],
        "duration_label": "8 mesiacov",
        "cover_image_url": unsplash("photo-1552664730-d307ca884978"),
        "is_featured": True,
    },
    {
        "slug": "rebranding-a-viralny-start-premiovej-gastro-znacky",
        "title": "Rebranding a virálny štart prémiovej gastro značky na Instagrame a TikToku",
        "client_sector": "Gastro & FMCG",
        "category": "social-media-content-studio",
        "challenge_summary": (
            "Rodinná pražiareň kávy z východného Slovenska chcela vstúpiť do retailu, no jej značka pôsobila "
            "zastaralo a na sociálnych sieťach mala menej ako 2 000 sledujúcich."
        ),
        "strategy_executed": (
            "Navrhli sme novú vizuálnu identitu a obaly, ktoré vynikli v regáli. Naše content studio natočilo "
            "sériu krátkych videí o pôvode kávy a pražení – tri z nich prekročili 500 000 zhliadnutí a značku "
            "následne zalistovali dva veľké retailové reťazce."
        ),
        "primary_kpi_value": "1.4 M",
        "primary_kpi_label": "Organický dosah za 90 dní",
        "secondary_kpi_value": "+18 400",
        "secondary_kpi_label": "Nových sledujúcich",
        "tertiary_kpi_value": "+64 %",
        "tertiary_kpi_label": "Tržby e-shopu",
        "channels_used": ["Instagram Reels", "TikTok", "Branding", "Meta Ads"],
        "duration_label": "6 mesiacov",
        "cover_image_url": unsplash("photo-1495474472287-4d71bcdd2085"),
        "is_featured": True,
    },
    {
        "slug": "novy-web-a-cro-pre-rezidencny-projekt-168-viac-dopytov",
        "title": "Nový web a CRO pre rezidenčný projekt: o 168 % viac dopytov na obhliadky",
        "client_sector": "Reality & Development",
        "category": "tvorba-webov-cro",
        "challenge_summary": (
            "Developer v Bratislave spustil predaj 120 bytov, no web projektu bol pomalý, na mobile ťažko "
            "použiteľný a vyhľadávanie bytov vyžadovalo sťahovanie PDF cenníkov."
        ),
        "strategy_executed": (
            "Navrhli sme nový web s interaktívnym výberom bytov podľa poschodia, dispozície a ceny. Formulár "
            "na obhliadku sme skrátili na tri polia a A/B testami sme odladili výzvy k akcii."
        ),
        "primary_kpi_value": "+168 %",
        "primary_kpi_label": "Dopytov na obhliadku",
        "secondary_kpi_value": "4.3 %",
        "secondary_kpi_label": "Konverzný pomer webu",
        "tertiary_kpi_value": "92 %",
        "tertiary_kpi_label": "Bytov predaných pred kolaudáciou",
        "channels_used": ["Web & UX", "A/B testovanie", "Google Ads", "Meta Ads"],
        "duration_label": "7 mesiacov",
        "cover_image_url": unsplash("photo-1486406146926-c627a92ad1ab"),
        "is_featured": True,
    },
    {
        "slug": "organicky-rast-e-shopu-s-doplnkami-vyzivy-312",
        "title": "Organický rast e-shopu s doplnkami výživy: +312 % návštevnosti zo SEO",
        "client_sector": "Zdravie & Wellness",
        "category": "seo-organicky-rast",
        "challenge_summary": (
            "E-shop bol takmer úplne závislý od platenej reklamy. Kategórie nemali obsah a blogové články "
            "necielili na výrazy, ktoré zákazníci reálne vyhľadávajú."
        ),
        "strategy_executed": (
            "Opravili sme technické chyby indexácie, prepísali 60 kategórií a vytvorili obsahový hub s odbornými "
            "článkami overenými výživovým poradcom. Autoritu domény sme budovali odkazmi zo zdravotných médií."
        ),
        "primary_kpi_value": "+312 %",
        "primary_kpi_label": "Organická návštevnosť",
        "secondary_kpi_value": "140+",
        "secondary_kpi_label": "Kľúčových slov v TOP 3",
        "tertiary_kpi_value": "−35 %",
        "tertiary_kpi_label": "Závislosť od PPC",
        "channels_used": ["Technické SEO", "Obsahový marketing", "Linkbuilding"],
        "duration_label": "12 mesiacov",
        "cover_image_url": unsplash("photo-1460925895917-afdab827c52f"),
        "is_featured": False,
    },
    {
        "slug": "klaviyo-automatizacie-ktore-generuju-31-trzieb-e-shopu",
        "title": "Klaviyo automatizácie, ktoré generujú 31 % tržieb e-shopu s kozmetikou",
        "client_sector": "Beauty & Kozmetika",
        "category": "e-mail-marketing-automatizacia",
        "challenge_summary": (
            "Slovenská značka prírodnej kozmetiky mala databázu 24 000 kontaktov, no posielala iba občasné "
            "plošné newslettre so zľavou. Väčšina zákazníkov nakúpila len raz."
        ),
        "strategy_executed": (
            "Presunuli sme databázu do Klaviyo, nastavili 9 automatizovaných scenárov a segmentovali zákazníkov "
            "podľa typu pleti a frekvencie nákupu. Pripomienky doplnenia produktu načasované podľa jeho spotreby "
            "sa stali najvýkonnejším scenárom."
        ),
        "primary_kpi_value": "31 %",
        "primary_kpi_label": "Podiel tržieb z e-mailu",
        "secondary_kpi_value": "42×",
        "secondary_kpi_label": "Návratnosť investície",
        "tertiary_kpi_value": "+27 %",
        "tertiary_kpi_label": "Opakované nákupy",
        "channels_used": ["Klaviyo", "Automatizácie", "Segmentácia", "SMS"],
        "duration_label": "5 mesiacov",
        "cover_image_url": unsplash("photo-1556228578-8c89e6adf883"),
        "is_featured": False,
    },
]


TEAM = [
    {
        "full_name": "Mgr. Tomáš Bielik",
        "role_title": "Head of Performance & PPC Strategist",
        "bio": "Desať rokov riadi výkonnostné kampane pre e-shopy v strednej Európe. Spravoval rozpočty vyše 900 000 € ročne a verí, že jediná metrika, na ktorej záleží, je zisk.",
        "certifications": "Google Ads Certified, Meta Media Buying Professional",
        "photo_url": unsplash("photo-1507003211169-0a1dd7228f2d", 800),
    },
    {
        "full_name": "Ing. Lucia Hrnčiarová",
        "role_title": "Creative Director & Brand Strategist",
        "bio": "Viedla rebrandingy pre slovenské aj české značky z gastro a retailu. Prepája kreatívne nápady s dátami, aby kampane nielen dobre vyzerali, ale aj predávali.",
        "certifications": "Meta Creative Strategy, Adobe Certified Professional",
        "photo_url": unsplash("photo-1494790108377-be9c29b29330", 800),
    },
    {
        "full_name": "Bc. Martin Kováč",
        "role_title": "Head of SEO & Content",
        "bio": "Technický SEO špecialista, ktorý previedol bez straty návštevnosti viac ako 40 migrácií e-shopov. Tvorí obsahové stratégie postavené na reálnom nákupnom zámere.",
        "certifications": "Google Analytics 4 Certified, Ahrefs Certified",
        "photo_url": unsplash("photo-1500648767791-00dcc994a43e", 800),
    },
    {
        "full_name": "Mgr. Simona Vargová",
        "role_title": "Social Media & Video Lead",
        "bio": "Stojí za virálnymi Reels a TikTok kampaňami s miliónovým dosahom. Vedie naše content studio od scenára cez natáčanie až po strih a vyhodnotenie výkonu.",
        "certifications": "TikTok Academy Certified, Meta Certified Community Manager",
        "photo_url": unsplash("photo-1438761681033-6461ffad8d80", 800),
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovým obsahom agentúry (kategórie, služby, prípadové štúdie, tím)."

    @transaction.atomic
    def handle(self, *args, **options):
        categories: dict[str, ServiceCategory] = {}
        for order, data in enumerate(CATEGORIES, start=1):
            slug = data["slug"]
            category, _ = ServiceCategory.objects.update_or_create(
                slug=slug,
                defaults={**{k: v for k, v in data.items() if k != "slug"}, "display_order": order},
            )
            categories[slug] = category

        for order, data in enumerate(SERVICES, start=1):
            defaults = {k: v for k, v in data.items() if k not in {"slug", "category"}}
            defaults.update(category=categories[data["category"]], display_order=order)
            MarketingService.objects.update_or_create(slug=data["slug"], defaults=defaults)

        for order, data in enumerate(CASE_STUDIES, start=1):
            defaults = {k: v for k, v in data.items() if k not in {"slug", "category"}}
            defaults.update(category=categories[data["category"]], display_order=order)
            CaseStudy.objects.update_or_create(slug=data["slug"], defaults=defaults)

        for order, data in enumerate(TEAM, start=1):
            defaults = {k: v for k, v in data.items() if k != "full_name"}
            defaults.update(display_order=order, is_active=True)
            TeamMember.objects.update_or_create(full_name=data["full_name"], defaults=defaults)

        self.stdout.write(
            self.style.SUCCESS(
                f"Hotovo: {ServiceCategory.objects.count()} kategórií, "
                f"{MarketingService.objects.count()} služieb, "
                f"{CaseStudy.objects.count()} prípadových štúdií, "
                f"{TeamMember.objects.count()} členov tímu."
            )
        )
