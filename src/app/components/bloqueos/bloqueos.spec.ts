import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bloqueos } from './bloqueos';

describe('Bloqueos', () => {
  let component: Bloqueos;
  let fixture: ComponentFixture<Bloqueos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bloqueos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bloqueos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
