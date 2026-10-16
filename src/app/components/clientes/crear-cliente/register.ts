import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { ClienteRegistro, ClienteRegistroResponse, TipoDocumento } from '../../../interfaces/shared.interface'
import { obtenerGeneros, obtenerTiposDocumentos } from '../../../shared/libs/request-generales';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { ClienteService } from '../../../services/cliente.service';
import Swal from 'sweetalert2';
import { Modal } from '../../../shared/services/modal';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register {
  nombre = '';
  email = '';
  errorMessage = '';
  successMessage = '';
  fechaNacimiento: Date | null = null;
  cellphone: string = '';
  idEmpresa: number = 0
  uniqueId = Math.floor(Math.random() * 100000);
  btnRegistrar: boolean = false;
  mensajeWsspEmpresa: string = '';

  constructor(private route: ActivatedRoute,
    private router: Router,
    private clientService: ClienteService,
    private modalService: Modal,
    private sharedServices: SharedService
  ) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.idEmpresa = +params['em'];
    });
    this.obtenerMensajesCliente();
  }

  private obtenerMensajesCliente(): void {
    this.sharedServices.mensajesWhatsApp(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.mensajeWsspEmpresa = rest.datos.find((h: any) => h.tipo === 'WhatsappCreacionCliente').mensaje;
        }
      },
    });
  }

  public registrar(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.btnRegistrar = true;

    const request = this.createJson();

    this.clientService.crearCliente(request)
      .subscribe({
        next: (rest: ClienteRegistroResponse) => {
          if (rest.exito) {
            this.modalService.success(
              rest.mensaje || '¡Cliente registrado exitosamente!',
              () => {
                this.mensajeWssp(request.telefono);
                this.router.navigate(['/login'], {
                  queryParams: { em: this.idEmpresa, tipo: 'em' }
                });
              }
            );
          } else {
            this.modalService.error(rest.mensaje);
          }
          this.btnRegistrar = false;
        },
        error: err => {
          this.btnRegistrar = false;
          this.modalService.error(err.error.mensaje);
        }
      })
  }

  private mensajeWssp(telefono: string): void {

    let mensaje = this.mensajeWsspEmpresa || '';

    mensaje = (this.mensajeWsspEmpresa || '')
      .replace(/\\n/g, '\n')
      .replace(/\\u200D/g, '\u200D')
      .replace(/^[ \t]+/gm, '')
      .trim();


    const numero = '57' + telefono;
    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esMovil) {
      window.location.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    } else {
      window.open(
        `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`,
        '_blank'
      );
    }
  }

  private createJson(): ClienteRegistro {

    const now = new Date();
    const fechaLocal =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      'T' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0');

    const json: ClienteRegistro = {
      nombre: this.nombre,
      correo: this.email,
      fechaNacimiento: this.fechaNacimiento
        ? this.formatearFecha(this.fechaNacimiento)
        : '',
      telefono: this.cellphone,
      empresa: Number(this.idEmpresa),
      FechaCreacion: fechaLocal
    };

    return json;
  }

  private formatearFecha(fecha: Date): string {

    const year = fecha.getFullYear();

    const month = String(fecha.getMonth() + 1).padStart(2, '0');

    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
