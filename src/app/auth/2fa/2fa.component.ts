import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-2fa',
    templateUrl: './2fa.component.html',
    styleUrls: ['../auth.component.scss']
  })
export class TwoFactorAuthenticationComponent implements OnInit{
  qrcode;
  token;
  
  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit(): void {
    this.authService.getQrCode().subscribe(data => {
      this.qrcode = data.qrcode;
    })
  }
  
  onSubmit() {
    this.authService.checkToken(this.token, (<any>window).tmpId).subscribe(res => {
      this.router.navigate(["auth/register"]);
    })
  }
}