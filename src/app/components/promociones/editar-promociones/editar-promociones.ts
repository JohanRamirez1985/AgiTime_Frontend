import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Modal } from '../../../shared/services/modal';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PromocionesService } from '../promociones.services';

interface Servicio {
  id: number;
  nombre: string;
  valor: number;
}

@Component({
  selector: 'app-editar-promociones',
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
  templateUrl: './editar-promociones.html',
  styleUrl: './editar-promociones.css'
})

export class EditarPromociones implements OnInit {

  promocion: any;
  serviciosEmpresa: Servicio[] = [];
  serviciosSeleccionados: Servicio[] = [];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  valorPromocion: number = 0;
  loading: boolean = true;
  idEmpresa: number = 0;
  busquedaServicio: string = '';


  constructor(
    private sharedServices: SharedService,
    private router: Router,
    private modalService: Modal,
    private promoServices: PromocionesService
  ) {

  }

  ngOnInit(): void {
    this.promocion = history.state?.promocion;
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;

    if (!this.promocion) {
      console.error('No se recibió la promoción para editar');
      this.loading = false;
      return;
    }

    this.obtenerServicios();
  }

  obtenerServicios(): void {
    this.sharedServices.obtenerServicios(this.idEmpresa)
      .subscribe({
        next: (rest) => {
          this.serviciosEmpresa = rest.datos
            .filter((servicio: any) => servicio.valor > 0)
            .filter((servicio: any, index: number, array: any[]) =>
              index === array.findIndex(s => s.id === servicio.id)
            )
            .map((servicio: any) => ({
              id: servicio.id,
              nombre: servicio.nombre,
              valor: servicio.valor
            }));

          this.cargarDatosPromocion();

          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.modalService.error(err.error.mensaje);
        }
      });
  }

  get serviciosFiltrados(): Servicio[] {

    const texto = this.busquedaServicio.toLowerCase().trim();

    return this.serviciosEmpresa.filter(servicio =>
      servicio.nombre.toLowerCase().includes(texto) &&
      !this.serviciosSeleccionados.some(s => s.id === servicio.id)
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

  get totalServicios(): number {

    return this.serviciosSeleccionados.reduce(
      (total, servicio) => total + Number(servicio.valor || 0),
      0
    );

  }

  private formatearFecha(fecha: Date, esFinal: boolean): string {

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}T${esFinal ? '23:59:59' : '00:00:00'}`;
  }

  public actualizarPromocion(): void {
    if (!this.formularioValido || !this.fechaInicio || !this.fechaFin) {
      return;
    }
    this.loading = true;
    const promocion = {
      id: this.promocion.id,
      empresa: this.idEmpresa,
      valor: this.valorPromocion,
      fechaIni: this.formatearFecha(this.fechaInicio, false),
      fechaFin: this.formatearFecha(this.fechaFin, true),
      servicios: this.serviciosSeleccionados.map(s => s.id)
    };

    this.promoServices.modificarCita(promocion).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.modalService.success(
            rest.mensaje || 'La promocion fue editada exitosamente',
            () => this.cancelar()
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

  quitarServicio(servicio: Servicio): void {

    this.serviciosSeleccionados =
      this.serviciosSeleccionados.filter(
        s => s.id !== servicio.id
      );

  }

  cargarDatosPromocion(): void {

    this.valorPromocion = this.promocion.valor;

    this.fechaInicio = new Date(
      `${this.promocion.fechaInicio}T00:00:00`
    );

    this.fechaFin = new Date(
      `${this.promocion.fechaFin}T00:00:00`
    );

    this.serviciosSeleccionados = this.serviciosEmpresa.filter(
      servicio => this.promocion.servicios.some(
        (s: any) => s.nombre === servicio.nombre
      )
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

  public cancelar(): void {
    this.router.navigate(['/admin/combos']);
  }

}
