from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html, format_html_join

from .models import (
    CaseStudy,
    MarketingAuditLead,
    MarketingService,
    ProjectProposalRequest,
    ServiceCategory,
    TeamMember,
)


def _as_list(value) -> str:
    if not value:
        return "—"
    return ", ".join(str(item) for item in value)


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "icon_name", "service_count", "display_order"]
    list_editable = ["display_order"]
    search_fields = ["name", "short_summary"]
    prepopulated_fields = {"slug": ("name",)}

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_service_count=Count("services"))

    @admin.display(description="Počet služieb", ordering="_service_count")
    def service_count(self, obj):
        return obj._service_count


@admin.register(MarketingService)
class MarketingServiceAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "fee_display", "is_featured", "display_order"]
    list_editable = ["is_featured", "display_order"]
    list_filter = ["category", "is_featured"]
    search_fields = ["name", "short_description", "detailed_description"]
    prepopulated_fields = {"slug": ("name",)}
    list_select_related = ["category"]
    fieldsets = [
        (None, {"fields": ["category", "name", "slug", "is_featured", "display_order"]}),
        ("Popis", {"fields": ["short_description", "detailed_description"]}),
        (
            "Detaily služby",
            {
                "description": "Zoznamy zadávajte vo formáte JSON, napr. [\"Google Ads\", \"GA4\"].",
                "fields": ["ideal_for", "deliverables", "tools_used", "success_metrics"],
            },
        ),
        ("Cena", {"fields": ["management_fee_from_eur"]}),
    ]

    @admin.display(description="Správa od", ordering="management_fee_from_eur")
    def fee_display(self, obj):
        if obj.management_fee_from_eur is None:
            return "Individuálne"
        return f"{obj.management_fee_from_eur:,.0f} € / mes.".replace(",", " ")


@admin.register(CaseStudy)
class CaseStudyAdmin(admin.ModelAdmin):
    list_display = ["title", "client_sector", "category", "kpi_display", "is_featured", "display_order"]
    list_editable = ["is_featured", "display_order"]
    list_filter = ["category", "is_featured", "client_sector"]
    search_fields = ["title", "client_sector", "challenge_summary"]
    prepopulated_fields = {"slug": ("title",)}
    list_select_related = ["category"]
    readonly_fields = ["cover_preview"]
    fieldsets = [
        (None, {"fields": ["title", "slug", "client_sector", "category", "duration_label", "is_featured", "display_order"]}),
        ("Príbeh", {"fields": ["challenge_summary", "strategy_executed", "channels_used"]}),
        (
            "Výsledky (KPI)",
            {
                "fields": [
                    ("primary_kpi_value", "primary_kpi_label"),
                    ("secondary_kpi_value", "secondary_kpi_label"),
                    ("tertiary_kpi_value", "tertiary_kpi_label"),
                ]
            },
        ),
        ("Obrázok", {"fields": ["cover_image_url", "cover_preview"]}),
    ]

    @admin.display(description="Hlavné KPI")
    def kpi_display(self, obj):
        return f"{obj.primary_kpi_value} {obj.primary_kpi_label}"

    @admin.display(description="Náhľad")
    def cover_preview(self, obj):
        if not obj.cover_image_url:
            return "—"
        return format_html('<img src="{}" style="max-width:320px;border-radius:4px" alt="">', obj.cover_image_url)


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ["full_name", "role_title", "is_active", "display_order"]
    list_editable = ["is_active", "display_order"]
    search_fields = ["full_name", "role_title"]


@admin.action(description="Označiť ako spracované")
def mark_processed(modeladmin, request, queryset):
    queryset.update(is_processed=True)


@admin.action(description="Označiť ako vybavené")
def mark_resolved(modeladmin, request, queryset):
    queryset.update(is_resolved=True)


@admin.register(ProjectProposalRequest)
class ProjectProposalRequestAdmin(admin.ModelAdmin):
    list_display = ["company_name", "contact_name", "email", "phone", "monthly_ad_budget", "services_display", "is_processed", "created_at"]
    list_editable = ["is_processed"]
    list_filter = ["is_processed", "monthly_ad_budget", "created_at"]
    search_fields = ["company_name", "contact_name", "email", "phone", "website_url"]
    date_hierarchy = "created_at"
    actions = [mark_processed]
    readonly_fields = ["services_list", "created_at"]
    fieldsets = [
        ("Kontakt", {"fields": ["company_name", "contact_name", "email", "phone", "website_url"]}),
        ("Dopyt", {"fields": ["services_list", "selected_services", "monthly_ad_budget", "project_goals"]}),
        ("Interné", {"fields": ["is_processed", "internal_note", "created_at"]}),
    ]

    @admin.display(description="Služby")
    def services_display(self, obj):
        return _as_list(obj.selected_services)

    @admin.display(description="Vybrané služby (prehľad)")
    def services_list(self, obj):
        if not obj.selected_services:
            return "—"
        return format_html("<ul style='margin:0;padding-left:1.2em'>{}</ul>", format_html_join("", "<li>{}</li>", ((s,) for s in obj.selected_services)))


@admin.register(MarketingAuditLead)
class MarketingAuditLeadAdmin(admin.ModelAdmin):
    list_display = ["website_or_profile_url", "audit_type", "contact_name", "email", "is_resolved", "created_at"]
    list_editable = ["is_resolved"]
    list_filter = ["is_resolved", "audit_type", "created_at"]
    search_fields = ["website_or_profile_url", "contact_name", "email"]
    date_hierarchy = "created_at"
    actions = [mark_resolved]
    readonly_fields = ["created_at"]

