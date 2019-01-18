import { Component, OnInit } from "@angular/core";
import { FileService } from "../../services/file.service";

@Component({
    selector: 'app-file-share',
    templateUrl: './file-share.component.html',
    styleUrls: ['./file-share.component.scss']
})
export class FileShareComponent implements OnInit{
    link: string;

    constructor(private fileService: FileService){}

    ngOnInit(): void {

    }

    onSubmit(){
        console.log("submit")
        this.fileService.shareFile(this.link).subscribe(res => {
            console.log(res)
        })
    }
}