import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsDashboard } from './metrics-dashboard';

describe('MetricsDashboard', () => {
  let component: MetricsDashboard;
  let fixture: ComponentFixture<MetricsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
