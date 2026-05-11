import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueDashboard } from './revenue-dashboard';

describe('RevenueDashboard', () => {
  let component: RevenueDashboard;
  let fixture: ComponentFixture<RevenueDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
