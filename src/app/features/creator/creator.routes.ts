import { Routes } from '@angular/router';
import { CourseManager } from './content-creation/pages/course-manager/course-manager';
import { RevenueDashboard } from './monetization/pages/revenue-dashboard/revenue-dashboard';
import { MetricsDashboard } from './analytics/pages/metrics-dashboard/metrics-dashboard';
import { AllCourses } from './courses/pages/all-courses/all-courses';
import { CourseListComponent } from './courses/pages/course-list/course-list';
import { CourseDetailComponent } from './courses/pages/course-detail/course-detail';
import { ProfileSettings } from './profile/pages/profile-settings/profile-settings';
import { BankAccount } from './profile/pages/bank-account/bank-account';

export const CREATOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'courses', component: CourseManager },
      { path: 'all-courses', component: AllCourses },
      { path: 'revenue', component: RevenueDashboard },
      { path: 'analytics', component: MetricsDashboard },
      { path: 'course-list',component: CourseListComponent},
      {path: 'courses/:id', component: CourseDetailComponent},
      { path: 'profile', component: ProfileSettings },
      { path: 'bank-account', component: BankAccount },
      { path: '', redirectTo: 'all-courses', pathMatch: 'full' }
    ]
  }
];