import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [  CommonModule,
    MatTooltipModule,
    MatIconModule ,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule],
  templateUrl: './cliente-dashboard.html',
  styleUrl: './cliente-dashboard.css'
})

export class ClienteDashboard {
  empresa: any = {
    nombre : '',
    direccion: '',
    telefono : '',
    sedes: []
  };
  clienteNombre: string = '';
  img: string = '';
  sedesAgrupadas: any[][] = [];

  constructor(private router: Router) {}
  

  ngOnInit(): void {
    const empresaData = localStorage.getItem('empresa');
    const clienteData = localStorage.getItem('cliente');   
    const usuarioData = localStorage.getItem('usuario'); 

    if (usuarioData) this.clienteNombre = JSON.parse(usuarioData).nombre;

    if (empresaData) {
      this.empresa = JSON.parse(empresaData);
      this.img = 'assets/img/' + this.empresa.logo;
    }

    if (clienteData) {
      this.clienteNombre = JSON.parse(clienteData).nombre;
    }

     this.sedesAgrupadas = this.groupInThrees(this.empresa.sedes);
  }

  irAReservar() {
    this.router.navigate(['/cliente/reservar']);
  }

  irAHistorial() {
    this.router.navigate(['/cliente/historial']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/seleccionar']);
  }

  groupInThrees(array: any[]): any[][] {
    const grouped = [];
    for (let i = 0; i < array.length; i += 3) {
      grouped.push(array.slice(i, i + 3));
    }
    return grouped;
  }


}
