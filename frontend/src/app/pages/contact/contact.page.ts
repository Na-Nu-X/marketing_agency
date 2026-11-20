import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  WritableSignal,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import {
  AUDIT_TYPE_OPTIONS,
  ApiFieldErrors,
  AuditType,
  MONTHLY_BUDGET_OPTIONS,
  MarketingService,
  MonthlyBudget,
} from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { ProposalDraftService } from '../../core/services/proposal-draft.service';
import { apiResource } from '../../core/utils/async-state';
import { IconComponent } from '../../shared/components/icon/icon.component';

type Tab = 'ponuka' | 'audit';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const PHONE_PATTERN = /^\+?[0-9 ()/-]{9,20}$/;
const WEBSITE_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const HANDLE_PATTERN = /^@[\w.]{2,60}$/;

function websiteOrHandle(control: AbstractControl<string>): ValidationErrors | null {
  const value = (control.value ?? '').trim();
  if (!value) return null;
  return WEBSITE_PATTERN.test(value) || HANDLE_PATTERN.test(value) ? null : { websiteOrHandle: true };
}

function optionalWebsite(control: AbstractControl<string>): ValidationErrors | null {
  const value = (control.value ?? '').trim();
  return !value || WEBSITE_PATTERN.test(value) ? null : { website: true };
}

function nonEmptyList(control: AbstractControl<string[]>): ValidationErrors | null {
  return control.value?.length ? null : { emptyList: true };
}

/** Slovak validation messages per error key. */
const ERROR_MESSAGES: Record<string, (error: unknown) => string> = {
  required: () => 'Toto pole je povinné.',
  requiredTrue: () => 'Pre odoslanie potrebujeme váš súhlas.',
  email: () => 'Zadajte platnú e-mailovú adresu.',
  minlength: (e) => `Zadajte aspoň ${(e as { requiredLength: number }).requiredLength} znakov.`,
  maxlength: (e) => `Maximálne ${(e as { requiredLength: number }).requiredLength} znakov.`,
  pattern: () => 'Zadajte platné telefónne číslo, napr. +421 900 123 456.',
  website: () => 'Zadajte platnú adresu webu, napr. www.vasa-firma.sk.',
  websiteOrHandle: () => 'Zadajte adresu webu (napr. www.vas-eshop.sk) alebo profil (napr. @vasaznacka).',
  emptyList: () => 'Vyberte aspoň jednu službu, o ktorú máte záujem.',
  server: (e) => String(e),
};

interface ServiceGroup {
  category: string;
  services: MarketingService[];
}

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly api = inject(ApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly drafts = inject(ProposalDraftService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly site = SITE_CONFIG;
  protected readonly budgetOptions = MONTHLY_BUDGET_OPTIONS;
  protected readonly auditOptions = AUDIT_TYPE_OPTIONS;

  // ---------- Tabs (synced with ?tab=) ----------
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly activeTab = computed<Tab>(() => (this.queryParams().get('tab') === 'audit' ? 'audit' : 'ponuka'));

  // ---------- Services for the multi-select chips ----------
  protected readonly services = apiResource(
    () => null,
    () => this.api.getServices(),
  );

  protected readonly serviceGroups = computed<ServiceGroup[]>(() => {
    const groups = new Map<string, MarketingService[]>();
    for (const service of this.services.data() ?? []) {
      const list = groups.get(service.category.name) ?? [];
      list.push(service);
      groups.set(service.category.name, list);
    }
    return [...groups].map(([category, services]) => ({ category, services }));
  });

  // ---------- Forms ----------
  protected readonly proposalForm = this.fb.group({
    selectedServices: this.fb.control<string[]>([], { validators: [nonEmptyList] }),
    monthlyAdBudget: this.fb.control<MonthlyBudget | ''>('', { validators: [Validators.required] }),
    websiteUrl: ['', [optionalWebsite]],
    companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    contactName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    projectGoals: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(3000)]],
    consent: [false, [Validators.requiredTrue]],
    companyFax: [''],
  });

  protected readonly auditForm = this.fb.group({
    auditType: this.fb.control<AuditType>('ppc_audit', { validators: [Validators.required] }),
    websiteOrProfileUrl: ['', [Validators.required, websiteOrHandle]],
    contactName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    consent: [false, [Validators.requiredTrue]],
    companyFax: [''],
  });

  /** Mirrors the chip selection as a signal (form values are not signals). */
  protected readonly selectedSlugs = signal<string[]>([]);

  protected readonly proposalState = signal<SubmitState>('idle');
  protected readonly auditState = signal<SubmitState>('idle');
  protected readonly proposalError = signal<string | null>(null);
  protected readonly auditError = signal<string | null>(null);
  protected readonly submittedName = signal('');
  protected readonly prefilledFromEstimator = signal(false);

  constructor() {
    this.applyPrefill();

    // Drop pre-selected slugs that do not match any existing service.
    effect(() => {
      const services = this.services.data();
      if (!services) return;
      const known = new Set(services.map((s) => s.slug));
      const valid = this.selectedSlugs().filter((slug) => known.has(slug));
      if (valid.length !== this.selectedSlugs().length) this.setSelectedServices(valid);
    });
  }

  // ---------- Tabs ----------
  protected selectTab(tab: Tab): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onTabKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next: Tab = this.activeTab() === 'ponuka' ? 'audit' : 'ponuka';
    this.selectTab(next);
    queueMicrotask(() => this.host.nativeElement.querySelector<HTMLElement>(`#tab-${next}`)?.focus());
  }

  // ---------- Service chips ----------
  protected isSelected(slug: string): boolean {
    return this.selectedSlugs().includes(slug);
  }

  protected toggleService(slug: string): void {
    const current = this.selectedSlugs();
    this.setSelectedServices(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
    this.proposalForm.controls.selectedServices.markAsTouched();
  }

  private setSelectedServices(slugs: string[]): void {
    this.selectedSlugs.set(slugs);
    this.proposalForm.controls.selectedServices.setValue(slugs);
  }

  // ---------- Validation helpers ----------
  protected errorFor(form: FormGroup, name: string): string | null {
    const control = form.get(name);
    if (!control || !control.errors || !(control.touched || control.dirty)) return null;
    const [key, value] = Object.entries(control.errors)[0];
    return ERROR_MESSAGES[key]?.(value) ?? 'Skontrolujte prosím túto hodnotu.';
  }

  protected invalid(form: FormGroup, name: string): boolean {
    return this.errorFor(form, name) !== null;
  }

  // ---------- Submit ----------
  protected submitProposal(): void {
    const form = this.proposalForm;
    if (form.invalid) return this.revealErrors(form);

    const value = form.getRawValue();
    const nameBySlug = new Map((this.services.data() ?? []).map((s) => [s.slug, s.name]));

    this.submit(
      this.api.submitProposal({
        selected_services: value.selectedServices.map((slug) => nameBySlug.get(slug) ?? slug),
        monthly_ad_budget: value.monthlyAdBudget as MonthlyBudget,
        website_url: value.websiteUrl.trim(),
        company_name: value.companyName.trim(),
        contact_name: value.contactName.trim(),
        email: value.email.trim(),
        phone: value.phone.trim(),
        project_goals: value.projectGoals.trim(),
        company_fax: value.companyFax,
      }),
      form,
      value.contactName,
      this.proposalState,
      this.proposalError,
      {
        selected_services: 'selectedServices',
        monthly_ad_budget: 'monthlyAdBudget',
        website_url: 'websiteUrl',
        company_name: 'companyName',
        contact_name: 'contactName',
        email: 'email',
        phone: 'phone',
        project_goals: 'projectGoals',
      },
    );
  }

  protected submitAudit(): void {
    const form = this.auditForm;
    if (form.invalid) return this.revealErrors(form);

    const value = form.getRawValue();
    this.submit(
      this.api.submitAudit({
        audit_type: value.auditType,
        website_or_profile_url: value.websiteOrProfileUrl.trim(),
        contact_name: value.contactName.trim(),
        email: value.email.trim(),
        company_fax: value.companyFax,
      }),
      form,
      value.contactName,
      this.auditState,
      this.auditError,
      {
        audit_type: 'auditType',
        website_or_profile_url: 'websiteOrProfileUrl',
        contact_name: 'contactName',
        email: 'email',
      },
    );
  }

  protected resetProposal(): void {
    this.proposalForm.reset();
    this.setSelectedServices([]);
    this.prefilledFromEstimator.set(false);
    this.proposalState.set('idle');
  }

  protected resetAudit(): void {
    this.auditForm.reset();
    this.auditState.set('idle');
  }

  private submit(
    request$: Observable<unknown>,
    form: FormGroup,
    contactName: string,
    state: WritableSignal<SubmitState>,
    error: WritableSignal<string | null>,
    fieldMap: Record<string, string>,
  ): void {
    state.set('submitting');
    error.set(null);
    request$.subscribe({
      next: () => {
        this.submittedName.set(contactName.trim().split(/\s+/)[0] ?? '');
        state.set('success');
        this.scrollToForm();
      },
      error: (response: HttpErrorResponse) => {
        state.set('error');
        if (response.status === 400 && response.error && typeof response.error === 'object') {
          const fieldErrors = response.error as ApiFieldErrors;
          let mapped = false;
          for (const [apiField, messages] of Object.entries(fieldErrors)) {
            const control = fieldMap[apiField] ? form.get(fieldMap[apiField]) : null;
            if (control && Array.isArray(messages) && messages.length) {
              control.setErrors({ server: messages[0] });
              control.markAsTouched();
              mapped = true;
            }
          }
          error.set(
            mapped
              ? 'Niektoré údaje nie sú v poriadku. Opravte prosím označené polia.'
              : (fieldErrors['non_field_errors']?.[0] ?? 'Odoslanie sa nepodarilo. Skúste to prosím znova.'),
          );
          if (mapped) this.focusFirstInvalid();
        } else if (response.status === 429) {
          error.set('Odoslali ste priveľa žiadostí. Skúste to prosím o chvíľu alebo nám zavolajte.');
        } else {
          error.set(
            `Formulár sa nepodarilo odoslať. Skúste to znova alebo nám napíšte na ${this.site.contact.newBusinessEmail}.`,
          );
        }
      },
    });
  }

  private revealErrors(form: FormGroup): void {
    form.markAllAsTouched();
    this.focusFirstInvalid();
  }

  /** Runs after the next render so error classes / success panels exist in the DOM. */
  private afterRender(fn: () => void): void {
    afterNextRender(fn, { injector: this.injector });
  }

  private focusFirstInvalid(): void {
    this.afterRender(() =>
      this.host.nativeElement
        .querySelector<HTMLElement>(
          '[role="tabpanel"]:not([hidden]) [aria-invalid="true"], [role="tabpanel"]:not([hidden]) .is-invalid',
        )
        ?.focus(),
    );
  }

  private scrollToForm(): void {
    this.afterRender(() =>
      this.host.nativeElement.querySelector('.conversion')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  /** Pre-fills the proposal form from `?service=` and from the ROI estimator draft. */
  private applyPrefill(): void {
    const fromQuery = this.route.snapshot.queryParamMap
      .getAll('service')
      .flatMap((value) => value.split(','))
      .map((slug) => slug.trim())
      .filter(Boolean);

    const draft = this.drafts.consume();
    const slugs = [...new Set([...fromQuery, ...(draft?.serviceSlugs ?? [])])];
    if (slugs.length) this.setSelectedServices(slugs);

    if (draft) {
      this.prefilledFromEstimator.set(true);
      this.proposalForm.patchValue({
        monthlyAdBudget: draft.budget ?? '',
        projectGoals: draft.goals ?? '',
      });
    }
  }
}
