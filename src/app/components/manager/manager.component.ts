import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {
  public tabs = [];
  
  constructor() {
    this.tabs = [
      { path: "directories", label: "directories", isActive: "true" },
    ]
  }

  ngOnInit() {
  }
}
