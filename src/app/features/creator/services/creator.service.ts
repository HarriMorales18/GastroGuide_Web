import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CourseCreatePayload,
  CourseCreateResponse,
  CourseSummary,
  CourseUpdatePayload,
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

  createCourse(payload: CourseCreatePayload): Observable<CourseCreateResponse> {
    return this.http.post<CourseCreateResponse>(
      `${environment.apiBaseUrl}/api/courses/create`,
      payload
    );
  }

  getCourseSummaries(): Observable<CourseSummary[]> {
    return this.http.get<CourseSummary[]>(`${environment.apiBaseUrl}/api/courses/summary`);
  }

  updateCourse(courseId: number | string, payload: CourseUpdatePayload): Observable<string> {
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
      `${environment.apiBaseUrl}/api/courses/${courseId}/modules`
    );
  }
}
