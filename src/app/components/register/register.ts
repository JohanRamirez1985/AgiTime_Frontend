import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { TipoDocumento } from '../../interfaces/register.interface'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register {  
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  idDocumento: string = '';
  tipoDocumento: string = '';
  fechaNacimiento: string = '';
  genero: string = '';
  cellphone: string = '';
  idEmpresa: string | null = null;
  tipo: string | null = null;
  tipoDocumentos: TipoDocumento[] = [];
  listaGeneros: TipoDocumento[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sharedService: SharedService 
             ) {}


  ngOnInit(): void {
    this.idEmpresa = this.route.snapshot.queryParamMap.get('em');
    this.tipo = this.route.snapshot.queryParamMap.get('tipo');

    // Validar que solo los clientes puedan registrar
    if (this.tipo !== 'cl') {
      this.router.navigate(['/']); // redirige al inicio
    }

    this.obtenerTipos();
    this.obtenerGeneros();
  }

  private obtenerTipos():void {
    this.sharedService.obtenerTiposDocumentos(Number(this.idEmpresa))
    .subscribe({
      next: res => {
       this.tipoDocumentos = res.datos;
      },
      error: err => {
        
      }
    })
  }

  private obtenerGeneros():void {
    this.sharedService.obtenerGenerosUsuarios(Number(this.idEmpresa))
    .subscribe({
      next: res => {
        this.listaGeneros = res.datos;
      },
      error: err => {

      }
    })
  }

  public registrar():void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.nombre || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // Aquí iría la llamada real al backend (servicio)
    console.log('Enviando registro:', {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    });

    this.successMessage = '¡Registro exitoso!';
    this.nombre = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }
}
