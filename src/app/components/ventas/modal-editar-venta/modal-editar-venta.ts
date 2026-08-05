import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { inventarioProductosService } from '../../../services/inventario-productos.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Modal } from '../../../shared/services/modal';

@Component({
  selector: 'app-modal-editar-venta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './modal-editar-venta.html',
  styleUrls: ['./modal-editar-venta.css']
})
export class ModalEditarVenta {

  form: FormGroup;
  idEmpresa: number = 0;
  loading = false;

  /** Valores originales */
  private ventaOriginal = 0;
  private comisionOriginal = 0;
  private descuentoOriginal = 0;

  constructor(
    private fb: FormBuilder,
    private gestionService: inventarioProductosService,
    private modalService: Modal,
    private dialogRef: MatDialogRef<ModalEditarVenta>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;
    this.idEmpresa = idEmpresa;
    this.ventaOriginal = data.venta;
    this.comisionOriginal = data.comision;
    this.descuentoOriginal = data.descuento;

    this.form = this.fb.group({
      venta: [data.venta, [Validators.required, Validators.min(0)]],
      descuento: [data.descuento, [Validators.required, Validators.min(0)]],
      comision: [data.comision, [Validators.required, Validators.min(0)]]
    });

    this.escucharDescuento();
  }

  private escucharDescuento(): void {
    this.form.get('descuento')?.valueChanges.subscribe(valor => {

      const descuento = Number(valor) || 0;

      // Si el descuento no cambió, restaurar valores originales
      if (descuento === this.descuentoOriginal) {

        this.form.patchValue({
          venta: this.ventaOriginal,
          comision: this.comisionOriginal
        }, { emitEvent: false });

        return;
      }

      const nuevaVenta = Math.max(this.ventaOriginal - descuento, 0);
      const nuevaComision = Math.max(this.comisionOriginal - descuento, 0);

      this.form.patchValue({
        venta: nuevaVenta,
        comision: nuevaComision
      }, { emitEvent: false });

    });
  }

  guardar(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    let data = this.form.value;

    const request = {
      empresa: this.idEmpresa,
      Detalles: [{
        Total: data.venta,
        Descuento: data.descuento,
        Porcentaje: data.comision,
        Id: this.data.id
      }]
    };

    this.gestionService.editarVenta(request)
      .subscribe({
        next: (resp) => {
          if (resp.exito) {
            this.modalService.success(resp.mensaje);
            this.dialogRef.close(request);
          } else {
            this.modalService.error(resp.mensaje);
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.modalService.error(err.statusText);
        }
      })
  }

  cancelar(): void {
    this.dialogRef.close();
  }

}