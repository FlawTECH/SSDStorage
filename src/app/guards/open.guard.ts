import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import * as jwtDecode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class OpenGuard implements CanActivate {
  constructor(private router: Router, public snackBar: MatSnackBar) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.getItem("AuthToken")) {
      var decoded = jwtDecode(localStorage.getItem("AuthToken"));
      
      if(decoded.status == "Active"){
        return true

      }else if(decoded.status == "Waiting"){
        this.router.navigate(['/waiting'])
        return false;
      }
    }else {
      this.router.navigate(['/auth/login']);
      this.snackBar.open("Please login first", "Close", {
        duration: 2000,
      })

      return false;
    }

  }
}
