import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadmapDialog } from './roadmap-dialog';

describe('RoadmapDialog', () => {
  let component: RoadmapDialog;
  let fixture: ComponentFixture<RoadmapDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoadmapDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoadmapDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
