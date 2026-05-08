import { Routes } from '@angular/router';
import { CourseManager } from './content-creation/course-manager/course-manager';
import { RevenueDashboard } from './monetization/revenue-dashboard/revenue-dashboard';
import { MetricsDashboard } from './analytics/metrics-dashboard/metrics-dashboard';
import { AllCourses } from './all-courses/all-courses';

export const CREATOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'courses', component: CourseManager },
      { path: 'all-courses', component: AllCourses },
      { path: 'revenue', component: RevenueDashboard },
      { path: 'analytics', component: MetricsDashboard },
      { path: '', redirectTo: 'courses', pathMatch: 'full' }
    ]
  }
];