from django.db import models
from django.utils.text import slugify


def unique_slug(instance: models.Model, value: str, max_length: int = 220) -> str:
    """Build a slug from `value` that is unique for the instance's model."""
    base = slugify(value)[:max_length].strip("-") or "polozka"
    slug = base
    model = type(instance)
    counter = 2
    while model.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    return slug


class SluggedModel(models.Model):
    """Abstract base that auto-generates a unique slug from `slug_source`."""

    slug_source = "name"

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, getattr(self, self.slug_source))
        super().save(*args, **kwargs)


class ServiceCategory(SluggedModel):
    name = models.CharField("Názov kategórie", max_length=120, unique=True)
    slug = models.SlugField("URL slug", max_length=140, unique=True, blank=True)
    short_summary = models.CharField("Krátke zhrnutie", max_length=300)
    icon_name = models.CharField(
        "Ikona",
        max_length=50,
        help_text="Identifikátor ikony vo frontende (napr. target, search, camera, palette, monitor, mail).",
    )
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "Kategória služieb"
        verbose_name_plural = "Kategórie služieb"

    def __str__(self) -> str:
        return self.name


class MarketingService(SluggedModel):
    category = models.ForeignKey(
        ServiceCategory,
        verbose_name="Kategória",
        on_delete=models.PROTECT,
        related_name="services",
    )
    name = models.CharField("Názov služby", max_length=200)
    slug = models.SlugField("URL slug", max_length=220, unique=True, blank=True)
    short_description = models.CharField("Krátky popis", max_length=400)
    detailed_description = models.TextField("Detailný popis")
    ideal_for = models.JSONField(
        "Pre koho je služba ideálna",
        default=list,
        blank=True,
        help_text='Zoznam typov klientov, napr. ["E-shopy s obratom nad 20 000 € mesačne"].',
    )
    deliverables = models.JSONField(
        "Výstupy (deliverables)",
        default=list,
        blank=True,
        help_text='Zoznam výstupov, napr. ["Hĺbkový audit reklamných účtov", "Mesačný reporting"].',
    )
    tools_used = models.JSONField(
        "Použité nástroje",
        default=list,
        blank=True,
        help_text='Zoznam nástrojov, napr. ["Google Ads", "Meta Ads", "GA4"].',
    )
    success_metrics = models.JSONField(
        "Ako meriame úspech",
        default=list,
        blank=True,
        help_text='Zoznam KPI, napr. ["ROAS", "PNO", "Cena za konverziu"].',
    )
    management_fee_from_eur = models.DecimalField(
        "Poplatok za správu od (€ / mes.)",
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_featured = models.BooleanField("Zvýraznená na úvodnej stránke", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)
    updated_at = models.DateTimeField("Upravené", auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "Marketingová služba"
        verbose_name_plural = "Marketingové služby"

    def __str__(self) -> str:
        return self.name


class CaseStudy(SluggedModel):
    slug_source = "title"

    title = models.CharField("Názov prípadovej štúdie", max_length=220)
    slug = models.SlugField("URL slug", max_length=240, unique=True, blank=True)
    client_sector = models.CharField("Sektor klienta", max_length=120)
    category = models.ForeignKey(
        ServiceCategory,
        verbose_name="Kategória",
        on_delete=models.PROTECT,
        related_name="case_studies",
    )
    challenge_summary = models.TextField("Výzva klienta")
    strategy_executed = models.TextField("Realizovaná stratégia")
    primary_kpi_value = models.CharField("Hlavné KPI – hodnota", max_length=30, help_text="Napr. +245 %")
    primary_kpi_label = models.CharField("Hlavné KPI – popis", max_length=120)
    secondary_kpi_value = models.CharField(
        "Vedľajšie KPI – hodnota", max_length=30, blank=True, help_text="Napr. 8.6×"
    )
    secondary_kpi_label = models.CharField("Vedľajšie KPI – popis", max_length=120, blank=True)
    tertiary_kpi_value = models.CharField("Doplnkové KPI – hodnota", max_length=30, blank=True)
    tertiary_kpi_label = models.CharField("Doplnkové KPI – popis", max_length=120, blank=True)
    channels_used = models.JSONField("Použité kanály", default=list, blank=True)
    duration_label = models.CharField(
        "Dĺžka spolupráce", max_length=60, blank=True, help_text="Napr. 9 mesiacov"
    )
    cover_image_url = models.URLField("URL titulného obrázka", max_length=500)
    is_featured = models.BooleanField("Zvýraznená na úvodnej stránke", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)

    class Meta:
        ordering = ["display_order", "-created_at"]
        verbose_name = "Prípadová štúdia"
        verbose_name_plural = "Prípadové štúdie"

    def __str__(self) -> str:
        return self.title


class TeamMember(models.Model):
    full_name = models.CharField("Meno a priezvisko", max_length=120)
    role_title = models.CharField("Pozícia", max_length=160)
    bio = models.TextField("Krátky profil")
    certifications = models.CharField("Certifikácie", max_length=300, blank=True)
    photo_url = models.URLField("URL fotografie", max_length=500)
    linkedin_url = models.URLField("LinkedIn profil", max_length=300, blank=True)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    is_active = models.BooleanField("Zobraziť na webe", default=True)

    class Meta:
        ordering = ["display_order", "full_name"]
        verbose_name = "Člen tímu"
        verbose_name_plural = "Členovia tímu"

    def __str__(self) -> str:
        return f"{self.full_name} – {self.role_title}"


class ProjectProposalRequest(models.Model):
    class MonthlyBudget(models.TextChoices):
        UP_TO_1500 = "do_1500", "Do 1 500 € / mes."
        FROM_1500_TO_5000 = "1500_5000", "1 500 € – 5 000 € / mes."
        FROM_5000_TO_15000 = "5000_15000", "5 000 € – 15 000 € / mes."
        OVER_15000 = "nad_15000", "Nad 15 000 € / mes."

    selected_services = models.JSONField("Vybrané služby", default=list)
    monthly_ad_budget = models.CharField(
        "Mesačný reklamný rozpočet", max_length=20, choices=MonthlyBudget.choices
    )
    website_url = models.CharField("Web / e-shop", max_length=300, blank=True)
    company_name = models.CharField("Spoločnosť", max_length=200)
    contact_name = models.CharField("Kontaktná osoba", max_length=150)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=40)
    project_goals = models.TextField("Ciele projektu")
    is_processed = models.BooleanField("Spracované", default=False)
    internal_note = models.TextField("Interná poznámka", blank=True)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Dopyt na spoluprácu"
        verbose_name_plural = "Dopyty na spoluprácu"

    def __str__(self) -> str:
        return f"{self.company_name} ({self.contact_name})"


class MarketingAuditLead(models.Model):
    class AuditType(models.TextChoices):
        PPC = "ppc_audit", "Bezplatný audit Google & Meta Ads"
        SEO_UX = "seo_ux_audit", "SEO & Konverzný audit webu / e-shopu"
        SOCIAL = "social_audit", "Audit Instagramu a TikToku"

    audit_type = models.CharField("Typ auditu", max_length=20, choices=AuditType.choices)
    website_or_profile_url = models.CharField("Web alebo profil", max_length=300)
    contact_name = models.CharField("Meno", max_length=150)
    email = models.EmailField("E-mail")
    is_resolved = models.BooleanField("Vybavené", default=False)
    internal_note = models.TextField("Interná poznámka", blank=True)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Žiadosť o bezplatný audit"
        verbose_name_plural = "Žiadosti o bezplatný audit"

    def __str__(self) -> str:
        return f"{self.get_audit_type_display()} – {self.website_or_profile_url}"
