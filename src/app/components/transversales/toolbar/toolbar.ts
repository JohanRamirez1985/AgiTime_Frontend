import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css'
})
export class Toolbar {
  
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private router: Router) {}

  cerrarSesion() {
    const infoEmpStr = localStorage.getItem('infoEmp');
    localStorage.clear();
    const idEmpresa = infoEmpStr ? JSON.parse(infoEmpStr).idEmpresa : null;
    const currentUrl = this.router.url === 'cliente' ? 'cl' : 'em';
    this.router.navigate(['/login'], {
      queryParams: { em: idEmpresa, tipo: currentUrl }
    });
  }
}
