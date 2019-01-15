import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as jwtDecode from "jwt-decode";
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class WaitingGuard implements CanActivate {
  constructor(private router: Router, public snackBar: MatSnackBar) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.getItem("AuthToken")) {
      var decoded = jwtDecode(localStorage.getItem("AuthToken"));
      if(decoded.status == "Waiting"){
        return true;
      }else{
        this.snackBar.open("You don't have permission to access this page!", "Close", {
          duration: 4000,
        })
        return false;
      }

    }
  }
}
