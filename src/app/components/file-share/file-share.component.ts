import { Component, OnInit } from "@angular/core";
import { FileService } from "../../services/file.service";
import { SocketServiceService } from "../../services/socket-service.service";
import { Group } from "../../class/group";
import { File } from "../../class/file";

@Component({
    selector: 'app-file-share',
    templateUrl: './file-share.component.html',
    styleUrls: ['./file-share.component.scss']
})
export class FileShareComponent implements OnInit{
    link: string;
    ioConnection:any;
    fileGroup: Array<any>
    filesss :Array<File>
    constructor(private fileService: FileService, private socetService: SocketServiceService){}

    ngOnInit(): void {
        console.log('ngoninit');
        
        this.fileService.getAllSharedFiles().subscribe(res => {
            this.fileGroup = res.fileGroup;
            console.log("ngOninit", this.fileGroup)
        })
        this.initIoConnection();
    }

    onSubmit(){
        this.fileService.shareFile(window.location.origin + '/api/group/' + this.link).subscribe(res => {
            
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

    approveShare(fileId: string, groupName: string,index:number) {
        this.fileService.approveShare(fileId, groupName).subscribe(res => {
            
            if(res.message =="Success"){
                this.fileGroup[index].status = true;
                this.fileGroup[index].statusGlobal = true;
                console.log(this.fileGroup[index]);
                
            }
        });
    }

    downloadFile(path:any,name:any){
        let pathh = path + name;
        
        //window.location.href='http://localhost:4040/api/file/download?path=/zeyd/download.jpg';
        this.fileService.donwloadFile(pathh).subscribe(data => saveAs(data, name)
        ); 
      }
}