import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FileService } from '../../../services/file.service';
import { File } from '../../../class/file';

export interface DialogData {
  file: File,
  index:number,
  userFolderList:File[],
  userFileList:File[]
}

@Component({
  selector: 'app-dialog-delete-file',
  templateUrl: './dialog-delete-file.component.html',
  styleUrls: ['./dialog-delete-file.component.scss']
})

export class DialogDeleteFileComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,public fileService: FileService,public dialogRef: MatDialogRef<DialogDeleteFileComponent>) {}

  ngOnInit() {
  }
  onCancelClick(): void {
    this.dialogRef.close();
  }

  onYesClick():void {
    
    
    this.fileService.deleteFile(this.data.file.id).subscribe(result => {
      console.log(result);
      
      if(result.message == "Success"){
        console.log("success");
        if(this.data.file.type =="d"){
          this.data.userFolderList.splice(this.data.index,1);

          console.log(this.data.userFolderList);
        }else{
          this.data.userFileList.splice(this.data.index,1);

          console.log(this.data.userFileList);
        }
        
        
        this.dialogRef.close(this.data.file);
      }else{
        console.log("error");
        this.dialogRef.close();
      }
    })
  }

}
