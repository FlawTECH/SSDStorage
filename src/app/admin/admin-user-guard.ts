import { Injectable } from '@angular/core';
import { CanActivate } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import * as jwtDecode from "jwt-decode";

@Injectable()
export class OnlyAdminUsersGuard implements CanActivate {
  constructor() {}

  canActivate() {
    const decodedToken = jwtDecode(localStorage.getItem('AuthToken'));
    return decodedToken.roles.indexOf('admin') > -1
  }
}
