import { Routes } from '@angular/router';
import { UserList } from './user-management/pages/user-list/user-list';
import { PendingCourses } from './content-review/pages/pending-courses/pending-courses';
import { SystemStatus } from './monitoring/pages/system-status/system-status';
import { ListAllUsers } from './user-management/pages/list-all-users/list-all-users';


export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UserList },
      { path: 'list-all-users', component: ListAllUsers },
      { path: 'review', component: PendingCourses },
      { path: 'status', component: SystemStatus },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];