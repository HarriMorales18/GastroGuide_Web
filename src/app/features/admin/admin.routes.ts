import { Routes } from '@angular/router';
import { UserList } from './user-management/pages/user-list/user-list';
import { SystemStatus } from './monitoring/pages/system-status/system-status';
import { ListAllUsers } from './user-management/pages/list-all-users/list-all-users';
import { PendingCourse } from './content-review/pages/pending-courses/pending-courses';


export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UserList },
      { path: 'list-all-users', component: ListAllUsers },
      { path: 'status', component: SystemStatus },
      { path: 'courses_requests', component: PendingCourse},
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];