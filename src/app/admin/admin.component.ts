import { Component, OnInit } from '@angular/core';
import { AdminService } from './admin.service'
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  private users;
  private nbOfUserStatusUpdated = 0;

  constructor(private adminService: AdminService, private snackBar: MatSnackBar ) {}

  public ngOnInit() {
    this.adminService.getAllNonActiveUsers().subscribe(res => {
      this.users = res;
      for (let i = 0; i < this.users.length; i++) {
        this.users[i]['currentStatus'] = this.users[i].status;
      }
    });
  }

  onSubmit(){
    const req = [];

    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].status != this.users[i].currentStatus) {
        this.nbOfUserStatusUpdated ++;
        req.push({
          "_id" : this.users[i]._id,
          "newStatus" : this.users[i].status
        });

        if (this.users[i].currentStatus == 'Waiting' && this.users[i].status == 'Deactivated') {
          this.snackBar.open('You can are trying to deactivate a user who is not active', 'Close', {
            duration: 2000
          })
          this.nbOfUserStatusUpdated = 0; 
          return;
        }
      }
    }
    
    this.adminService.setStatus(req).subscribe(res => {
      this.snackBar.open('Successfully updated ' + this.nbOfUserStatusUpdated + ' user status', 'Close', {
        duration: 2000
      })
      this.nbOfUserStatusUpdated = 0;
      this.setCurrentStatus();
    });
  }

  setCurrentStatus() {
    for (let i = 0; i < this.users.length; i++) {
      this.users[i].currentStatus = this.users[i].status;
    }
  }
}


