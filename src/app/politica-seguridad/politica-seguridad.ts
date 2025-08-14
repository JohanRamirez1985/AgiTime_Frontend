import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-politica-seguridad',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './politica-seguridad.html',
  styleUrl: './politica-seguridad.css'
})
export class PoliticaSeguridad {
  aceptoPolitica = false;

  continuar() {
    // Aquí puedes redirigir o cerrar sesión, etc.
    console.log('Política aceptada');
  }
}
