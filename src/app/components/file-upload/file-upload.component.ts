import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import * as jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  public pickedFile: any;
  public path: string;

  private _fileService: FileService;

  constructor(private fileService: FileService) {
    this._fileService = fileService;
  }

  ngOnInit() {
    this.path = jwtDecode(localStorage.getItem('AuthToken')).fullname;
  }

  uploadFiles() {
    console.log(this.pickedFile);
    this._fileService.uploadFile(this.path, this.pickedFile).subscribe((res) => {
      console.log(res);
    })
  }

}
