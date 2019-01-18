import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { TokenStorage } from './token.storage';
import { TooltipComponent } from '@angular/material';


@Injectable()
export class AuthService {

  constructor(private http : HttpClient, private token: TokenStorage) {}

  public $userSource = new Subject<any>();

  login(fullname : string, password : string, otp: string) : Observable <any> {
    console.log("autservice1");
    
    return Observable.create(observer => {
      this.http.post('/api/auth/login', {
        fullname,
        password,
        otp
      }).subscribe((data : any, ) => {
          console.log("auth.service: "+data.headers);
          
          observer.next({user: data.user});
          this.setUser(data.user);
          this.token.saveToken(data.token);
          observer.complete();
      }, (err:any) => {
        observer.next({error:err});
        observer.complete();
        
      })
    });
  }

  register(fullname : string,  password : string, repeatPassword : string, status: string = "Waiting") : Observable <any> {
    const tmpId = (<any>window).tmpId;
    const otp = (<any>window).otp;
    const roles = []
    return Observable.create(observer => {
      this.http.post('/api/auth/register', {
        fullname,
        status,
        password,
        roles,
        tmpId,
        repeatPassword,
        otp
      }).subscribe((data : any) => {
        observer.next({user: data.user});
        this.setUser(data.user);
        this.token.saveToken(data.token);
        observer.complete();
      })
    });
  }

  setUser(user): void {
    if (user){
      user.isAdmin = (user.roles.indexOf('admin') > -1);
    }
    
    this.$userSource.next(user);
    (<any>window).user = user;
  }

  getUser(): Observable<any> {
    return this.$userSource.asObservable();
  }

  me(): Observable<any> {
    return Observable.create(observer => {
      const tokenVal = this.token.getToken();
      if (!tokenVal) return  observer.complete();
      this.http.get('/api/auth/me').subscribe((data : any) => {
        observer.next({user: data.user});
        this.setUser(data.user);
        observer.complete();
      })
    });
  }

  getQrCode(): Observable<any> {
    return Observable.create(observer => {
      this.http.get('/api/auth/qrcode').subscribe((data: any) => {
        observer.next({tmpId: data.id, qrcode: data.qrcode_uri});
        (<any>window).tmpId = data.id;
        observer.complete()
      })
    })
  }

  checkToken(token: string, id: string): Observable<any> {
    (<any>window).otp = token;
    return Observable.create(observer => {
      this.http.post('/api/auth/token', {token, id}).subscribe((data: any) => {
        observer.next(data);
        observer.complete();
      })
    })
  }

  signOut(): void {
    this.token.signOut();
    this.setUser(null);
    delete (<any>window).user;
  }
}
