import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAgendamientoOrden } from './gestion-agendamiento-orden';

describe('GestionAgendamientoOrden', () => {
  let component: GestionAgendamientoOrden;
  let fixture: ComponentFixture<GestionAgendamientoOrden>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionAgendamientoOrden]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionAgendamientoOrden);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
