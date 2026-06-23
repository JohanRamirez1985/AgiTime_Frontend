import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InformesService } from '../../services/informes.service';
import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RolesContent } from '../../shared/libs/roles';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-informes',
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
  ],
  templateUrl: './informes.html',
  styleUrls: ['./informes.css'],
})
export class Informes {
  form: FormGroup;
  tipoReporte: 'diario' | 'semanal' | 'info' | 'inv' | null = null;
  idEmpresa: string | null = null;
  permitirSeleccion: boolean = true;
  loading: boolean = true;
  btnGenerarReporte: boolean = false;
  usuario: any;
  generate: boolean = false;
  personas: any[] = [];
  cumplioHorario: boolean = false;
  barberoSeleccionado: number = 0;

  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private informeServie: InformesService,
    private sharedService: SharedService
  ) {
    this.form = this.fb.group({
      tipo: [null, Validators.required],
      fecha: [null],
      fechaInicio: [null],
      fechaFin: [null],
    });
  }

  ngOnInit() {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const infoUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    const infoEmpresa = JSON.parse(localStorage.getItem('empresa') || '{}');
    this.usuario = infoUser;
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.validarRol(infoUser);
    this.startBtnValidation();
    this.obtenerUsuarios(id);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private obtenerUsuarios(id: number) {
    this.sharedService.obtenerUsuarios(id).subscribe({
      next: (rest) => {
        let datos = rest.datos;
        let barberos = [];
        for (let i = 0; i < datos.length; i++) {
          if (parseInt(datos[i].rol) === 3 && datos[i].estado === 'Activo') {
            barberos.push(datos[i]);
          }
          this.personas = barberos;
        }
      },
    });
  }

  private startBtnValidation() {
    this.intervalId = setInterval(() => {
      if (this.tipoReporte === 'diario') {
        const tipo = this.form.get('tipo')?.value;
        const fecha = this.form.get('fecha')?.value;
        this.btnGenerarReporte = !!(tipo && fecha);
      } else {
        const tipo = this.form.get('tipo')?.value;
        const fechaIni = this.form.get('fechaInicio')?.value;
        const fechaFin = this.form.get('fechaFin')?.value;
        this.btnGenerarReporte = !!(tipo && fechaIni && fechaFin);
      }
    }, 1000);
  }

  private validarRol(usuario: any) {
    if (usuario.rol === RolesContent.Empleado) {
      this.tipoReporte = 'diario';
      this.form.get('fecha')?.setValue(new Date());
      this.form.get('tipo')?.setValue(this.tipoReporte);
      this.btnGenerarReporte = true;
    }
    this.loading = false;
  }

  onTipoChange(tipo: 'diario' | 'semanal') {
    this.tipoReporte = tipo;
    this.form.patchValue({ fecha: null, fechaInicio: null, fechaFin: null });
  }

  private async createJsonDiario(): Promise<any | null> {
    const fecha = new Date(this.form.value.fecha);
    fecha.setHours(0, 0, 0, 0);

    const fechaString = `${fecha.getFullYear()}-${String(
      fecha.getMonth() + 1
    ).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}T00:00:00`;

    this.generate = true;

    return {
      emp: this.idEmpresa,
      fecha: fechaString,
      ...(this.usuario?.rol === 3 && { usuario: this.usuario.id }),
    };
  }

  

  async generarReporte() {
    if (!this.form.valid) {
      return;
    }

    if (this.tipoReporte === 'diario') {
      this.aFuegoBarberDiario();    
    }

    if (this.tipoReporte === 'semanal' && ) {
      this.aFuegoBarberSemanalEmpleado();    
    }

    // ❌ Usuario canceló el modal
    if (!request) {
      return;
    }

    // 🔄 Ya puedes generar
    Swal.fire({
      title: 'Generando reporte...',
      text: 'Por favor espera unos segundos',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.informeServie.generarInforme(request, tipoDiario, this.tipoReporte).subscribe({
      next: (blob: Blob) => {
        Swal.close();

        if (blob && blob.size > 0) {
          const fileURL = URL.createObjectURL(blob);

          if (blob.size !== 80) {
            window.open(fileURL);
            Swal.fire({
              icon: 'success',
              title: 'Reporte generado',
              text: 'El reporte se ha abierto en una nueva pestaña.',
              confirmButtonColor: '#3085d6',
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Sin datos',
              text: 'No se generó ningún archivo para este rango.',
              confirmButtonColor: '#0d47a1',
            });
          }
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Sin datos',
            text: 'No se generó ningún archivo para este rango.',
            confirmButtonColor: '#0d47a1',
          });
        }
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.mensaje || 'Error inesperado al generar el reporte.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  private async createJsonSemanal(tipoIndividual: boolean): Promise<any | null> {

    // ===== NO DIARIO =====

    const inicio = new Date(this.form.value.fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const inicioString = `${inicio.getFullYear()}-${String(
      inicio.getMonth() + 1
    ).padStart(2, '0')}-${String(inicio.getDate()).padStart(2, '0')}T00:00:00`;

    const fin = new Date(this.form.value.fechaFin);
    fin.setHours(23, 59, 59, 999);
    const finString = `${fin.getFullYear()}-${String(
      fin.getMonth() + 1
    ).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}T23:59:59`;

    // 👉 USUARIO DISTINTO DE 3 → MODAL
    if (this.usuario.rol !== 3 && tipoIndividual) {
      this.generate = false;

      let resp: any;

      if (this.tipoReporte !== 'info') {
        const result = await Swal.fire({
          title: 'Seleccione los barberos que no cumplieron con su horario',
          html: `
        <div style="text-align:left">
          ${this.personas
              .map(
                (p) => `
            <label>
              <input type="checkbox" value="${p.id}" class="personaChk">
              ${p.nombre}
            </label><br>
          `
              )
              .join('')}
        </div>
      `,
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          preConfirm: () => {
            const seleccionados = Array.from(
              document.querySelectorAll('.personaChk:checked')
            ).map((el: any) => el.value);
            return seleccionados;
          },
        });
        resp = result;
        if (!result.isConfirmed || !result.value) {
          return null; // canceló
        }
      }
      this.generate = true;

      return {
        emp: this.idEmpresa,
        fechaInicio: inicioString,
        fechaFin: finString,
        barberos: this.tipoReporte !== 'info' ? resp.value.join(',') : '',
      };
    }

    // 👉 USUARIO 3 → SIN MODAL
    this.generate = true;

    if (!tipoIndividual) {
      const request: any = {
        emp: this.idEmpresa,
        fechaInicio: inicioString,
        fechaFin: finString,
        usuario: this.barberoSeleccionado,
        personal: true
      }

      if (this.tipoReporte !== 'info') {
        request.barberos = this.cumplioHorario ? '' : this.barberoSeleccionado;
      }

      return request

    } else {
      return {
        emp: this.idEmpresa,
        fechaInicio: inicioString,
        fechaFin: finString,
        usuario: this.usuario.id,
      };
    }
  }

  private async aFuegoBarberDiario(){
    let request: any;
    request = await this.createJsonDiario();

    Swal.fire({
      title: 'Generando reporte...',
      text: 'Por favor espera unos segundos',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  private async aFuegoBarberSemanalEmpleado(){
    let request: any;
    request = await this.createJsonSemanal(true);
  }

  private async aFuegoBarberSemanal (){
    let request: any;
    await Swal.fire({
          title: '¿Cómo deseas exportar el reporte?',
          html: `
          <div style="text-align:left">
            <label>
              <input type="radio" name="tipoExport" value="individual" checked>
              Exportar Individual
            </label>
            <br><br>
            <label>
              <input type="radio" name="tipoExport" value="grupal">
              Exportar Grupal
            </label>

            <div id="personasContainer" style="margin-top:15px; display:none;">
              ${this.personas
              .map(
                (p) => `
                  <label>
                    <input type="checkbox" value="${p.id}" class="personaChk">
                    ${p.nombre}
                  </label><br>
                `
              )
              .join('')}
            </div>
          </div>
        `,
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          preConfirm: async () => {
            const tipo = (
              document.querySelector(
                'input[name="tipoExport"]:checked'
              ) as HTMLInputElement
            ).value;

            const tipoIndividual = tipo === 'individual';

            if (tipoIndividual) {
              const result = await Swal.fire({
                title: 'Seleccione un barbero',
                html: `
                <div style="text-align:left">

                  <b>Barbero:</b><br>
                  ${this.personas.map((p) => `
                      <label>
                        <input type="radio" name="barbero" value="${p.id}" class="personaRadio">
                        ${p.nombre}
                      </label><br>
                    `).join('')}

                  ${this.tipoReporte !== 'info' ? `
                      <br><br>
                      <b>¿El barbero cumplió con el horario semanal?</b><br>
                      <label>
                        <input type="radio" name="cumplioHorario" value="true"> Sí
                      </label><br>
                      <label>
                        <input type="radio" name="cumplioHorario" value="false"> No
                      </label>
                    ` : ''
                  }

                </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',

                preConfirm: () => {
                  const barbero = (
                    document.querySelector(
                      'input[name="barbero"]:checked'
                    ) as HTMLInputElement
                  )?.value;

                  const cumplio = (
                    document.querySelector(
                      'input[name="cumplioHorario"]:checked'
                    ) as HTMLInputElement
                  )?.value;

                  this.cumplioHorario = cumplio === 'true';
                  this.barberoSeleccionado = parseInt(barbero);

                  if (!barbero) {
                    Swal.showValidationMessage('Debe seleccionar un barbero');
                    return;
                  }

                  if (this.tipoReporte !== 'info' && cumplio === undefined) {
                    Swal.showValidationMessage('Debe indicar si cumplió el horario');
                    return;
                  }

                  return {
                    barberoId: barbero,
                    cumplioHorario: cumplio === 'true',
                  };
                },
              });
              request = await this.createJsonSemanal(false);
              } else {
              request = await this.createJsonSemanal(true);
            }
          },
        });
  }

  private afuegobarberInventario(){
    if (this.tipoReporte === 'inv') {
      this.reporteInv();
      return
    }
  }
}
