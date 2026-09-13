import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GoogleMapsModule } from '@angular/google-maps';

import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { SharedService } from '../../../services/shared.service';
import { FormsModule } from '@angular/forms';
import { ValidarVersion } from '../../../shared/validar-version/validar-version';


@Component({
  selector: 'app-cliente-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    GoogleMapsModule,
    FormsModule,
    ValidarVersion
  ],

  templateUrl: './cliente-dashboard.html',

  styleUrl: './cliente-dashboard.css'
})
export class ClienteDashboard {

  textoBusquedaSede: string = '';
  mostrarMapaMobile: boolean = false;
  nombreEmpresa: string = '';
  idEmpresa: number = 0;
  img: string = '';
  recursos: any[] = [];
  recursosList: any[] = [];
  imgRecurso: string = 'assets/img/';
  sedes: any[] = [];
  sedeSeleccionada: string = '';
  sedeSeleccionadaObj: any = null;
  mostrarSede: boolean = false;
  btnRefresh: boolean = false;
  loading: boolean = true;
  inactiva: boolean = false;
  mensajeError: string = '';
  seleccionRubro: boolean = false;
  center: google.maps.LatLngLiteral = {
    lat: 2.4419,
    lng: -76.6063
  };
  zoom: number = 13;
  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    mapTypeId: 'roadmap'
  };
  currentYear: number = new Date().getFullYear();
  verProfesionales: boolean = false;

  constructor(
    private router: Router,
    private sharenServices: SharedService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {

    // this.route.queryParams.subscribe((params) => {
    //   this.idEmpresa =
    //     +(params['em'] || 0);
    // });

    // this.validarProfesionalesORecursos();
    // this.obtenerEmpresas();
  }

  private validarProfesionalesORecursos(): void {
    if(this.idEmpresa === 8 || this.idEmpresa === 12) {
      this.verProfesionales = true;
    }
  }

  get sedesFiltradas(): any[] {

    const texto = this.textoBusquedaSede
      ?.trim()
      .toLowerCase();

    if (!texto) {
      return this.sedes;
    }

    return this.sedes.filter((sede: any) => {

      const nombre =
        sede.nombre?.toLowerCase() || '';

      const direccion =
        sede.direccion?.toLowerCase() || '';

      const ciudad =
        sede.ciudad?.toLowerCase() || '';

      return (
        nombre.includes(texto) ||
        direccion.includes(texto) ||
        ciudad.includes(texto)
      );

    });

  }

  buscarSede(): void {
    this.cdr.detectChanges();
  }

  public toggleMapaMobile(): void {

    this.mostrarMapaMobile =
      !this.mostrarMapaMobile;

    this.cdr.detectChanges();

  }



  // ==========================================================
  // MIS CITAS
  // ==========================================================

  public misCitas(): void {

    this.router.navigate(

      ['/cliente/misCitas'],

      {
        queryParams: {
          emp: this.idEmpresa
        }
      }

    );

  }



  // ==========================================================
  // LOGIN
  // ==========================================================

  public irALogin(): void {

    this.router.navigate(

      ['/login'],

      {
        queryParams: {
          em: this.idEmpresa,
          tipo: 'em'
        }
      }

    );

  }

  private obtenerEmpresas(): void {

    this.sharenServices
      .obtenerEmpresasApp()
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            const empresa: any =
              rest.datos.find(
                (em: any) =>
                  em.id === this.idEmpresa
              );

            this.nombreEmpresa =
              empresa?.nombre ?? '';

            this.img =
              empresa?.logo
                ? 'assets/img/' + empresa.logo
                : '';

            this.seleccionRubro =
              empresa?.servicio ?? false;

            this.obtenerSedes();

            localStorage.setItem(
              'empresa',
              JSON.stringify(empresa)
            );
          }

          else {
            this.inactiva = true;
            this.loading = false;
            this.mensajeError =
              rest.mensaje ||
              'La empresa no se encuentra disponible.';
          }
        },


        error: (error) => {
          console.error(
            'Error obteniendo empresa:',
            error
          );

          this.inactiva = true;
          this.loading = false;
          this.mensajeError =
            'No fue posible obtener la información de la empresa.';
        }

      });

  }

  private obtenerSedes(): void {

    this.sharenServices
      .obtenerSedesUsuarios(
        this.idEmpresa.toString()
      )
      .subscribe({

        next: (rest: any) => {


          if (rest.exito) {
            this.sedes =
              rest.datos || [];

            this.asignarCoordenadasTemporales();
            this.mostrarSede = false;
            this.btnRefresh = this.sedes.length > 1;

            if (this.sedes.length > 0) {
              this.configurarCentroMapa();
            }
            else if (this.sedes.length > 1) {
              this.configurarCentroMapa();
            }
            this.obtenerRecursos();
            this.loading = false;
            this.cdr.detectChanges();
          }

          else {
            this.inactiva = true;
            this.loading = false;
            this.mensajeError =
              rest.mensaje ||
              'No fue posible obtener las sedes.';
          }
        },


        error: (error) => {
          console.error(
            'Error obteniendo sedes:',
            error
          );

          this.inactiva = true;
          this.loading = false;
          this.mensajeError =
            'No fue posible cargar las sedes.';
        }
      });

  }

  private asignarCoordenadasTemporales(): void {

    const coordenadas = [
      {
        latitud: 2.4419,
        longitud: -76.6063
      },

      {
        latitud: 2.4488,
        longitud: -76.6005
      },

      {
        latitud: 2.4551,
        longitud: -76.5972
      },

      {
        latitud: 2.4350,
        longitud: -76.6150
      },

      {
        latitud: 2.4620,
        longitud: -76.5900
      }

    ];

    this.sedes.forEach(
      (sede: any, index: number) => {

        if (
          sede.latitud !== null &&
          sede.latitud !== undefined &&
          sede.longitud !== null &&
          sede.longitud !== undefined
        ) {
          sede.latitud =
            Number(sede.latitud);
          sede.longitud =
            Number(sede.longitud);
          return;
        }

        const posicion =
          coordenadas[
          index % coordenadas.length
          ];
        sede.latitud =
          posicion.latitud;
        sede.longitud =
          posicion.longitud;
      }
    );
  }

  private configurarCentroMapa(): void {
    if (!this.sedes.length) {
      return;
    }

    const sedesValidas =
      this.sedes.filter(
        (sede: any) =>
          sede.latitud !== null &&
          sede.latitud !== undefined &&
          sede.longitud !== null &&
          sede.longitud !== undefined
      );

    if (!sedesValidas.length) {
      return;
    }



    const latitudPromedio =
      sedesValidas.reduce(
        (total: number, sede: any) =>
          total + Number(sede.latitud),
        0
      ) / sedesValidas.length;

    const longitudPromedio =
      sedesValidas.reduce(
        (total: number, sede: any) =>
          total + Number(sede.longitud),
        0
      ) / sedesValidas.length;

    this.center = {
      lat: latitudPromedio,
      lng: longitudPromedio
    };

    if (sedesValidas.length === 1) {
      this.zoom = 17;
    }

    else if (sedesValidas.length <= 3) {
      this.zoom = 13;
    }

    else {
      this.zoom = 12;
    }
  }

  private obtenerRecursos(): void {

    this.sharenServices
      .obtenerRecursosAgenda(
        this.idEmpresa
      )
      .subscribe({
        next: (rest) => {
          if (rest.exito) {
            this.recursos =
              (rest.datos?.usuario || [])
                .filter(
                  (u: any) =>
                    u.recurso === true
                );

            this.encontrarSedesAsociadas();
            this.cdr.detectChanges();
          }
          else {
            this.inactiva = true;
            this.mensajeError =
              rest.mensaje ||
              'No fue posible obtener los recursos.';
          }
        },
        error: (error) => {
          console.error(
            'Error obteniendo recursos:',
            error
          );

          this.inactiva = true;
          this.mensajeError =
            'No fue posible cargar los profesionales.';
        }
      });
  }

  public seleccionarSede(sede: any): void {
    if (!sede) {
      return;
    }

    localStorage.setItem('sedeSeleccionada', JSON.stringify(sede));

    if (this.idEmpresa === 8 || this.idEmpresa === 12) {
      this.router.navigate(
        ['/cliente/reservar'],
        {
          queryParams: {
            emp: this.idEmpresa,
            rcr: 0
          }
        }
      );
    } else {
      this.sedeSeleccionada =
        sede.nombre;

      this.sedeSeleccionadaObj =
        sede;

      this.recursosList =
        this.recursos.filter(
          (r: any) =>
            r.sede === sede.id
        );

      this.mostrarSede = true;
      this.btnRefresh = true;
      this.mostrarMapaMobile = false;

      if (
        sede.latitud != null &&
        sede.longitud != null
      ) {
        this.center = {
          lat: Number(sede.latitud),
          lng: Number(sede.longitud)
        };
        this.zoom = 17;
      }
      this.cdr.detectChanges();
    }
  }

  public cambiarSede(): void {
    this.mostrarSede = false;
    this.btnRefresh = true;
    this.sedeSeleccionada = '';
    this.sedeSeleccionadaObj = null;
    this.recursosList = [];
    this.mostrarMapaMobile = false;
    this.configurarCentroMapa();
    this.cdr.detectChanges();
  }

  private encontrarSedesAsociadas(): void {
    for (
      let i = 0;
      i < this.recursos.length;
      i++
    ) {
      const sede =
        this.sedes.find(
          (sede: any) =>
            sede.id ===
            this.recursos[i].sede
        );

      this.recursos[i].nombreSede =
        sede

          ? 'Sede - ' + sede.nombre

          : '';
    }

  }

  public irAReservar(
    usuario: any
  ): void {


    if (!usuario) {

      return;

    }

    localStorage.setItem(
      'recurso',
      JSON.stringify(usuario)
    );

    this.router.navigate(
      ['/cliente/reservar'],
      {
        queryParams: {
          emp: this.idEmpresa,
          rcr: usuario.id
        }
      }
    );
  }

  public irAHistorial(): void {
    this.router.navigate(
      ['/cliente/historial']
    );
  }
}