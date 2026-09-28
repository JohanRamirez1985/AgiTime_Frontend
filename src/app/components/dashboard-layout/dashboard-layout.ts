import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Toolbar } from '../transversales/toolbar/toolbar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, Toolbar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  currentYear: number = new Date().getFullYear();

  toggleSidebar() {
    this.sidenav.toggle();
  }
}
