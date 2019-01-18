import { Component, OnInit } from "@angular/core";
import { FileService } from "../../services/file.service";

@Component({
    selector: 'app-file-share',
    templateUrl: './file-share.component.html',
    styleUrls: ['./file-share.component.scss']
})
export class FileShareComponent implements OnInit{
    link: string;
    files: Array<Object>
    constructor(private fileService: FileService){}

    ngOnInit(): void {
        this.fileService.getAllSharedFiles().subscribe(res => {
            this.files = res.fileGroup;
            console.log(this.files)
        })
    }

    onSubmit(){
        console.log("submit")
        this.fileService.shareFile(window.location.origin + '/api/group/' + this.link).subscribe(res => {
            console.log(res)
        })
    }
}