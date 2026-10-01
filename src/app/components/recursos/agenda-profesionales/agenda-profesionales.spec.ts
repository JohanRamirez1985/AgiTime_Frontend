import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaProfesionales } from './agenda-profesionales';

describe('AgendaProfesionales', () => {
  let component: AgendaProfesionales;
  let fixture: ComponentFixture<AgendaProfesionales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaProfesionales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaProfesionales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
