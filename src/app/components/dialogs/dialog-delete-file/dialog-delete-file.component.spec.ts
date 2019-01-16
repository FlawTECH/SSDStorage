import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteFileComponent } from './dialog-delete-file.component';

describe('DialogDeleteFileComponent', () => {
  let component: DialogDeleteFileComponent;
  let fixture: ComponentFixture<DialogDeleteFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDeleteFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeleteFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
