import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionTipoUsuario } from './seleccion-tipo-usuario';

describe('SeleccionTipoUsuario', () => {
  let component: SeleccionTipoUsuario;
  let fixture: ComponentFixture<SeleccionTipoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionTipoUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionTipoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
