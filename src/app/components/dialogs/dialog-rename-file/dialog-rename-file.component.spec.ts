import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRenameFileComponent } from './dialog-rename-file.component';

describe('DialogRenameFileComponent', () => {
  let component: DialogRenameFileComponent;
  let fixture: ComponentFixture<DialogRenameFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogRenameFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogRenameFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
