import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthService } from './auth.service';
import { TokenStorage } from './token.storage';
import { AuthRoutingModule } from './auth-routing.module';
import { TwoFactorAuthenticationComponent } from './2fa/2fa.component';
import { MatInputModule } from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AuthRoutingModule,
    MatInputModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    TwoFactorAuthenticationComponent,
  ],
  providers: [
    AuthService,
    TokenStorage
  ]
})
export class AuthModule { }
