import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidarVersion } from './validar-version';

describe('ValidarVersion', () => {
  let component: ValidarVersion;
  let fixture: ComponentFixture<ValidarVersion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidarVersion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidarVersion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
