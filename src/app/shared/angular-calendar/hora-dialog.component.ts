import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hora-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title class="titulo">
      Disponibilidad para el {{ data.fecha | date:'fullDate':'':'es' }}
    </h2>

    <mat-dialog-content class="contenido">

      <div class="bloque-horas">
        <h3>🕗 Mañana (AM)</h3>
        <div class="hora-wrapper">
          <div *ngFor="let hora of horasAM"
               class="hora-card"
               [ngClass]="hora.disponible ? 'libre' : 'ocupado'"
               [class.disabled]="!hora.disponible"
               (click)="hora.disponible && seleccionarHora(hora.hora)">
            {{ hora.hora }}
          </div>
        </div>
      </div>

      <div class="bloque-horas">
        <h3>🕓 Tarde (PM)</h3>
        <div class="hora-wrapper">
          <div *ngFor="let hora of horasPM"
               class="hora-card"
               [ngClass]="hora.disponible ? 'libre' : 'ocupado'"
               [class.disabled]="!hora.disponible"
               (click)="hora.disponible && seleccionarHora(hora.hora)">
            {{ hora.hora }}
          </div>
        </div>
      </div>

    </mat-dialog-content>
  `,
  styles: [`
    .titulo {
      color: #1f3c88;
      font-weight: 600;
      font-size: 1.4rem;
      text-align: center;
    }

    .contenido {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .bloque-horas {
      margin-top: 1.5rem;
      width: 100%;
      text-align: center;
    }

    .bloque-horas h3 {
      margin-bottom: 0.5rem;
      color: #1f3c88;
    }

    .hora-wrapper {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }

    .hora-card {
      background-color: #f0f4f8;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      min-width: 100px;
      user-select: none;
    }

    .hora-card:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }

    .hora-card.libre {
      background-color: #e6f4ea;
      color: #1b5e20;
    }

    .hora-card.ocupado {
      background-color: #fcebea;
      color: #c62828;
    }

    .hora-card.disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  `]
})
export class HoraDialogComponent {
  horasAM: { hora: string; disponible: boolean }[] = [];
  horasPM: { hora: string; disponible: boolean }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<HoraDialogComponent>
  ) {
    this.horasAM = data.horas.filter((h: { hora: string }) => h.hora.includes('AM'));
    this.horasPM = data.horas.filter((h: { hora: string }) => h.hora.includes('PM'));
  }

  seleccionarHora(hora: string) {
    this.dialogRef.close(hora);
  }
}
