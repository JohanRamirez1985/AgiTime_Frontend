import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hora-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatExpansionModule, MatButtonModule, MatIconModule ],
  templateUrl: './hora-dialog.component.html',
  styleUrls: ['./hora-dialog.component.css'],
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

  cerrar(): void {
    this.dialogRef.close();
  }
}