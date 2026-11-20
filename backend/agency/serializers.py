import re

from rest_framework import serializers

from .models import (
    CaseStudy,
    MarketingAuditLead,
    MarketingService,
    ProjectProposalRequest,
    ServiceCategory,
    TeamMember,
)

PHONE_RE = re.compile(r"^\+?[0-9 ()/-]{9,20}$")
DOMAIN_RE = re.compile(r"^(https?://)?([\w-]+\.)+[a-z]{2,}(/\S*)?$", re.IGNORECASE)
HANDLE_RE = re.compile(r"^@[\w.]{2,60}$")


class ServiceCategorySerializer(serializers.ModelSerializer):
    service_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "slug", "short_summary", "icon_name", "display_order", "service_count"]


class CategoryBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "slug", "icon_name"]


class MarketingServiceListSerializer(serializers.ModelSerializer):
    category = CategoryBriefSerializer(read_only=True)

    class Meta:
        model = MarketingService
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "short_description",
            "deliverables",
            "tools_used",
            "management_fee_from_eur",
            "is_featured",
        ]


class MarketingServiceDetailSerializer(MarketingServiceListSerializer):
    class Meta(MarketingServiceListSerializer.Meta):
        fields = MarketingServiceListSerializer.Meta.fields + [
            "detailed_description",
            "ideal_for",
            "success_metrics",
        ]


class CaseStudySerializer(serializers.ModelSerializer):
    category = CategoryBriefSerializer(read_only=True)

    class Meta:
        model = CaseStudy
        fields = [
            "id",
            "title",
            "slug",
            "client_sector",
            "category",
            "challenge_summary",
            "strategy_executed",
            "primary_kpi_value",
            "primary_kpi_label",
            "secondary_kpi_value",
            "secondary_kpi_label",
            "tertiary_kpi_value",
            "tertiary_kpi_label",
            "channels_used",
            "duration_label",
            "cover_image_url",
            "is_featured",
        ]


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ["id", "full_name", "role_title", "bio", "certifications", "photo_url", "linkedin_url"]


def _clean_text(value: str, field_label: str, min_length: int) -> str:
    value = (value or "").strip()
    if len(value) < min_length:
        raise serializers.ValidationError(
            f"{field_label} musí mať aspoň {min_length} znaky."
            if min_length < 5
            else f"{field_label} musí mať aspoň {min_length} znakov."
        )
    return value


class ProjectProposalRequestSerializer(serializers.ModelSerializer):
    # Honeypot field: real users never see or fill it.
    company_fax = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = ProjectProposalRequest
        fields = [
            "id",
            "selected_services",
            "monthly_ad_budget",
            "website_url",
            "company_name",
            "contact_name",
            "email",
            "phone",
            "project_goals",
            "company_fax",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "monthly_ad_budget": {
                "error_messages": {
                    "invalid_choice": "Vyberte jednu z ponúkaných možností rozpočtu.",
                    "required": "Vyberte mesačný reklamný rozpočet.",
                }
            },
            "email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}},
        }

    def validate_selected_services(self, value):
        if not isinstance(value, list) or not value:
            raise serializers.ValidationError("Vyberte aspoň jednu službu, o ktorú máte záujem.")
        if len(value) > 12:
            raise serializers.ValidationError("Vybrali ste príliš veľa služieb.")
        cleaned = []
        for item in value:
            if not isinstance(item, str) or not item.strip() or len(item) > 200:
                raise serializers.ValidationError("Zoznam služieb obsahuje neplatnú položku.")
            if item.strip() not in cleaned:
                cleaned.append(item.strip())
        return cleaned

    def validate_website_url(self, value):
        value = (value or "").strip()
        if value and not DOMAIN_RE.match(value):
            raise serializers.ValidationError("Zadajte platnú adresu webu, napr. www.vasa-firma.sk.")
        return value

    def validate_company_name(self, value):
        return _clean_text(value, "Názov spoločnosti", 2)

    def validate_contact_name(self, value):
        return _clean_text(value, "Meno", 3)

    def validate_phone(self, value):
        value = (value or "").strip()
        if not PHONE_RE.match(value):
            raise serializers.ValidationError("Zadajte platné telefónne číslo, napr. +421 900 123 456.")
        return value

    def validate_project_goals(self, value):
        return _clean_text(value, "Popis cieľov", 20)

    def validate(self, attrs):
        if attrs.pop("company_fax", ""):
            raise serializers.ValidationError("Odoslanie formulára zlyhalo. Skúste to prosím znova.")
        return attrs


class MarketingAuditLeadSerializer(serializers.ModelSerializer):
    company_fax = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = MarketingAuditLead
        fields = ["id", "audit_type", "website_or_profile_url", "contact_name", "email", "company_fax", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "audit_type": {
                "error_messages": {
                    "invalid_choice": "Vyberte typ auditu z ponuky.",
                    "required": "Vyberte typ auditu.",
                }
            },
            "email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}},
        }

    def validate_website_or_profile_url(self, value):
        value = (value or "").strip()
        if not (DOMAIN_RE.match(value) or HANDLE_RE.match(value)):
            raise serializers.ValidationError(
                "Zadajte adresu webu (napr. www.vas-eshop.sk) alebo profil (napr. @vasaznacka)."
            )
        return value

    def validate_contact_name(self, value):
        return _clean_text(value, "Meno", 3)

    def validate(self, attrs):
        if attrs.pop("company_fax", ""):
            raise serializers.ValidationError("Odoslanie formulára zlyhalo. Skúste to prosím znova.")
        return attrs
