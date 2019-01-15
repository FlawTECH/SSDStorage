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
    
    

    this.fileService.getFile("/"+this.token.fullname).subscribe(
      (res) =>{
        //console.log(res);
        if(res){
          res.forEach(element => {
            
            
            if(element.file.type ==="f" && element.read == true){
              
              this.userFileList.push(File.fromJSON(element.file));
            }else if (element.file.type == "d" && element.read == true ){
              this.userFolderList.push(File.fromJSON(element.file));
            }
          });
          
          
          //console.log(this.userFileList[0])
        }
      }
        
    )
  }

  clickOnDirectory(file:File){
    
    if(file.name!="..."){
      this.fileService.getFile(file.path+"/"+file.name).subscribe(result=>{
        if(result){
          this.userFileList = [];
          this.userFolderList = [];
          
          
          let arr = file.path.split("/").slice(0, file.path.split("/").length);
          var previous = arr.join("/");
          console.log(file.path)
          this.userFolderList.push(new File("...",previous))
          result.forEach(element => {
            
            if(element.file.type ==="f" && element.read == true){
              
              this.userFileList.push(File.fromJSON(element.file));
            }else if (element.file.type == "d" && element.read == true ){
              this.userFolderList.push(File.fromJSON(element.file));
            }
          });
          
          
          //console.log(this.userFileList[0])
        }
      });
    }else{
      this.fileService.getFile(file.path).subscribe(result=>{
        if(result){
          this.userFileList = [];
          this.userFolderList = [];
          if(file.path != "/"+this.token.fullname){
            var str = file.path;
            var arr = file.path.split("/").slice(0, file.path.split("/").length-1);
            var previous = arr.join("/");
            console.log("path: "+file.path)
            
            
            this.userFolderList.push(new File("...",previous))
          }
          result.forEach(element => {
            
            
            if(element.file.type ==="f" && element.read == true){
              
              this.userFileList.push(File.fromJSON(element.file));
            }else if (element.file.type == "d" && element.read == true ){
              this.userFolderList.push(File.fromJSON(element.file));
            }
          });
          
          
          //console.log(this.userFileList[0])
        }
      });
    }
    
    
  }

}
