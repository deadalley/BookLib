import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LibraryHomeComponent } from './library-home.component'

describe('LibraryHomeComponent', () => {
  let component: LibraryHomeComponent
  let fixture: ComponentFixture<LibraryHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryHomeComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })
/*
  it('should be created', () => {
    expect(component).toBeTruthy();
  });*/
})
