import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditarVenta } from './modal-editar-venta';

describe('ModalEditarVenta', () => {
  let component: ModalEditarVenta;
  let fixture: ComponentFixture<ModalEditarVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditarVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditarVenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
