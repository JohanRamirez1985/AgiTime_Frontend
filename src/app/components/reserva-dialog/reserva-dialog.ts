import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reserva-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './reserva-dialog.html',
  styleUrl: './reserva-dialog.css',
})
export class ReservaDialog {
  form: FormGroup;

  // ✅ Avisar al padre cuando se complete el celular
  @Output() celularIngresado = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const esEmpresa8 = Number(data.idEmpresa) === 8;

    this.form = this.fb.group({
      celular: ['', [
        Validators.required,
        Validators.pattern(/^\d{7,}$/)
      ]],

      nombre: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
      ]],

      correo: ['', esEmpresa8 ? [] : [Validators.email]],

      fechaNacimiento: [
        '',
        esEmpresa8 ? [] : [Validators.required]
      ]
    });

    this.form.get('celular')?.valueChanges.subscribe((valor: string) => {
      if (valor && valor.length === 10) {
        this.celularIngresado.emit(valor);
      } else {
        this.form.patchValue(
          {
            nombre: '',
            correo: '',
            fechaNacimiento: ''
          },
          { emitEvent: false }
        );
      }
    });
  }

  // ✅ Método para que el padre pueda poblar datos en el modal
  poblarDatos(cliente: any) {
    this.form.patchValue({
      nombre: cliente.nombre || '',
      correo: cliente.correo || '',
      fechaNacimiento: cliente.fechaNacimiento || '',
    });
  }

  cerrar() {
    this.dialogRef.close();
  }

  confirmar() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
