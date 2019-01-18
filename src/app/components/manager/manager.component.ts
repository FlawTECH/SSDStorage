import { Component, OnInit } from '@angular/core';
import * as jwtDecode from "jwt-decode";

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {
  public tabs = [];
  private token;
  constructor() {
    this.token = jwtDecode(localStorage.getItem("AuthToken"));
    
    this.tabs = [
      { path: "directories", label: "directories", isActive: "true" },
      { path: "file-share", label: "file-share", isActive: "false"},
      { path: "admin", label: "user-validation",isActive: "false"}
      
    ];
  }

  ngOnInit() {
  }
}
