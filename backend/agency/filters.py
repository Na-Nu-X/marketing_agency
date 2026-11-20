import django_filters

from .models import CaseStudy, MarketingService


class MarketingServiceFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = MarketingService
        fields = ["category", "featured"]


class CaseStudyFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = CaseStudy
        fields = ["category", "featured"]
