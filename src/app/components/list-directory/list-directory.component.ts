import { Component, OnInit, Input,OnChanges } from '@angular/core';
import { FileService } from '../../services/file.service';
import { File } from '../../class/file';
import * as jwtDecode from 'jwt-decode';
import { tokenKey } from '@angular/core/src/view';


@Component({
  selector: 'app-list-directory',
  templateUrl: './list-directory.component.html',
  styleUrls: ['./list-directory.component.scss']
})
export class ListDirectoryComponent implements OnInit,OnChanges {
  public userFileList: File[] = [];
  public userFolderList : File[] = [];
  
  public token = jwtDecode(localStorage.getItem("AuthToken"));

  @Input()
  public currentPath:String = this.token.fullname;

  constructor(private fileService:FileService) {}
  
  ngOnChanges(changes){
    console.log('Changed', changes.currentPath.currentValue, changes.currentPath.previousValue);
  }
  
  ngOnInit() {
    
    

    this.fileService.getFile(this.token.fullname).subscribe(
      (res) =>{
        //console.log(res);
        if(res){
          res.forEach(element => {
            console.log(element.file.type);
            
            if(element.file.type ==="f"){
              this.userFileList.push(File.fromJSON(element.file));
            }else{
              this.userFolderList.push(File.fromJSON(element.file));
            }
          });
          
          
          //console.log(this.userFileList[0])
        }
      }
        
    )
  }

  

}
