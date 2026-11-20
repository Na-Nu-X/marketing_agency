import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CaseStudy,
  MarketingAuditPayload,
  MarketingService,
  MarketingServiceDetail,
  ProjectProposalPayload,
  ServiceCategory,
  TeamMember,
} from '../models/api.models';

export interface ServiceQuery {
  category?: string | null;
  featured?: boolean;
  search?: string;
  ordering?: string;
}

export interface CaseStudyQuery {
  category?: string | null;
  featured?: boolean;
}

function toParams(query: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.baseUrl}/categories/`);
  }

  getServices(query: ServiceQuery = {}): Observable<MarketingService[]> {
    return this.http.get<MarketingService[]>(`${this.baseUrl}/services/`, { params: toParams(query) });
  }

  getService(slug: string): Observable<MarketingServiceDetail> {
    return this.http.get<MarketingServiceDetail>(`${this.baseUrl}/services/${encodeURIComponent(slug)}/`);
  }

  getCaseStudies(query: CaseStudyQuery = {}): Observable<CaseStudy[]> {
    return this.http.get<CaseStudy[]>(`${this.baseUrl}/case-studies/`, { params: toParams(query) });
  }

  getTeam(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/team/`);
  }

  submitProposal(payload: ProjectProposalPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/proposals/`, payload);
  }

  submitAudit(payload: MarketingAuditPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/audits/`, payload);
  }
}
