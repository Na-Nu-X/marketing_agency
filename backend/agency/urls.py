from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categories", views.ServiceCategoryViewSet, basename="category")
router.register("services", views.MarketingServiceViewSet, basename="service")
router.register("case-studies", views.CaseStudyViewSet, basename="case-study")
router.register("team", views.TeamMemberViewSet, basename="team")
router.register("proposals", views.ProjectProposalViewSet, basename="proposal")
router.register("audits", views.MarketingAuditViewSet, basename="audit")

urlpatterns = router.urls
