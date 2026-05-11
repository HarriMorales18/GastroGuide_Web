import { Routes } from '@angular/router';
import { CourseManager } from './content-creation/pages/course-manager/course-manager';
import { RevenueDashboard } from './monetization/pages/revenue-dashboard/revenue-dashboard';
import { MetricsDashboard } from './analytics/pages/metrics-dashboard/metrics-dashboard';
import { AllCourses } from './courses/pages/all-courses/all-courses';

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