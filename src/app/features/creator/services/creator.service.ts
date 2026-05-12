import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CourseCreatePayload,
  CourseCreateResponse,
  CourseSummary,
  LessonCreatePayload,
  ModuleCreatePayload,
  ModuleUpdatePayload,
  ModuleSummary
} from '../../../shared/interfaces/course';

@Injectable({
  providedIn: 'root'
})
export class CreatorService {
  private http = inject(HttpClient);
  private rawHttp = new HttpClient(inject(HttpBackend));

  createCourse(payload: CourseCreatePayload): Observable<CourseCreateResponse> {
    return this.http.post<CourseCreateResponse>(
      `${environment.apiBaseUrl}/api/courses/create`,
      payload
    );
  }

  getCourseSummaries(): Observable<CourseSummary[]> {
    return this.http.get<CourseSummary[]>(`${environment.apiBaseUrl}/api/courses/creator`);
  }

  updateCourse(courseId: number | string, payload: FormData): Observable<string> {
    return this.http.patch(`${environment.apiBaseUrl}/api/courses/${courseId}`, payload, {
      responseType: 'text'
    });
  }

  createModule(payload: ModuleCreatePayload): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/api/modules/create`, payload, {
      responseType: 'text'
    });
  }

  updateModule(payload: ModuleUpdatePayload): Observable<string> {
    return this.http.patch(`${environment.apiBaseUrl}/api/modules/update`, payload, {
      responseType: 'text'
    });
  }

  createLesson(payload: LessonCreatePayload): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/api/lessons`, payload, {
      responseType: 'text'
    });
  }

  getModulesByCourse(courseId: number | string): Observable<ModuleSummary[]> {
    return this.http.get<ModuleSummary[]>(
      `${environment.apiBaseUrl}/api/modules/course/${courseId}`
    );
  }

  getVideoPresignedUrl(fileName: string, contentType: string): Observable<unknown> {
    const params = new HttpParams({
      fromObject: {
        fileName,
        contentType
      }
    });

    return this.http.get(`${environment.apiBaseUrl}/api/media/upload/video/presigned-url`, {
      params
    });
  }

  uploadVideoToPresignedUrl(uploadUrl: string, file: File): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': file.type || 'application/octet-stream'
    });

    return this.rawHttp.put(uploadUrl, file, {
      headers,
      responseType: 'text'
    });
  }

  // Obtener detalles completos
  getCourseDetails(id: number | string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/api/courses/${id}/details`);
  }

  // Solicitar publicación
  requestVerification(id: number | string): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/api/courses/${id}/verification-requests`, {});
  }

  updateCourseState(id: number | string, state: 'DRAFT' | 'PUBLISHED'): Observable<{ courseId: number | string; state: string }> {
    return this.http.patch<{ courseId: number | string; state: string }>(
      `${environment.apiBaseUrl}/api/courses/${id}/state`,
      { state }
    );
  }
}
