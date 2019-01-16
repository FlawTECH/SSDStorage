import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class AdminService {
    private url = '/api/'

    constructor (private http: HttpClient) {}

    getAllNonActiveUsers(): Observable<any> {
        return this.http.get(this.url + 'user')
    }

    setStatus(users: any) {
        return this.http.put(this.url + 'user', users)
    }
}