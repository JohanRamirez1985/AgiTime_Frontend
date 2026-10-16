import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profesionales',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './profesionales.html',
  styleUrl: './profesionales.css'
})
export class Profesionales {
  @Input() recursosList: any[] = [];
  @Input() sedeSeleccionada: string = '';

  @Output() reservar = new EventEmitter<any>();
  @Output() cambiarSedeEvento = new EventEmitter<void>();

  irAReservar(usuario: any): void {
    this.reservar.emit(usuario);
  }

  cambiarSede(): void {
    this.cambiarSedeEvento.emit();
  }
}
