import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

import { AppComponent } from './app.component';
import { AdminModule } from './admin/admin.module';
import { AuthHeaderInterceptor } from './interceptors/header.interceptor';
import { CatchErrorInterceptor } from './interceptors/http-error.interceptor';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatRadioModule} from '@angular/material/radio';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ManagerComponent } from './components/manager/manager.component';
import { ListDirectoryComponent } from './components/list-directory/list-directory.component';
import { WaitingComponent } from './components/waiting/waiting.component';
import { DialogRenameFileComponent } from './components/dialogs/dialog-rename-file/dialog-rename-file.component';
import { DialogDeleteFileComponent } from './components/dialogs/dialog-delete-file/dialog-delete-file.component';
import { MatSnackBarModule, MatDividerModule } from '@angular/material';
import { FileShareComponent } from './components/file-share/file-share.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    FileUploadComponent,
    ManagerComponent,
    ListDirectoryComponent,
    WaitingComponent,
    DialogRenameFileComponent,
    DialogDeleteFileComponent,
    FileShareComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    AuthModule,
    AdminModule,
    AppRoutingModule,
    MatGridListModule,
    MatRadioModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthHeaderInterceptor,
    multi: true,
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: CatchErrorInterceptor,
    multi: true,
  }],
  entryComponents: [
    DialogRenameFileComponent,
    DialogDeleteFileComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
