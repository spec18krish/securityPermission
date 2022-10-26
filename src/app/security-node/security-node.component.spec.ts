import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityNodeComponent } from './security-node.component';

describe('SecurityNodeComponent', () => {
  let component: SecurityNodeComponent;
  let fixture: ComponentFixture<SecurityNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecurityNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
