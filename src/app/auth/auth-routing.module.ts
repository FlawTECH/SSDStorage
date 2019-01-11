import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import { IsLoggedInGuard } from '../guards/is-logged-in.guard';

const routes: Routes = [{
  path: 'auth',
  canActivate:[IsLoggedInGuard],
  children: [{
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }, {
    path: 'login',
    component: LoginComponent,
    canActivate:[IsLoggedInGuard],
  }, {
    path: 'register',
    component: RegisterComponent,
    canActivate:[IsLoggedInGuard],
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AuthRoutingModule { }
