import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import * as jwtDecode from "jwt-decode";
import { MatSnackBar } from '@angular/material';

@Injectable()
export class OnlyAdminUsersGuard implements CanActivate {
  constructor(private router:Router, private snackBar:MatSnackBar) {}

  canActivate(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean{
    const decodedToken = jwtDecode(localStorage.getItem('AuthToken'));

    if(decodedToken.roles.indexOf('admin') > -1){
      return true;
    }else{
      this.snackBar.open("Your current account privilege don't give you acces to this page","Close",
      {
        duration: 2000,
        panelClass: ['error']
      })
      return false
    }
    //return decodedToken.roles.indexOf('admin') > -1
  }

  
}
