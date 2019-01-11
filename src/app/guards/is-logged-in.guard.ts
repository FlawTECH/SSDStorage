import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import * as jwtDecode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class IsLoggedInGuard implements CanActivate {
  constructor(private router:Router, private snackBar:MatSnackBar){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if(localStorage.getItem("AuthToken")){

        var decoded = jwtDecode(localStorage.getItem("AuthToken"));
        console.log(decoded)
        var role = ""
        this.snackBar.open("You are already logged in as : "+decoded.fullname,"Close",{
          duration: 2000,
          
        },)

        //TODO redirection à partir du ROLE
        
        this.router.navigate(['/manager/directories'])
         return false;
        
        

        

      }else{


        return true;

      }  
  }
}
