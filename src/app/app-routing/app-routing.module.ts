import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { HomeComponent } from '../home/home.component';
import { ManagerComponent } from '../components/manager/manager.component';
import { ListDirectoryComponent } from '../components/list-directory/list-directory.component';
import { IsLoggedInGuard } from '../guards/is-logged-in.guard';
import { OpenGuard } from '../guards/open.guard';

const routes: Routes = [{
  path:'',
  redirectTo:'auth',
  pathMatch:'full',
}, {
  path: 'auth',
  loadChildren: 'app/auth/auth.module#AuthModule',
  
}, {
  path: 'admin',
  loadChildren: 'app/admin/admin.module#AdminModule'
},
{
  path:'manager',
  component: ManagerComponent,
  canActivate:[OpenGuard],
  children:[{
    path:'',
    redirectTo:"directories",
    pathMatch:'full'
  }, 
  {
    path:'directories',
    component:ListDirectoryComponent,

  }
]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
  declarations: []
})

export class AppRoutingModule {}
