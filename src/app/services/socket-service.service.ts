import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/Observable';


@Injectable({
  providedIn: 'root'
})
export class SocketServiceService {

  constructor(private socket: Socket) { }

  sendMessage(msg: string){
    this.socket.emit("message", msg);
  }
  public onMessage(): Observable<any> {
    return new Observable<any>(observer => {
        this.socket.on('message', (data: any) => observer.next(data));
    });
}
}
