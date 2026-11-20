import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarPromociones } from './gestionar-promociones';

describe('GestionarPromociones', () => {
  let component: GestionarPromociones;
  let fixture: ComponentFixture<GestionarPromociones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarPromociones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarPromociones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
