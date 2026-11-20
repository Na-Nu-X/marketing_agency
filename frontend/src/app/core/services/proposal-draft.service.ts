import { Injectable, signal } from '@angular/core';

import { MonthlyBudget } from '../models/api.models';

export interface ProposalDraft {
  serviceSlugs: string[];
  budget?: MonthlyBudget;
  goals?: string;
}

/**
 * Hands over pre-filled data (e.g. from the ROI estimator) to the
 * proposal wizard on the contact page.
 */
@Injectable({ providedIn: 'root' })
export class ProposalDraftService {
  private readonly draft = signal<ProposalDraft | null>(null);

  set(draft: ProposalDraft): void {
    this.draft.set(draft);
  }

  /** Returns the pending draft once and clears it. */
  consume(): ProposalDraft | null {
    const value = this.draft();
    this.draft.set(null);
    return value;
  }
}

export function budgetToBracket(monthlyBudget: number): MonthlyBudget {
  if (monthlyBudget < 1500) return 'do_1500';
  if (monthlyBudget < 5000) return '1500_5000';
  if (monthlyBudget <= 15000) return '5000_15000';
  return 'nad_15000';
}
