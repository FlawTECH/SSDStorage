import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AuthService} from '../auth.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router,private snackBar:MatSnackBar) { }

  pseudo: string;
  password: string;
  token: string;
  loading: boolean = false;

  ngOnInit() {
  }

  login(): void {
    if(this.pseudo && this.password && this.token){
      this.loading = true;
      this.authService.login(this.pseudo, this.password, this.token)
        .subscribe( (data) => {
          this.loading = false;         
          if(data.error){
            this.snackBar.open("Wrong credentials pleasy try again","Close",{
              duration: 3000,
            },)
          }else {
            this.router.navigate(['manager']);
          }        
          
          
        })
    }
    
  }

}
