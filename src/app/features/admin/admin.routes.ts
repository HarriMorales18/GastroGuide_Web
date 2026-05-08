import { Routes } from '@angular/router';
import { UserList } from './user-management/user-list/user-list';
import { ListAllUsers } from './list-all-users/list-all-users';
import { PendingCourses } from './content-review/pending-courses/pending-courses';
import { SystemStatus } from './monitoring/system-status/system-status';
import { RegisterAdmin } from './register-admin/register-admin';


export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UserList },
      { path: 'list-all-users', component: ListAllUsers },
      { path: 'review', component: PendingCourses },
      { path: 'status', component: SystemStatus },
      { path: 'register-admin', component: RegisterAdmin },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];