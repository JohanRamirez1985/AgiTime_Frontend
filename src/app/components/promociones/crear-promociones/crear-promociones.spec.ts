import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPromociones } from './crear-promociones';

describe('CrearPromociones', () => {
  let component: CrearPromociones;
  let fixture: ComponentFixture<CrearPromociones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPromociones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPromociones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
