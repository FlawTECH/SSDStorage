import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { File } from '../../../class/file';
import { FileService } from '../../../services/file.service';
import { ListDirectoryComponent } from '../../list-directory/list-directory.component';

export interface DialogData {
  file: File,
  index:number,
  userFileList:File[]
}
@Component({
  selector: 'app-dialog-rename-file',
  templateUrl: './dialog-rename-file.component.html',
  styleUrls: ['./dialog-rename-file.component.scss']
})
export class DialogRenameFileComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,public fileService: FileService,public dialogRef: MatDialogRef<DialogRenameFileComponent>) {}

  ngOnInit() {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(newFileName:String):void {
    console.log(newFileName);
    
    this.fileService.renameFile(newFileName,this.data.file.id).subscribe(result => {
      if(result.message == "Success"){
        console.log("success");
        this.data.userFileList[this.data.index].name = newFileName.toString();
        //this.data.userFileList.splice(this.data.index,1,this.data.file);
        console.log(this.data.userFileList);
        
        this.dialogRef.close(this.data.file);
      }else{
        console.log("error");
        this.dialogRef.close();
      }
    })
  }
}
