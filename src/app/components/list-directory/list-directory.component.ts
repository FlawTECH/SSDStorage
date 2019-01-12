import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { File } from '../../class/file';
import * as jwtDecode from 'jwt-decode';


@Component({
  selector: 'app-list-directory',
  templateUrl: './list-directory.component.html',
  styleUrls: ['./list-directory.component.scss']
})
export class ListDirectoryComponent implements OnInit {

  private userFileList: File[] = [];
  private userFolderList : File[] = [];
  
  private token:any;
  constructor(private fileService:FileService) {
    this.token = jwtDecode(localStorage.getItem("AuthToken"));
  }

  ngOnInit() {
    
    this.fileService.getFile(this.token.fullname).subscribe(
      (res) =>{
        //console.log(res);
        res.forEach(element => {
          this.userFileList.push(File.fromJSON(element.file))
        });
        console.log(this.userFileList)
      }
    )
  }

  

}
