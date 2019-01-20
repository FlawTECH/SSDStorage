import { Component, OnInit, Input,OnChanges } from '@angular/core';
import { FileService } from '../../services/file.service';
import { File } from '../../class/file';
import * as jwtDecode from 'jwt-decode';
import { tokenKey } from '@angular/core/src/view';
import { saveAs } from 'file-saver';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogRenameFileComponent } from '../dialogs/dialog-rename-file/dialog-rename-file.component';
import { DialogDeleteFileComponent } from '../dialogs/dialog-delete-file/dialog-delete-file.component';

@Component({
  selector: 'app-list-directory',
  templateUrl: './list-directory.component.html',
  styleUrls: ['./list-directory.component.scss']
})
export class ListDirectoryComponent implements OnInit, OnChanges {
  public userFileList: File[] = [];
  public userFolderList : File[] = [];
  private dialogWidth: any;

  public token = jwtDecode(localStorage.getItem("AuthToken"));

  @Input()
  public currentPath: String = "/" + this.token.fullname;

  constructor(private fileService: FileService, public dialog: MatDialog, private snackBar: MatSnackBar) {}
  
  ngOnChanges(changes){
    console.log('Changed', changes.currentPath.currentValue, changes.currentPath.previousValue);
  }
  
  generateGroup(file: File) {
    console.log(window.location.origin)
    this.fileService.generateGroup(file.id).subscribe(res => {
      this.snackBar.open("Copy this string: " + res.name, 'Close')
    });
  }
  
  ngOnInit() {
    this.fileService.getFile("/"+this.token.fullname).subscribe(
      (res) =>{
        if (res) {
          res.forEach(element => {
            
            if (element.file.type === "f" && element.read == true) {
              this.userFileList.push(File.fromJSON(element.file));
            } else if (element.file.type == "d" && element.read == true ){
              this.userFolderList.push(File.fromJSON(element.file));
            }
          });
        }
      }
    )
  }

  clickOnDirectory(file: File){
    
    if (file.name != "..") {
      this.fileService.getFile(file.path+"/"+file.name).subscribe(result=>{
        if (result) {
          this.userFileList = [];
          this.userFolderList = [];
          
          let arr = file.path.split("/").slice(0, file.path.split("/").length);
          var previous = arr.join("/");
          this.currentPath = file.path+"/"+file.name;

          let leng = this.currentPath.length
          this.currentPath = this.currentPath.substr(1,leng -1)
          console.log(leng)

          this.userFolderList.push(new File("..",previous))
          result.forEach(element => {
            
            if (element.file.type === "f" && element.read == true) {
              
              this.userFileList.push(File.fromJSON(element.file));
            } else if (element.file.type == "d" && element.read == true ) {
              this.userFolderList.push(File.fromJSON(element.file));
            }
          });
          //console.log(this.userFileList[0])
        }
      });

    } else {
      this.currentPath = file.path;

      this.fileService.getFile(file.path).subscribe(result=>{
        if (result) {
          this.userFileList = [];
          this.userFolderList = [];

          if (file.path != "/"+this.token.fullname) {
            var str = file.path;
            var arr = file.path.split("/").slice(0, file.path.split("/").length-1);
            var previous = arr.join("/");
            
            console.log("path: "+file.path)
            this.userFolderList.push(new File("..",previous))
          }

          result.forEach(element => {
            if (element.file.type === "f" && element.read == true) {
              
              this.userFileList.push(File.fromJSON(element.file));
            } else if (element.file.type == "d" && element.read == true) {
              this.userFolderList.push(File.fromJSON(element.file));
            }
          });
          //console.log(this.userFileList[0])
        }
      });
    }
  }

  downloadFile(path: any, name: any){
    let pathh = path + name;
    //window.location.href='http://localhost:4040/api/file/download?path=/zeyd/download.jpg';
    this.fileService.donwloadFile(pathh).subscribe(data => saveAs(data, name)
    ); 
  }

  openDialog(file:File,index:number){
    this.dialogWidth = (file.name.length * 11) > 400 ? file.name.length * 11 : 400;
    const dialogRef = this.dialog.open(DialogRenameFileComponent, {
      width: this.dialogWidth + "px",
      data: {
        file: file,
        index:index,
        userFileList:this.userFileList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  deleteFile(file:File,index:number){
    const dialogRef = this.dialog.open(DialogDeleteFileComponent, {
      width: '500px',
      data:{
        file:file,
        index:index,
        userFileList : this.userFileList
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  deleteFolder(file: File,index: number){
    const dialogRef = this.dialog.open(DialogDeleteFileComponent,{
      width: '500px',
      data:{
        file:file,
        index:index,
        userFolderList : this.userFolderList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
     
    });
  }
}

