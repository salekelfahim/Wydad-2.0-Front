import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTicketsComponent } from './add-tickets.component';

describe('AddTicketsComponent', () => {
  let component: AddTicketsComponent;
  let fixture: ComponentFixture<AddTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTicketsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
