import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { HomeComponent } from '../home/home.component';
import { ManagerComponent } from '../components/manager/manager.component';
import { ListDirectoryComponent } from '../components/list-directory/list-directory.component';
import { IsLoggedInGuard } from '../guards/is-logged-in.guard';
import { OpenGuard } from '../guards/open.guard';
import { FileUploadComponent } from '../components/file-upload/file-upload.component';

const routes: Routes = [{
  path:'',
  redirectTo:'auth',
  pathMatch:'full',
}, {
  path: 'auth',
  loadChildren: 'app/auth/auth.module#AuthModule',
}, {
  path:'manager',
  component: ManagerComponent,
  canActivate:[OpenGuard],
  children:[{
    path:'',
    redirectTo:"directories",
    pathMatch:'full'
  }, {
    path:'directories',
    component:ListDirectoryComponent,
  },
  {
    path:'upload',
    component: FileUploadComponent
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
