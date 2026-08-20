import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeriodoPruebaService } from '../../services/periodoPrueba.service';

@Component({
  selector: 'app-periodo-prueba',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './periodo-prueba.html',
  styleUrl: './periodo-prueba.css'
})
export class PeriodoPrueba {

  formulario: FormGroup;
  idEmpresa: number = 0;
  empresa: any = '';
  barberos = [
    {
      id: 1,
      nombre: 'Juan Pérez'
    },
    {
      id: 2,
      nombre: 'Carlos Gómez'
    },
    {
      id: 3,
      nombre: 'Andrés López'
    }
  ];

  sedes = [
    {
      id: 1,
      nombre: 'Sede Principal'
    },
    {
      id: 2,
      nombre: 'Sede Norte'
    },
    {
      id: 3,
      nombre: 'Sede Centro'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private PpServices: PeriodoPruebaService
  ) {

    this.consultarSedes();

    this.formulario = this.fb.group({
      barbero: ['', Validators.required],
      sede: ['', Validators.required],
      fecha: ['', Validators.required],
      numeroServicios: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      gananciaBarbero: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      gananciaBarberia: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });

  }

  ngOnInit() {
    this.empresa = JSON.parse(localStorage.getItem('empresa') || '');
    this.idEmpresa = this.empresa.id;
  }

  private consultarSedes(): void {
    this.PpServices.obtenerTodasSedes(this.idEmpresa.toString())
    .subscribe({
      next: (resp: any) => {
        if(resp.exito) {

        }else {
          
        }

      },
      error: (error) => {

      }
    })
  }

  guardar(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.value;

    console.log('Datos periodo de prueba:', datos);

    // Aquí posteriormente puedes llamar a tu servicio
    // this.servicio.crearPeriodoPrueba(datos).subscribe(...)

  }

}