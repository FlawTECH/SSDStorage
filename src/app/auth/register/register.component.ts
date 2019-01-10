import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';


import {AuthService} from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../auth.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  passwordsMatchValidator(control: FormControl): ValidationErrors {
    let password = control.root.get('password');
    return password && control.value !== password.value ? {
      passwordMatch: true
    }: null;
  }

  userForm = new FormGroup({
    fullname: new FormControl('', [Validators.required]),
    
    password: new FormControl('', [Validators.required]),
    repeatPassword: new FormControl('', [Validators.required, this.passwordsMatchValidator])
  })

  get fullname(): any { return this.userForm.get('fullname'); }
  
  get password(): any { return this.userForm.get('password'); }
  get repeatPassword(): any { return this.userForm.get('repeatPassword'); }

  register() {

    if(!this.userForm.valid) return;

    let {
      fullname,
      password,
      repeatPassword
    } = this.userForm.getRawValue();

    this.authService.register(fullname, password, repeatPassword)
    .subscribe(data => {
      this.router.navigate(['manager']);
    })
  }

}
