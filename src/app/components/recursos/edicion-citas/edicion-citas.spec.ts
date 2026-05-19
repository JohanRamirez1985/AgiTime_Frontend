import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionCitas } from './edicion-citas';

describe('EdicionCitas', () => {
  let component: EdicionCitas;
  let fixture: ComponentFixture<EdicionCitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdicionCitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdicionCitas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
