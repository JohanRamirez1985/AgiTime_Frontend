import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarVentas } from './gestionar-ventas';

describe('GestionarVentas', () => {
  let component: GestionarVentas;
  let fixture: ComponentFixture<GestionarVentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarVentas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarVentas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
