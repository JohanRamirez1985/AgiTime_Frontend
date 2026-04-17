import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { SharedService } from '../../services/shared.service';
import { InformesService } from '../../services/informes.service';
import { Modal } from '../../shared/services/modal';

@Component({
  selector: 'app-liquidar-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './liquidar-citas.html',
  styleUrl: './liquidar-citas.css'
})
export class LiquidarCitas {

  loading: boolean = true;
  btnGuardar: boolean = false;
  form: FormGroup;
  idEmpresa: any;
  listaBarberos: any[] = [];
  usuario: any;
  private intervalBtn: any;


  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private informeServie: InformesService,
    private modalService: Modal
  ) {
    this.form = this.fb.group({
      fechaInicio: [],
      fechaFin: [{ value: null, disabled: true }],
      barberos: this.fb.array([])
    });
  }

  ngOnInit() {
    this.form.get('fechaInicio')?.valueChanges.subscribe((fecha: Date) => {
      if (fecha) {
        const fechaFinal = new Date(fecha);
        fechaFinal.setDate(fechaFinal.getDate() + 6);

        this.form.get('fechaFin')?.setValue(fechaFinal);
      }
    });

    this.intervalBtn = setInterval(() => {
      const fechaIni = this.form.get('fechaInicio')?.value;
      const fechaFin = this.form.get('fechaFin')?.value;
      this.btnGuardar = !!(fechaIni && fechaFin);

    }, 1000);

    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const infoUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.usuario = infoUser;
    this.obtenerUsuarios(id);

  }

  public soloLunes = (fecha: Date | null): boolean => {
    if (!fecha) return false;
    return fecha.getDay() === 1; // 1 = lunes
  };

  private obtenerUsuarios(id: number) {
    this.sharedService.obtenerUsuarios(id).subscribe({
      next: (rest) => {
        let datos = rest.datos;
        let barberos = [];
        for (let i = 0; i < datos.length; i++) {
          if (parseInt(datos[i].rol) === 3 && datos[i].estado === 'Activo') {
            barberos.push(datos[i]);
          }
          this.listaBarberos = barberos;
        }
        this.inicializarBarberos();
        this.loading = false;
      },
    });
  }

  public guardar(): void {
    this.loading = true;
    const formValue = this.form.getRawValue();

    const barberosSeleccionadosIds = this.listaBarberos
      .filter((_, index) => formValue.barberos[index])
      .map(barbero => barbero.id)
      .join(',');

    const payload = {
      empresa: parseInt(this.idEmpresa),
      fechaIni: this.formatearFechaInicio(formValue.fechaInicio),
      fechaFin: this.formatearFechaFin(formValue.fechaFin),
      barberos: barberosSeleccionadosIds,
      fechaCreacion: this.formatearFechaActual(),
      usuarioCreacion: this.usuario.id.toString()
    };

    this.informeServie.liquidacionSemanal(payload).subscribe({
      next: (resp) => {
        this.modalService.success(
          resp.mensaje || 'La cita fue creada exitosamente',
          () => this.limpiarFormulario()
        );
        this.loading = false;
      },
      error: (err) => {
        this.modalService.error(err.mensaje);
        this.loading = false;
      }
    });

  }

  limpiarFormulario() {
    // 1. Reset general del form
    this.form.reset();

    // 2. Limpiar FormArray de barberos
    this.barberosFormArray.clear();

    // 3. Volver a inicializar checkboxes
    this.listaBarberos.forEach(() => {
      this.barberosFormArray.push(new FormControl(false));
    });
  }


  inicializarBarberos() {
    this.listaBarberos.forEach(() => {
      this.barberosFormArray.push(new FormControl(false));
    });
  }

  getBarberoControl(index: number) {
    return this.barberosFormArray.at(index) as FormControl;
  }

  get barberosFormArray(): FormArray {
    return this.form.get('barberos') as FormArray;
  }

  formatearFechaInicio(fecha: Date): string {
    const f = new Date(fecha);
    return `${f.getFullYear()}-${this.pad(f.getMonth() + 1)}-${this.pad(f.getDate())}T00:00:00`;
  }

  formatearFechaFin(fecha: Date): string {
    const f = new Date(fecha);
    return `${f.getFullYear()}-${this.pad(f.getMonth() + 1)}-${this.pad(f.getDate())}T23:59:59`;
  }

  formatearFechaActual(): string {
    const now = new Date();

    return `${now.getFullYear()}-${this.pad(now.getMonth() + 1)}-${this.pad(now.getDate())}` +
      `T${this.pad(now.getHours())}:${this.pad(now.getMinutes())}:${this.pad(now.getSeconds())}`;
  }

  private pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  ngOnDestroy() {
    if (this.intervalBtn) {
      clearInterval(this.intervalBtn);
    }
  }

}