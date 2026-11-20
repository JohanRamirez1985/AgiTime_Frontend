import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPromociones } from './editar-promociones';

describe('EditarPromociones', () => {
  let component: EditarPromociones;
  let fixture: ComponentFixture<EditarPromociones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPromociones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPromociones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
