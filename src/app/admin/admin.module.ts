import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import {AdminComponent} from './admin.component';
import {OnlyAdminUsersGuard} from './admin-user-guard';
import { AdminService } from './admin.service';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms'
import { MatSnackBarModule } from '@angular/material';

@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatListModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    MatSnackBarModule
  ],
  providers: [
    OnlyAdminUsersGuard,
    AdminService
  ]})
export class AdminModule {}
