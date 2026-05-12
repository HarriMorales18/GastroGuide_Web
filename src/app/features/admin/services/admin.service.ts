import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  identificationType: string;
  nationality: string;
  avatarUrl: string;
  phoneNumber: string;
  birthDate: string;
  adminId: string;
  department: string;
  assignedBy: string;
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CreatorRequest {
  id: number;
  creatorId: string;
  creatorEmail: string;
  creatorFirstName: string;
  creatorLastName: string;
  status: RequestStatus;
  requestedAt: string;
  reviewedAt: string | null;
  notes: string | null;
}

export interface RequestActionResponse {
  requestId: number;
  status: RequestStatus;
}

export interface AdminUserSummary {
  email: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface CourseRequest {
  id: number;
  courseId: number;
  status: RequestStatus;
  requestedAt: string;
  reviewedAt: string | null;
  notes: string | null;
  courseTitle?: string; 
  creatorName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  createAdministrator(payload: AdminRegisterPayload): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/api/admin/administrators`, payload);
  }

  getCreatorRequests(): Observable<CreatorRequest[]> {
    return this.http.get<CreatorRequest[]>(`${environment.apiBaseUrl}/api/admin/requests/creators`);
  }

  approveCreatorRequest(requestId: number): Observable<RequestActionResponse> {
    return this.http.patch<RequestActionResponse>(
      `${environment.apiBaseUrl}/api/admin/requests/creators/${requestId}/approve`,
      {}
    );
  }

  rejectCreatorRequest(requestId: number, reason: string): Observable<RequestActionResponse> {
    return this.http.patch<RequestActionResponse>(
      `${environment.apiBaseUrl}/api/admin/requests/creators/${requestId}/reject`,
      { reason }
    );
  }

  getAllUsers(options?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    direction?: 'asc' | 'desc';
  }): Observable<unknown> {
    const params = new HttpParams({
      fromObject: {
        pageNumber: options?.pageNumber ?? 0,
        pageSize: options?.pageSize ?? 1000,
        sortBy: options?.sortBy ?? 'email',
        direction: options?.direction ?? 'asc'
      }
    });

    return this.http.get(`${environment.apiBaseUrl}/api/users`, { params });
  }

    getCourseRequests(): Observable<CourseRequest[]> {
    return this.http.get<CourseRequest[]>(`${environment.apiBaseUrl}/api/admin/requests/courses`);
  }

  approveCourseRequest(requestId: number): Observable<RequestActionResponse> {
    return this.http.patch<RequestActionResponse>(
      `${environment.apiBaseUrl}/api/admin/requests/courses/${requestId}/approve`,
      {}
    );
  }

  rejectCourseRequest(requestId: number, reason: string): Observable<RequestActionResponse> {
    return this.http.patch<RequestActionResponse>(
      `${environment.apiBaseUrl}/api/admin/requests/courses/${requestId}/reject`,
      { reason }
    );
  }
}
