import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActualizando } from './modal-actualizando';

describe('ModalActualizando', () => {
  let component: ModalActualizando;
  let fixture: ComponentFixture<ModalActualizando>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalActualizando]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalActualizando);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
