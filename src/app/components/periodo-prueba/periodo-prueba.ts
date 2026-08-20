import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeriodoPruebaService } from '../../services/periodoPrueba.service';
import { SharedService } from '../../services/shared.service';
import { Modal } from '../../shared/services/modal';


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
  user: any = '';
  barberos: { id: number; nombre: string }[] = [];
  guardando: boolean = false;
  sedes: { id: number; nombre: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private PpServices: PeriodoPruebaService,
    private sharedServices: SharedService,
    private modalService: Modal
  ) {
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
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    this.idEmpresa = this.empresa.id;
    this.consultarSedes();
    this.consultarBarberos();
  }

  private consultarBarberos(): void {
    this.sharedServices.obtenerRecursosAgenda(this.idEmpresa).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.barberos = rest.datos.usuario.map((b: any) => ({
            id: b.id,
            nombre: b.nombre
          }))
        } else {
          this.barberos = [];
        }
      },
      error: (err) => {
        this.barberos = [];
      }
    })
  }

  private consultarSedes(): void {
    this.PpServices.obtenerTodasSedes(this.idEmpresa.toString())
      .subscribe({
        next: (resp: any) => {
          if (resp.exito) {
            this.sedes = resp.datos.map((s: any) => ({
              id: s.id,
              nombre: s.nombre
            }));
          } else {
            this.sedes = [];
          }

        },
        error: (error) => {
          this.sedes = [];
        }
      })
  }

  guardar(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.guardando) {
      return;
    }

    this.guardando = true;

    const ahora = new Date();

    const fechaLocal =
      ahora.getFullYear() +
      '-' +
      String(ahora.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(ahora.getDate()).padStart(2, '0') +
      'T' +
      String(ahora.getHours()).padStart(2, '0') +
      ':' +
      String(ahora.getMinutes()).padStart(2, '0') +
      ':' +
      String(ahora.getSeconds()).padStart(2, '0');

    const datos = this.formulario.value;

    const request = {
      valorBarberia: datos.gananciaBarberia,
      valorBarbero: datos.gananciaBarbero,
      valorServicio: datos.gananciaBarberia + datos.gananciaBarbero,
      fecha: datos.fecha,
      usuarioCreacion: this.user.id.toString(),
      fechaCreacion: fechaLocal,
      empresa: this.idEmpresa,
      numero: datos.numeroServicios,
      recurso: parseInt(datos.barbero, 10),
      sede: datos.sede
    };

    this.PpServices.guardarPeriodoPrueba(request)
      .subscribe({

        next: (resp: any) => {
          this.guardando = false;
          if (resp.exito) {
            this.modalService.success(resp.mensaje);
            this.formulario.reset();
          } else {
            this.modalService.error(resp.mensaje);
          }
        },
        error: (error) => {
          this.guardando = false;
          this.modalService.error(
            'Ocurrió un error al guardar el periodo de prueba.'
          );
        }
      });
  }
}