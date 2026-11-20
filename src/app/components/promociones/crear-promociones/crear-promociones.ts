
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { Modal } from '../../../shared/services/modal';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PromocionesService } from '../promociones.services';

interface Servicio {
  id: number;
  nombre: string;
  valor: number;
  observaciones?: string;
}

@Component({
  selector: 'app-crear-promociones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './crear-promociones.html',
  styleUrl: './crear-promociones.css'
})
export class CrearPromociones implements OnInit {

  serviciosEmpresa: Servicio[] = [];
  serviciosSeleccionados: Servicio[] = [];
  busquedaServicio: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  valorPromocion: number | null = null;
  loading: boolean = true;
  guardando: boolean = false;
  idEmpresa: number = 0;


  constructor(
    private sharedServices: SharedService,
    private router: Router,
    private modalService: Modal,
    private promoServices: PromocionesService
  ) {

  }

  ngOnInit(): void {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.obtenerServicios(this.idEmpresa);
  }


  private obtenerServicios(emp: number): void {
    this.sharedServices.obtenerServicios(emp).subscribe({
      next: (rest: any) => {
        if (rest.exito) {
          this.serviciosEmpresa = rest.datos
            .filter((servicio: any) => servicio.valor > 0)
            .map((servicio: any) => ({
              id: servicio.id,
              nombre: servicio.nombre,
              valor: servicio.valor
            }));
        } else {
          this.modalService.error(rest.mensaje);
        }
        this.loading = false;
      },
      error: (err) => {
        this.modalService.error(err.error.mensaje);
        this.loading = false;
      },
    });
  }

  get serviciosFiltrados(): Servicio[] {

    const texto = this.busquedaServicio.toLowerCase().trim();

    return this.serviciosEmpresa.filter(servicio =>
      servicio.nombre.toLowerCase().includes(texto) &&
      !this.serviciosSeleccionados.some(s => s.id === servicio.id)
    );

  }

  agregarServicio(servicio: Servicio): void {

    const existe = this.serviciosSeleccionados.some(
      s => s.id === servicio.id
    );

    if (!existe) {
      this.serviciosSeleccionados.push({ ...servicio });
    }

  }

  quitarServicio(servicio: Servicio): void {

    this.serviciosSeleccionados =
      this.serviciosSeleccionados.filter(
        s => s.id !== servicio.id
      );

  }

  get totalServicios(): number {

    return this.serviciosSeleccionados.reduce(
      (total, servicio) => total + Number(servicio.valor || 0),
      0
    );

  }

  get cantidadServicios(): number {
    return this.serviciosSeleccionados.length;
  }

  get ahorroPromocion(): number {

    if (this.valorPromocion === null) return 0;

    return Math.max(0, this.totalServicios - this.valorPromocion);

  }

  get formularioValido(): boolean {

    return (
      this.serviciosSeleccionados.length > 0 &&
      this.fechaInicio !== null &&
      this.fechaFin !== null &&
      this.fechaFin >= this.fechaInicio &&
      this.valorPromocion !== null &&
      this.valorPromocion > 0
    );

  }

  public crearPromocion(): void {
    if (!this.formularioValido || !this.fechaInicio || !this.fechaFin) {
      return;
    }
    this.loading = true;
    const promocion = {
      empresa: this.idEmpresa,
      valor: this.valorPromocion,
      fechaIni: this.formatearFecha(this.fechaInicio, false),
      fechaFin: this.formatearFecha(this.fechaFin, true),
      servicios: this.serviciosSeleccionados.map(s => s.id)
    };

    this.promoServices.guardarPromocion(promocion).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.modalService.success(
            rest.mensaje || 'La promocion fue creada exitosamente',
            () => this.volver()
          );
        } else {
          this.modalService.error(rest.mensaje);
        }
        this.loading = false;
      },
      error: (err) => {
        this.modalService.error(err.error.mensaje);
        this.loading = false;
      }
    })
  }

  private formatearFecha(fecha: Date, esFinal: boolean): string {

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}T${esFinal ? '23:59:59' : '00:00:00'}`;
  }

  public cancelar(): void {
    this.loading = true;
    this.serviciosSeleccionados = [];
    this.fechaInicio = null;
    this.fechaFin = null;
    this.valorPromocion = null;
    this.busquedaServicio = '';
    this.loading = false;
  }

  public volver(): void {
    this.router.navigate(['/admin/combos']);
  }

}
