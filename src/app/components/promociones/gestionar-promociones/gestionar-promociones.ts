
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { Table } from '../../transversales/table/table';
import { PromocionesService } from '../promociones.services';
import { Modal } from '../../../shared/services/modal';
import { Router } from '@angular/router';



interface Promocion {
  id: number;
  nombre: string;
  descripcion: string;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  estado: boolean;
}

@Component({
  selector: 'app-gestionar-promociones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    Table
  ],
  templateUrl: './gestionar-promociones.html',
  styleUrl: './gestionar-promociones.css'
})
export class GestionarPromociones implements OnInit {

  loading = false;
  isMobileView = window.innerWidth < 768;
  promociones: Promocion[] = [];
  promocionesFiltradas: Promocion[] = [];
  busqueda = '';
  filtroEstado = 'todos';
  filtroTipo = 'todos';
  columnas = [
    { key: 'nombre', label: 'Promoción' },
    { key: 'valor', label: 'Valor' },
    { key: 'fechaInicio', label: 'Fecha inicio' },
    { key: 'fechaFin', label: 'Fecha fin' },
    { key: 'estadoTexto', label: 'Estado' }
  ];
  acciones: any[] = [
    {
      icon: 'edit',
      label: 'Editar cantidad de la fidelidad',
      action: (element: any) => this.editarPromocion(element)
    },
  ];
  idEmpresa: number = 0;


  constructor(
    private router: Router,
    private promoServices: PromocionesService,
    private modalService: Modal
  ) {

  }

  ngOnInit(): void {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.obtenerPromociones();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  obtenerPromociones(): void {
    this.loading = true;
    this.promoServices.gestionarPromociones(this.idEmpresa)
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.promociones = rest.datos.map((p: any) => ({
              id: p.id,
              nombre: p.servicios.map((s: any) => s.nombre).join(' + '),
              descripcion: p.servicios.map((s: any) => s.nombre).join(' + '),
              valor: p.valor,
              fechaInicio: p.fechaIni.split('T')[0],
              fechaFin: p.fechaFin.split('T')[0],
              estado: p.estado === 'Activo',
              servicios: p.servicios
            }));
          } else {
            this.promociones = [];
          }

          this.promocionesFiltradas = this.promociones;
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (err) => {
          this.modalService.error(err.error.mensaje);
          this.loading = false;
        }
      })
  }

  aplicarFiltros(): void {

    const texto = this.busqueda.toLowerCase().trim();

    this.promocionesFiltradas = this.promociones
      .filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.descripcion.toLowerCase().includes(texto)
      )
      .filter(p =>
        this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'activos' && p.estado) ||
        (this.filtroEstado === 'inactivos' && !p.estado)
      ).map(p => ({
        ...p,
        estadoTexto: p.estado ? 'Activa' : 'Inactiva'
      }));
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'todos';
    this.filtroTipo = 'todos';

    this.aplicarFiltros();
  }

  get totalPromociones(): number {
    return this.promociones.length;
  }

  get promocionesActivas(): number {
    return this.promociones.filter(p => p.estado).length;
  }

  get promocionesInactivas(): number {
    return this.promociones.filter(p => !p.estado).length;
  }

  crearPromocion(): void {
    this.router.navigate(['/admin/crear-combos']);
  }

  editarPromocion(promocion: Promocion): void {
    this.router.navigate(['/admin/editar-combos'], {
      state: { promocion: promocion }
    });
  }

  verPromocion(promocion: Promocion): void {
    console.log('Ver promoción', promocion);
  }

  cambiarEstado(promocion: Promocion): void {
    promocion.estado = !promocion.estado;
    this.aplicarFiltros();
  }

}
