import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { File } from '../../class/file';

@Component({
  selector: 'app-list-directory',
  templateUrl: './list-directory.component.html',
  styleUrls: ['./list-directory.component.scss']
})
export class ListDirectoryComponent implements OnInit {

  private userFileList: File[] = [];
  private userFolderList : File[] = [];
  constructor(private fileService:FileService) {

  }

  ngOnInit() {
    this.fileService.getFile().subscribe(
      (res) =>{
        var tmpFileList = File.fromArrayJSON(res);
        tmpFileList.forEach(element => {
          if(element.type == "f")
          
        });
        console.log(this.userFileList)
      }
    )
    
  }

}
