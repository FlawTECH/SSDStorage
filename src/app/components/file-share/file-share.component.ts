import { Component, OnInit } from "@angular/core";
import { FileService } from "../../services/file.service";
import { SocketServiceService } from "../../services/socket-service.service";

@Component({
    selector: 'app-file-share',
    templateUrl: './file-share.component.html',
    styleUrls: ['./file-share.component.scss']
})
export class FileShareComponent implements OnInit{
    link: string;
    ioConnection:any;
    files: Array<Object>
    constructor(private fileService: FileService, private socetService: SocketServiceService){}

    ngOnInit(): void {
        this.initIoConnection();
        this.fileService.getAllSharedFiles().subscribe(res => {
            this.files = res.fileGroup;
            console.log("ngOninit", this.files)
        })
    }

    onSubmit(){
        this.fileService.shareFile(window.location.origin + '/api/group/' + this.link).subscribe(res => {
            console.log(res)
        })
    }

    private initIoConnection(): void {
        this.ioConnection = this.socetService.onMessage()
      .subscribe((message: any) => {
          if(message)  {
              this.fileService.checkDownloadGroupFile(message.fileId,message.name).subscribe(res => {
                  console.log(res)
              })
          }
      });
    }

    approveShare(fileId: string, groupName: string) {
        this.fileService.approveShare(fileId, groupName).subscribe(res => {
            console.log(res)
        });
    }
}