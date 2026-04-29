import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseManager } from './course-manager';

describe('CourseManager', () => {
  let component: CourseManager;
  let fixture: ComponentFixture<CourseManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseManager],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
