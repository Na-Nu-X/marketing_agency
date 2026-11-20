from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import MarketingAuditLead, MarketingService, ProjectProposalRequest


class ApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", verbosity=0)

    def setUp(self):
        self.client = APIClient()

    def test_seed_is_idempotent(self):
        call_command("seed_data", verbosity=0)
        self.assertEqual(MarketingService.objects.count(), 10)

    def test_categories_include_service_counts(self):
        data = self.client.get("/api/categories/").json()
        self.assertEqual(len(data), 6)
        self.assertEqual(sum(c["service_count"] for c in data), 10)

    def test_service_filters(self):
        self.assertEqual(len(self.client.get("/api/services/?featured=true").json()), 6)
        seo = self.client.get("/api/services/?category=seo-organicky-rast").json()
        self.assertTrue(all(s["category"]["slug"] == "seo-organicky-rast" for s in seo))
        self.assertGreater(len(self.client.get("/api/services/?search=Klaviyo").json()), 0)

    def test_service_detail(self):
        response = self.client.get("/api/services/komplexne-seo-a-obsahovy-marketing/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("deliverables", response.json())

    def test_proposal_validation_and_create(self):
        bad = self.client.post("/api/proposals/", {"selected_services": []}, format="json")
        self.assertEqual(bad.status_code, 400)
        payload = {
            "selected_services": ["Komplexné SEO a obsahový marketing"],
            "monthly_ad_budget": "5000_15000",
            "company_name": "Test s.r.o.",
            "contact_name": "Ján Test",
            "email": "jan@test.sk",
            "phone": "+421 900 123 456",
            "project_goals": "Chceme rásť v organickom vyhľadávaní.",
        }
        ok = self.client.post("/api/proposals/", payload, format="json")
        self.assertEqual(ok.status_code, 201, ok.content)
        self.assertEqual(ProjectProposalRequest.objects.count(), 1)

    def test_honeypot_rejects_bots(self):
        payload = {
            "audit_type": "ppc_audit",
            "website_or_profile_url": "www.eshop.sk",
            "contact_name": "Bot Botovič",
            "email": "bot@spam.sk",
            "company_fax": "123",
        }
        self.assertEqual(self.client.post("/api/audits/", payload, format="json").status_code, 400)
        payload["company_fax"] = ""
        self.assertEqual(self.client.post("/api/audits/", payload, format="json").status_code, 201)
        self.assertEqual(MarketingAuditLead.objects.count(), 1)

    def test_leads_are_not_listable(self):
        self.assertEqual(self.client.get("/api/proposals/").status_code, 405)
        self.assertEqual(self.client.get("/api/audits/").status_code, 405)


class AdminSmokeTests(TestCase):
    """Every agency admin changelist, add form and change form renders."""

    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", verbosity=0)
        from django.contrib.auth import get_user_model

        cls.admin = get_user_model().objects.create_superuser("riaditel", "r@example.com", "test-pass-123")

    def test_admin_pages_render(self):
        from django.contrib import admin

        self.client.force_login(self.admin)
        for model in admin.site._registry:
            if model._meta.app_label != "agency":
                continue
            base = f"/admin/agency/{model._meta.model_name}/"
            for url in (base, f"{base}add/"):
                self.assertEqual(self.client.get(url).status_code, 200, url)
            obj = model.objects.first()
            if obj:
                self.assertEqual(self.client.get(f"{base}{obj.pk}/change/").status_code, 200)
