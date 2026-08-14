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
    FormsModule
  ],

  templateUrl: './cliente-dashboard.html',

  styleUrl: './cliente-dashboard.css'
})
export class ClienteDashboard {

  // ==========================================================
  // BUSCADOR DE SEDES
  // ==========================================================

  textoBusquedaSede: string = '';


  // ==========================================================
  // MAPA EN MÓVIL
  // ==========================================================

  mostrarMapaMobile: boolean = false;


  // ==========================================================
  // EMPRESA
  // ==========================================================

  nombreEmpresa: string = '';

  idEmpresa: number = 0;

  img: string = '';



  // ==========================================================
  // RECURSOS / PROFESIONALES
  // ==========================================================

  recursos: any[] = [];

  recursosList: any[] = [];

  imgRecurso: string = 'assets/img/';



  // ==========================================================
  // SEDES
  // ==========================================================

  sedes: any[] = [];

  sedeSeleccionada: string = '';

  sedeSeleccionadaObj: any = null;

  mostrarSede: boolean = false;

  btnRefresh: boolean = false;



  // ==========================================================
  // ESTADOS
  // ==========================================================

  loading: boolean = true;

  inactiva: boolean = false;

  mensajeError: string = '';

  seleccionRubro: boolean = false;



  // ==========================================================
  // GOOGLE MAPS
  // ==========================================================

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



  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(

    private router: Router,

    private sharenServices: SharedService,

    private route: ActivatedRoute,

    private cdr: ChangeDetectorRef

  ) { }



  // ==========================================================
  // INIT
  // ==========================================================

  ngOnInit(): void {

    this.route.queryParams.subscribe((params) => {

      this.idEmpresa =
        +(params['em'] || 0);

    });


    this.obtenerEmpresas();

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



  // ==========================================================
  // OBTENER EMPRESA
  // ==========================================================

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


            // ================================================
            // INFORMACIÓN EMPRESA
            // ================================================

            this.nombreEmpresa =
              empresa?.nombre ?? '';


            this.img =
              empresa?.logo
                ? 'assets/img/' + empresa.logo
                : '';


            this.seleccionRubro =
              empresa?.servicio ?? false;



            // ================================================
            // RUBRO ESPECIAL
            // ================================================

            if (this.seleccionRubro) {

              this.router.navigate(

                ['/cliente/reservar'],

                {
                  queryParams: {
                    emp: this.idEmpresa,
                    rcr: 0
                  }
                }

              );

              return;

            }



            // ================================================
            // OBTENER SEDES
            // ================================================

            this.obtenerSedes();



            // ================================================
            // GUARDAR EMPRESA
            // ================================================

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



  // ==========================================================
  // OBTENER SEDES
  // ==========================================================

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



            // ================================================
            // COORDENADAS
            // ================================================

            this.asignarCoordenadasTemporales();



            // ================================================
            // CONFIGURAR VISUAL
            // ================================================

            // Siempre obligar al cliente a seleccionar una sede
            this.mostrarSede = false;

            // Solo mostrar "Cambiar sede" cuando existen
            // varias sedes
            this.btnRefresh = this.sedes.length > 1;


            // ================================================
            // CONFIGURAR MAPA
            // ================================================

            if (this.sedes.length > 0) {

              this.configurarCentroMapa();

            }



            // ================================================
            // VARIAS SEDES
            // ================================================

            else if (this.sedes.length > 1) {

              this.configurarCentroMapa();

            }



            // ================================================
            // OBTENER PROFESIONALES
            // ================================================

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



  // ==========================================================
  // COORDENADAS TEMPORALES
  // ==========================================================

  /**
   * ============================================================
   * TEMPORAL
   * ============================================================
   *
   * Estas coordenadas serán utilizadas mientras
   * el backend todavía no envíe latitud y longitud.
   *
   * Cuando el backend las envíe, se respetarán.
   */

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


        // ================================================
        // SI BACKEND YA ENVÍA COORDENADAS
        // ================================================

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



        // ================================================
        // COORDENADAS TEMPORALES
        // ================================================

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



  // ==========================================================
  // CONFIGURAR CENTRO DEL MAPA
  // ==========================================================

  private configurarCentroMapa(): void {


    if (!this.sedes.length) {

      return;

    }



    // ========================================================
    // CALCULAR PROMEDIO DE COORDENADAS
    // ========================================================

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



    // ========================================================
    // ZOOM
    // ========================================================

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



  // ==========================================================
  // OBTENER RECURSOS
  // ==========================================================

  private obtenerRecursos(): void {

    this.sharenServices
      .obtenerRecursosAgenda(
        this.idEmpresa
      )
      .subscribe({

        next: (rest) => {


          if (rest.exito) {


            // ================================================
            // FILTRAR PROFESIONALES
            // ================================================

            this.recursos =

              (rest.datos?.usuario || [])

                .filter(

                  (u: any) =>
                    u.recurso === true

                );



            // ================================================
            // ASOCIAR SEDES
            // ================================================

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



  // ==========================================================
  // SELECCIONAR SEDE
  // ==========================================================

  public seleccionarSede(sede: any): void {

    if (!sede) {
      return;
    }

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

    // Cerrar mapa móvil
    this.mostrarMapaMobile = false;

    // Centrar mapa
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



  // ==========================================================
  // CAMBIAR SEDE
  // ==========================================================

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



  // ==========================================================
  // SEDES ASOCIADAS
  // ==========================================================

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



  // ==========================================================
  // RESERVAR
  // ==========================================================

  public irAReservar(
    usuario: any
  ): void {


    if (!usuario) {

      return;

    }



    // ========================================================
    // GUARDAR PROFESIONAL
    // ========================================================

    localStorage.setItem(

      'recurso',

      JSON.stringify(usuario)

    );



    // ========================================================
    // NAVEGAR
    // ========================================================

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



  // ==========================================================
  // HISTORIAL
  // ==========================================================

  public irAHistorial(): void {

    this.router.navigate(
      ['/cliente/historial']
    );

  }

}