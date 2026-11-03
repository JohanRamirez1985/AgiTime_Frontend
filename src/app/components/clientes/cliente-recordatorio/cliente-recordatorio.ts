import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { ClienteRegistro } from '../../../interfaces/shared.interface';
import { SharedService } from '../../../services/shared.service';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClienteService } from '../../../services/cliente.service';
import { Table } from '../../transversales/table/table';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-cliente-recordatorio',
  imports: [CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatTooltipModule,
    Table
  ],
  templateUrl: './cliente-recordatorio.html',
  styleUrl: './cliente-recordatorio.css'
})
export class ClienteRecordatorio {
  filtro = '';
  dias: number | null = 15;
  tipo: number = 1;
  btnConsultar = false;
  rolSeleccionado = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  isMobileView = false;
  clienteRecordatorio: ClienteRegistro[] = [];
  clienteRecordatorioFiltrados: ClienteRegistro[] = [];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  private intervalId: any;
  mensajeWssp: string = '';

  columnas = [
    { key: 'nombre', label: 'Nombre' }
  ];

  idEmpresa: number = 0;
  user: any;
  acciones: any[] = [
    {
      icon: 'whatsapp',
      label: 'Envio Mensaje',
      action: (element: any) => this.envioMensaje(element)
    },
  ];

  constructor(
    private clienteServie: ClienteService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private sharedServices: SharedService
  ) {
    this.matIconRegistry.addSvgIcon(
      'whatsapp',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/img/whatsapp.svg'
      )
    );
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('usuario') || '');
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const id = info?.idEmpresa;
    this.idEmpresa = id;
    this.checkResponsive();
    window.addEventListener('resize', () => this.checkResponsive());
    this.obtenerMensajesWssp();
    this.consultarClientes();
    this.startBtnValidation();
  }

  private obtenerMensajesWssp(): void {
    this.sharedServices.mensajesWhatsApp(this.idEmpresa.toString()).subscribe({
      next: (rest) => {
        if (rest.exito) {
          this.mensajeWssp = rest.datos.find((h: any) => h.tipo === 'WhatsappClienteRecordatorio').mensaje;
        }
      },
    });
  }

  obtenerColumnas() {
  this.columnas = [
    { key: 'nombre', label: 'Nombre' },
    ...(this.tipo === 1
      ? [{ key: 'ultimaFechaAsistio', label: 'Fecha última visita' }]
      : [{ key: 'fechaCreacion', label: 'Fecha creado en la app' }])
  ];
}

  checkResponsive(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  envioMensaje(recurso: any) {
    let mensaje = this.mensajeWssp || '';

    mensaje = mensaje
      .replace(/\$\{nombreCliente\}/g, String(recurso.nombre))
      .replace(/\$\{dias\}/g, String(this.dias))
      .replace(/\\r\\n/g, '\n')
      .replace(/\\https:/g, 'https:')
      .trim();

    const numero = '57' + recurso.telefono;
    const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esMovil) {
      window.location.href =
        `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    } else {
      window.open(
        `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`,
        '_blank'
      );
    }
    this.loading = true;
    this.consultarClientes();
  }

  private startBtnValidation() {
    this.intervalId = setInterval(() => {
      this.btnConsultar = !(this.dias);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  validarDias(): void {
    this.btnConsultar =
      this.dias === null ||
      !Number.isInteger(Number(this.dias)) ||
      Number(this.dias) < 1;
  }

  public consultar(): void {
    this.consultarClientes();
  }

  public consultarClientes(): void {
    const info = JSON.parse(localStorage.getItem('infoEmp') || '{}');
    const idEmpresa = info?.idEmpresa;

    if (!idEmpresa) {
      console.warn('No se encontró ID de empresa en el localStorage');
      return;
    }
    this.obtenerColumnas();
    this.loading = true;

    this.clienteServie.obtenerClienteRecordatorio(idEmpresa, Number(this.dias), Number(this.tipo)).subscribe({
      next: res => {
        this.clienteRecordatorio = [];
        this.clienteRecordatorioFiltrados = [];
        this.dataSource.data = [];
        if (res.exito && res.datos) {
          this.clienteRecordatorio = res.datos;
          this.clienteRecordatorioFiltrados = this.clienteRecordatorio;
          this.dataSource.data = res.datos;
        }

        this.loading = false;
      },
      error: err => {
        this.clienteRecordatorio = [];
        this.clienteRecordatorioFiltrados = [];
        this.dataSource.data = [];

        this.loading = false;
        console.error('Error al obtener cliente:', err);
      }
    });
  }

  filtrarCliente(valor: string) {
    console.log('Buscando:', valor);
    const filtroLower = valor.toLowerCase().trim();
    this.clienteRecordatorioFiltrados = this.clienteRecordatorio.filter(user =>
      user.nombre.toLowerCase().includes(filtroLower)
    );
  }
}
