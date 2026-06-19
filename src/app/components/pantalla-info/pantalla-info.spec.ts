import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaInfo } from './pantalla-info';

describe('PantallaInfo', () => {
  let component: PantallaInfo;
  let fixture: ComponentFixture<PantallaInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
