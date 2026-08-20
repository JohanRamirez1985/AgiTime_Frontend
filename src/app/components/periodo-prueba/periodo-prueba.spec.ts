import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodoPrueba } from './periodo-prueba';

describe('PeriodoPrueba', () => {
  let component: PeriodoPrueba;
  let fixture: ComponentFixture<PeriodoPrueba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodoPrueba]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodoPrueba);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
