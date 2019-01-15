import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as jwtDecode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private linkApi = 'http://localhost:4040/api/file';
  private token;

  constructor(private http: HttpClient) {
    this.token = jwtDecode(localStorage.getItem("AuthToken"));
  }

  //GET All files
  getFile(path:string): Observable<any> {
    
 
    return this.http.get(this.linkApi,{
      params: new HttpParams().set('path', path + '')
    })
  }

   //POST a file
   postFile(formData: FormData): Observable<any> {
    return this.http.post(this.linkApi, formData, {
      //params: new HttpParams().set('path', path.toString())
    });
  }

  //POST a folder
  postFolder(formData: FormData): Observable<any> {
    return this.http.post(this.linkApi, formData, {
      //params: new HttpParams().set('path', path.toString())
    });
  }

}
