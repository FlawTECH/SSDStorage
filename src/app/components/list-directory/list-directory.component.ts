import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { File } from '../../class/file';
import * as jwtDecode from 'jwt-decode';
import { tokenKey } from '@angular/core/src/view';


@Component({
  selector: 'app-list-directory',
  templateUrl: './list-directory.component.html',
  styleUrls: ['./list-directory.component.scss']
})
export class ListDirectoryComponent implements OnInit {
  private userFileList: File[] = [];
  private userFolderList : File[] = [];
  private currentPath:String;
  private token:any;

  constructor(private fileService:FileService) {
    this.token = jwtDecode(localStorage.getItem("AuthToken"));
    
  }
  

  ngOnInit() {
    
    

    this.fileService.getFile(this.token.fullname).subscribe(
      (res) =>{
        //console.log(res);
        res.forEach(element => {
          console.log(element.file.type);
          
          if(element.file.type ==="f"){
            this.userFileList.push(File.fromJSON(element.file));
          }else{
            this.userFolderList.push(File.fromJSON(element.file));
          }
        });
        console.log(res)
        this.currentPath = this.userFileList[0].path+"/";
      }
    )
  }

  

}
