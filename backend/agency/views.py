from django.db.models import Count, TextField
from django.db.models.functions import Cast
from rest_framework import mixins, viewsets
from rest_framework.throttling import ScopedRateThrottle

from .filters import CaseStudyFilter, MarketingServiceFilter
from .models import (
    CaseStudy,
    MarketingAuditLead,
    MarketingService,
    ProjectProposalRequest,
    ServiceCategory,
    TeamMember,
)
from .serializers import (
    CaseStudySerializer,
    MarketingAuditLeadSerializer,
    MarketingServiceDetailSerializer,
    MarketingServiceListSerializer,
    ProjectProposalRequestSerializer,
    ServiceCategorySerializer,
    TeamMemberSerializer,
)


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Marketing service categories with the number of services in each."""

    serializer_class = ServiceCategorySerializer
    lookup_field = "slug"
    filter_backends: list = []
    queryset = ServiceCategory.objects.annotate(service_count=Count("services", distinct=True)).order_by(
        "display_order", "name"
    )


class MarketingServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """Agency services. Filters: `category` (slug), `featured`, `search`, `ordering`."""

    lookup_field = "slug"
    filterset_class = MarketingServiceFilter
    # `tools_text` is a text cast of the JSON tools list so it can be searched.
    search_fields = ["name", "short_description", "tools_text", "category__name"]
    ordering_fields = ["name", "management_fee_from_eur", "display_order", "created_at"]
    ordering = ["display_order", "name"]

    def get_queryset(self):
        return MarketingService.objects.select_related("category").annotate(
            tools_text=Cast("tools_used", output_field=TextField())
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MarketingServiceDetailSerializer
        return MarketingServiceListSerializer


class CaseStudyViewSet(viewsets.ReadOnlyModelViewSet):
    """Client case studies. Filters: `category` (slug), `featured`."""

    serializer_class = CaseStudySerializer
    lookup_field = "slug"
    filterset_class = CaseStudyFilter
    search_fields = ["title", "client_sector"]
    ordering_fields = ["display_order", "created_at"]
    ordering = ["display_order", "-created_at"]
    queryset = CaseStudy.objects.select_related("category")


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TeamMemberSerializer
    filter_backends: list = []
    queryset = TeamMember.objects.filter(is_active=True)


class LeadCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Write-only endpoint for public lead forms (rate limited)."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "lead_submissions"
    filter_backends: list = []


class ProjectProposalViewSet(LeadCreateViewSet):
    serializer_class = ProjectProposalRequestSerializer
    queryset = ProjectProposalRequest.objects.none()


class MarketingAuditViewSet(LeadCreateViewSet):
    serializer_class = MarketingAuditLeadSerializer
    queryset = MarketingAuditLead.objects.none()

