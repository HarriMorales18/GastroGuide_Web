import { Routes } from '@angular/router';
import { UserList } from './user-management/user-list/user-list';
import { PendingCourses } from './content-review/pending-courses/pending-courses';
import { SystemStatus } from './monitoring/system-status/system-status';


export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UserList },
      { path: 'review', component: PendingCourses },
      { path: 'status', component: SystemStatus },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];