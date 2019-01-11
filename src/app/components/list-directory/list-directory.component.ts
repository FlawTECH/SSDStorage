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
  private username 
  private tmpList : any[]=[
    {id:"1", name:"folder1"},{id:"2", name:"folder2"}
  ];

  constructor(private fileService:FileService) {

  }

  ngOnInit() {
    console.log(this.tmpList)
    this.fileService.getFile("zeyd").subscribe(
      (res) =>{
        //console.log(res);
        res.forEach(element => {
          this.userFileList.push(File.fromJSON(element.file))
        });
        
        
        console.log(this.userFileList)
      }
    )
    
  }

  fire(i){
    console.log(i+" got clicked");
    
    console.log()
    
  }

}
