import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrdenAgendamientoService } from '../../../services/ordenesAgenda.service';
import { Modal } from '../../../shared/services/modal';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

interface Cliente {
  id: number;
  nombre: string;
}

interface SesionOrden {
  numero: number;
  servicio: string;
  fechaCita?: string;
  hora?: string;
  estado: 'Pendiente' | 'Agendada' | 'Completada' | 'Asistio';
  id: number
}

interface Orden {
  id: number;
  numero: string;
  fechaCreacion: string;
  nombreServicio: string;
  idServicio: number;
  totalSesiones: number;
  sesionesCompletadas: number;
  estado: 'Pendiente' | 'Completada';
  sesiones: SesionOrden[];
}

@Component({
  selector: 'app-gestion-agendamiento-orden',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './gestion-agendamiento-orden.html',
  styleUrl: './gestion-agendamiento-orden.css'
})
export class GestionAgendamientoOrden {

  textoBusqueda = '';
  loading: boolean = false;
  clienteSeleccionado: Cliente | null = null;
  ordenSeleccionada: Orden | null = null;
  idEmpresa: number = 0;
  clientes: Cliente[] = [];
  ordenes: Orden[] = [];
  mostrarSesiones: boolean = false;
  // ordenes: Orden[] = [
  //   {
  //     id: 1,
  //     numero: 'ORD-0001',
  //     fechaCreacion: '20/08/2026',
  //     nombreServicio: 'Tratamiento capilar',
  //     totalSesiones: 5,
  //     sesionesCompletadas: 3,
  //     estado: 'Pendiente',

  //     sesiones: [
  //       {
  //         numero: 1,
  //         servicio: 'Diagnóstico',
  //         fecha: '21/08/2026',
  //         hora: '10:00',
  //         estado: 'Completada'
  //       },
  //       {
  //         numero: 2,
  //         servicio: 'Tratamiento capilar',
  //         fecha: '25/08/2026',
  //         hora: '10:00',
  //         estado: 'Completada'
  //       }]
  //   }
  // ]

  constructor(
    private ordenService: OrdenAgendamientoService,
    private modalService: Modal,
    private router: Router
  ) {

  }

  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.consultarClientes();
  }

  private consultarDetalleSesion(id: number): void {
    const request = {
      empresa: this.idEmpresa,
      cliente: id
    }

    this.ordenService.consultarDetalleAgenda(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.ordenes = rest.data;
          this.textoBusqueda = '';
          console.log(rest);

        } else {
          this.modalService.error(rest.mensaje)
        }
        this.loading = false;
      },
      error: (err) => {
        this.modalService.error(err.mensaje);
      }
    });

  }

  getSesionesCompletadas(orden: any): number {
    return orden.sesiones?.filter(
      (sesion: any) => sesion.estado === 'Asistio'
    ).length || 0;
  }

  private consultarClientes(): void {

    const request = {
      emp: this.idEmpresa
    }

    this.ordenService.consultarClientes(request).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.clientes = rest.datos.map((c: Cliente) => ({
            id: c.id,
            nombre: c.nombre
          }));
        } else {
          this.modalService.error(rest.mensaje)
        }
      },
      error: (err) => {
        this.modalService.error(err.mensaje);
      }
    });
  }


  get clientesFiltrados(): Cliente[] {

    if (!this.textoBusqueda.trim()) {
      return [];
    }

    const texto = this.textoBusqueda.toLowerCase();

    return this.clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(texto)
    );
  }


  seleccionarCliente(cliente: Cliente): void {

    this.clienteSeleccionado = cliente;

    this.textoBusqueda = cliente.nombre;

    this.ordenSeleccionada = null;

    this.loading = true;

    this.consultarDetalleSesion(this.clienteSeleccionado.id);

    // Aquí posteriormente llamaremos al API
    // para consultar las órdenes pendientes
  }


  seleccionarOrden(orden: Orden): void {

    this.ordenSeleccionada = orden;
    this.mostrarSesiones = !this.mostrarSesiones

  }


  tieneSesionesPendientes(orden: Orden): boolean {

    return orden.sesiones.some(
      sesion => sesion.estado === 'Pendiente'
    );

  }


  sesionesPendientes(orden: Orden): SesionOrden[] {

    return orden.sesiones.filter(
      sesion => sesion.estado === 'Pendiente'
    );

  }


  agendarSesion(sesion: SesionOrden): void {

    if (!this.ordenSeleccionada) {
      return;
    }

    const data = {
      idOrden: this.ordenSeleccionada.id,
      numeroSesion: sesion.id,
      idCliente: this.clienteSeleccionado?.id,
      nombreCLiente: this.clienteSeleccionado?.nombre,
      servicioSeleccionado: this.ordenSeleccionada.idServicio
    }

    localStorage.setItem('ordenSeleccionada', JSON.stringify(data));


    this.router.navigate(['admin/recurso/dash'], {
      queryParams: { tab: 1 }
    });

  }

}