import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as jwtDecode from 'jwt-decode';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private linkApi = '/api/file';
  private token;

  constructor(private http: HttpClient) {
    this.token = jwtDecode(localStorage.getItem("AuthToken"));
  }

  //GET All files
  getFile(path:string): Observable<any> {
    
    return this.http.get(this.linkApi,{
      params: new HttpParams().set('path',path)
    })
  }

  generateGroup(fileId: string): Observable<any> {
    console.log('debug', fileId)
    return this.http.post('/api/group/generate', {fileId});
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

  //Download a file
  donwloadFile(path:String): Observable<any> {
    return  this.http.get(this.linkApi+"/download",
    {
      params: new HttpParams().set('path', path.toString()),
      responseType: 'blob'
    },
    )
  }

  renameFile(newFileName:String, fileId:String): Observable<any>{
    return this.http.put(this.linkApi+"/rename",{
      "name": newFileName,
      "fileId": fileId
    });
  }

  deleteFile(fileId:String):Observable<any> {
    return this.http.put(this.linkApi+"/delete",{
      "fileId": fileId
    });
  }

  shareFile(link: string): Observable<any> {
    return this.http.get(link);
  }

  getAllSharedFiles(): Observable<any> {
    return this.http.get('api/group/displayFileGroup');
  }

  approveShare(fileId: string, groupName: string): Observable<any> {
    return this.http.post('api/group/checkStatusDownloadFile', {
      fileId,
      groupName
    });
  }
}

  


