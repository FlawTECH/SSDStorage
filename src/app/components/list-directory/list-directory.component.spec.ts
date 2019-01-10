import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDirectoryComponent } from './list-directory.component';

describe('ListDirectoryComponent', () => {
  let component: ListDirectoryComponent;
  let fixture: ComponentFixture<ListDirectoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListDirectoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
