import { MatSnackBar,MatSnackBarConfig } from '@angular/material';

import { Component, OnInit, Input, ViewChild, HostBinding, ElementRef } from '@angular/core';
import { FileService } from '../../services/file.service';
import * as jwtDecode from 'jwt-decode';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User } from '../../class/user';
import { ListDirectoryComponent } from '../list-directory/list-directory.component';
import { File } from '../../class/file';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
 
  @Input()
  public uploadType:String;
  @Input()
  private currentPath:String;

  private selectedUploadType;
  private token;
  form: FormGroup;
  loading: boolean = false;
  valid: boolean = false;
  fileNameValidFade = "";
  fileNameInvalidFade = "";
  shakeAnimation: string = 'unchecked';
  gridState: string = 'collapsed';

  /* cancel:boolean = false; */
  private user:User;
  private fileList = [];
  private fileNameList: string[];
  private desiredNewFolderName:String;
  private gridSize: string = "75px";
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(private fb: FormBuilder, private fileService: FileService, public snackBar: MatSnackBar, private listDirectoryComponent: ListDirectoryComponent) {
    this.user = new User("",[]);
    this.createForm();
  }

  /*@HostBinding('@grow') get grow() {
    return { params: { gridSize: this.gridSize } };
  }*/

  ngOnInit() {
    this.fileNameValidFade = "fadeOut";
    this.fileNameInvalidFade = "fadeOut";
    this.fileNameList = [];  
    this.gridSize = "75px";
    this.desiredNewFolderName="";  
    this.token = this.listDirectoryComponent.token;
  }

  openSnackBar(message: string, action: string, type?: string) {
    this.snackBar.open(
      message,
      action,
      {
        duration: 2000
        //extraClasses: [type]
      }
    );
  }

  //START File uploading
  createForm() {
    this.form = this.fb.group({
      document: null
    });
  }

  onFolderNameChange(event){
    console.log(event);
    
  }

  onFileChange(event) {
    this.fileNameValidFade = "fadeOut";
    this.fileNameInvalidFade = "fadeOut";
    this.collapsed();
    /* this.gridState="expanded"; */
    this.fileNameList = [];
    this.form.get('document').setValue(null);

    if (event.target.files.length > 0) {
      this.form.get('document').setValue(event.target.files);
     
      for (let i = 0; i < event.target.files.length; i++) {
        let file = event.target.files[i];
        this.fileList = Array.from(event.target.files);
        this.fileNameList.push(file.name);        
        this.valid = true;

      }
      this.setGridSize()
      this.toggleValidAnimation();
      this.toggleInvalidAnimation();

    } else {
      this.setGridSize()
      this.valid = false;

    }
  }

  prepareSave(): any {
    let input = new FormData();
    if(this.selectedUploadType=="file"){
      for (let index = 0; index < this.form.get('document').value.length; index++) {     
        input.append('document', this.form.get('document').value[index]);
      }
      input.append("path",this.currentPath.toString())
    }
    else if (this.selectedUploadType == "new-folder"){
      input.append("path",this.currentPath.toString()+"/"+this.desiredNewFolderName)
    }
    else if(this.selectedUploadType=="folder-from-computer"){
      for (let index = 0; index < this.form.get('document').value.length; index++) {     
        input.append('document', this.form.get('document').value[index]);
      }
      input.append("path",this.currentPath.toString())
    }
    
    return input;
  }

  onSubmit() {
    this.loading = true;
    const formModel = this.prepareSave();   
    
    if(this.selectedUploadType == "file"){
     
      const request = this.fileService.postFile(formModel).subscribe(
        result => {
          //this.getfile(this.token.fullname);
          
          if (result.message == "Success") {
            result.files.forEach(element => {
              if(element.perm.read == true){
                this.listDirectoryComponent.userFileList.push(File.fromJSON(element.file));
                this.loading = false;         
                this.openSnackBar("All files were uploaded with success!", "Close", "success");
                this.clearValidFiles();
                this.valid = false;
              }
            });
            

          } else if(result.message == "Error") {
            this.loading = false;
            //this.shakeAnimation = 'invalid';
            this.clearValidFiles();
            this.openSnackBar("Some files weren't uploaded", "Close", "error")
          }
        },
        err => {
          console.log(err);        
          this.loading = false;
          this.shakeAnimation = 'invalid';
          this.openSnackBar("Server encountered an error", "Close", "error")
        }
      );  
    }
    else if(this.selectedUploadType == "new-folder"){
      
      
      if(this.desiredNewFolderName != ""){
        const request = this.fileService.postFolder(formModel).subscribe(
          result => {
            
            if (result.message == "Success") {
              result.files.forEach(element => {
                if(element.perm.read == true){
                  this.listDirectoryComponent.userFolderList.push(File.fromJSON(element.file));
                  this.loading = false;         
                  this.openSnackBar("Folder uploaded with success!", "Close", "success");
                  this.clearValidFiles();
                  this.valid = false;
                }
              });
              
  
            } else if(result.message == "Error") {
              this.loading = false;
              //this.shakeAnimation = 'invalid';
              this.clearValidFiles();
              this.openSnackBar("Error while oploading your folder", "Close", "error")
            }
            

          }
        )
      }else {
        
        
        this.openSnackBar("please enter a folder name", "Close", "error");
        this.loading = false;
      }
        
    }
    else if(this.selectedUploadType == "folder-from-computer"){
     
      const request = this.fileService.postFile(formModel).subscribe(
        result => {
          //this.getfile(this.token.fullname);
          
          if (result.message == "Success") {
            result.files.forEach(element => {
              console.log(this.currentPath)
              if(element.perm.read == true && element.file.type == "f" && this.currentPath == element.file.path){
                this.listDirectoryComponent.userFileList.push(File.fromJSON(element.file));
                this.loading = false;         
                this.openSnackBar("All files were uploaded with success!", "Close", "success");
                this.clearValidFiles();
                this.valid = false;
              }else if(element.perm.read == true && element.file.type == "d" && this.currentPath == element.file.path) {
                this.listDirectoryComponent.userFolderList.push(File.fromJSON(element.file));
                this.loading = false;
                this.openSnackBar("All files were uploaded with success!", "Close", "success");
                this.clearValidFiles();
                this.valid = false;
              }
            });
            

          } else if(result.message == "Error") {
            this.loading = false;
            //this.shakeAnimation = 'invalid';
            this.clearValidFiles();
            this.openSnackBar("Some files weren't uploaded", "Close", "error")
          }
        },
        err => {
          console.log(err);        
          this.loading = false;
          this.shakeAnimation = 'invalid';
          this.openSnackBar("Server encountered an error", "Close", "error")
        }
      );  
    }
      
  }

  getfile(username){
    this.fileService.getFile(username).subscribe(
      (res) =>{
        //console.log(res);
        if(res){
          this.listDirectoryComponent.userFileList = [];
          this.listDirectoryComponent.userFolderList = [];
          res.forEach(element => {
            console.log(element.file.type);
            
            if(element.file.type ==="f" && element.read == true){
              
              this.listDirectoryComponent.userFileList.push(File.fromJSON(element.file));
            }else if (element.file.type == "d" && element.read == true ){
              
              this.listDirectoryComponent.userFolderList.push(File.fromJSON(element.file));
            }
          });
          
          
          //console.log(this.userFileList[0])
        }
      }
        
    )
  }
  //File Management
  clearValidFiles() {
    this.toggleValidAnimation();  
    setTimeout(() => {    
      for (let index = 0; index < this.fileNameList.length; index++) {      
          this.fileNameList.splice(index, 1);
          this.fileList.splice(index, 1)
          this.form.get('document').setValue(this.fileList);
          index--;
        
      }      
      this.setGridSize()

    }, 499);

    if (this.fileNameList.length == 0) { console.log("none"); this.valid = false; }
  }

  clearAllFiles() {
    this.toggleValidAnimation();
    this.toggleInvalidAnimation();
    this.form.get('document').setValue(null);
    this.fileInput.nativeElement.value = '';
    this.valid = false;
    setTimeout(() => {

      this.fileNameList = [];
      this.fileList = [];
      this.setGridSize()
    }, 499);
  }

  clearCheckedFile(index: number) {
    
    this.fileNameList.splice(index, 1);   
    this.fileList.splice(index, 1)
    this.form.get('document').setValue(this.fileList);
    this.setGridSize()
    if (this.fileNameList.length == 0) { this.valid = false; } 
  }

  getFileExtension(filename): string {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  //util pour les animations (pas encore implémenté)
  setGridSize(): string {
    this.gridSize = "";
    if (this.fileNameList.length <= 1) {      
      this.gridSize = "75px";
      this.collapsed();
    } else if (this.fileNameList.length > 1) {
      this.collapsed();
      this.gridSize = Math.ceil(this.fileNameList.length / 2) + "00px";
      this.expanded();
    }
    return this.gridSize;
  }

  //ANIMATIONS pas encore implémenté
  validFadeIn() {
    this.fileNameValidFade = 'fadeIn';
  }
  validFadeOut() {
    this.fileNameValidFade = 'fadeOut';
  }

  toggleValidAnimation() {
    this.fileNameValidFade == 'fadeOut' ? this.validFadeIn() : this.validFadeOut();
  }

  invalidFadeIn() {

    this.fileNameInvalidFade = 'fadeIn';
  }
  invalidFadeOut() {

    this.fileNameInvalidFade = 'fadeOut';
  }

  toggleInvalidAnimation() {
    this.fileNameInvalidFade == 'fadeOut' ? this.invalidFadeIn() : this.invalidFadeOut();
  }

  expanded() {
    this.gridState = "expanded";
  }
  collapsed() {
    this.gridState = "collapsed"
  }
  setBackToUnchecked() {
    if (this.shakeAnimation === 'invalid') {
      this.shakeAnimation = 'unchecked';
    }
  }
}
