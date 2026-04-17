import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidarCitas } from './liquidar-citas';

describe('LiquidarCitas', () => {
  let component: LiquidarCitas;
  let fixture: ComponentFixture<LiquidarCitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiquidarCitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiquidarCitas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
