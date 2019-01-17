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
    pseudo: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(10),
       Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$")]), // au moins une lettre majuscule, une minuscule, un chiffre et un caractère spécial
    repeatPassword: new FormControl('', [Validators.required, this.passwordsMatchValidator])
  })

  get pseudo(): any { return this.userForm.get('pseudo'); }
  get password(): any { return this.userForm.get('password'); }
  get repeatPassword(): any { return this.userForm.get('repeatPassword'); }

  register() {
    if(!this.userForm.valid) return;

    let {
      pseudo,
      password,
      repeatPassword
    } = this.userForm.getRawValue();

    this.authService.register(pseudo, password, repeatPassword)
    .subscribe(data => {
      this.router.navigate(['manager']);
    })
  }

}
