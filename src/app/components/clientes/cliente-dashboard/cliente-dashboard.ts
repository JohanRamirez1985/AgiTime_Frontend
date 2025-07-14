import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [  CommonModule,
  RouterModule,
  MatCardModule,
  MatButtonModule,
  MatDividerModule],
  templateUrl: './cliente-dashboard.html',
  styleUrl: './cliente-dashboard.css'
})

export class ClienteDashboard {
  empresa: any = {
    nombre : 'Barberia 5ta',
    direccion: 'Calle falsa 123',
    telefono : '12365841'
  };
  clienteNombre: string = 'Julian David Garcia Paz';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const empresaData = localStorage.getItem('empresa');
    const clienteData = localStorage.getItem('cliente');

    if (empresaData) this.empresa = JSON.parse(empresaData);
    if (clienteData) this.clienteNombre = JSON.parse(clienteData).nombre;
  }

  irAReservar() {
    this.router.navigate(['/cliente/reservar']);
  }

  irAHistorial() {
    this.router.navigate(['/cliente/historial']);
  }

}
