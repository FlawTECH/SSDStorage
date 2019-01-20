import { Component, OnInit } from '@angular/core';
import * as jwtDecode from "jwt-decode";

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {
  private adminTabs = [];
  private userTabs = [];
  private isAdmin:boolean;
  private token;
  constructor() {
    this.token = jwtDecode(localStorage.getItem("AuthToken"));
    this.isAdmin = this.token.roles.indexOf('admin') >-1;
    this.adminTabs = [
      { path: "directories", label: "directories", isActive: "true" },
      { path: "file-share", label: "file-share", isActive: "false"},
      { path: "admin", label: "user-validation",isActive: "false"}
      
    ];

    this.userTabs = [
      { path: "directories", label: "directories", isActive: "true" },
      { path: "file-share", label: "file-share", isActive: "false"},      
    ];
  }

  ngOnInit() {
  }
}
