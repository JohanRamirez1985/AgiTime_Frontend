import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface Cliente {
  id: number;
  nombre: string;
}

interface SesionOrden {
  numero: number;
  servicio: string;
  fecha?: string;
  hora?: string;
  estado: 'Pendiente' | 'Agendada' | 'Completada';
}

interface Orden {
  id: number;
  numero: string;
  fechaCreacion: string;
  descripcion: string;
  totalSesiones: number;
  sesionesCompletadas: number;
  estado: 'Pendiente' | 'Finalizada';
  sesiones: SesionOrden[];
}

@Component({
  selector: 'app-gestion-agendamiento-orden',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './gestion-agendamiento-orden.html',
  styleUrl: './gestion-agendamiento-orden.css'
})
export class GestionAgendamientoOrden {

  textoBusqueda = '';

  clienteSeleccionado: Cliente | null = null;

  ordenSeleccionada: Orden | null = null;

  clientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan Pérez'
    },
    {
      id: 2,
      nombre: 'Carlos Gómez'
    }
  ];

  ordenes: Orden[] = [
    {
      id: 1,
      numero: 'ORD-0001',
      fechaCreacion: '20/08/2026',
      descripcion: 'Tratamiento capilar',
      totalSesiones: 5,
      sesionesCompletadas: 3,
      estado: 'Pendiente',

      sesiones: [
        {
          numero: 1,
          servicio: 'Diagnóstico',
          fecha: '21/08/2026',
          hora: '10:00',
          estado: 'Completada'
        },
        {
          numero: 2,
          servicio: 'Tratamiento capilar',
          fecha: '25/08/2026',
          hora: '10:00',
          estado: 'Completada'
        },
        {
          numero: 3,
          servicio: 'Tratamiento capilar',
          fecha: '28/08/2026',
          hora: '10:00',
          estado: 'Completada'
        },
        {
          numero: 4,
          servicio: 'Tratamiento capilar',
          estado: 'Pendiente'
        },
        {
          numero: 5,
          servicio: 'Tratamiento capilar',
          estado: 'Pendiente'
        }
      ]
    }
  ];


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

    // Aquí posteriormente llamaremos al API
    // para consultar las órdenes pendientes
  }


  seleccionarOrden(orden: Orden): void {

    this.ordenSeleccionada = orden;

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

    console.log('Agendar sesión:', {
      idOrden: this.ordenSeleccionada.id,
      numeroSesion: sesion.numero
    });

    /*
      Posteriormente aquí podemos hacer:

      this.router.navigate(
        ['/admin/agendamiento'],
        {
          queryParams: {
            idOrden: this.ordenSeleccionada.id,
            numeroSesion: sesion.numero
          }
        }
      );

      Así reutilizamos tu agendamiento actual.
    */
  }

}