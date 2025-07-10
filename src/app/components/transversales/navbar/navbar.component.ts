import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import {CommonModule, Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
    private listTitles: any[] = [];
    location: Location;
      mobile_menu_visible: any = 0;
    private toggleButton: any;
    private sidebarVisible: boolean;

    constructor(location: Location,  private element: ElementRef, private router: Router) {
      this.location = location;
          this.sidebarVisible = false;
    }

    ngOnInit(){
      this.listTitles = ROUTES.filter(listTitle => listTitle);
      const navbar: HTMLElement = this.element.nativeElement;
      this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
      this.router.events.subscribe((event) => {
        this.sidebarClose();
         var $layer: any = document.getElementsByClassName('close-layer')[0];
         if ($layer) {
           $layer.remove();
           this.mobile_menu_visible = 0;
         }
     });
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);

        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };
  sidebarToggle() {
  const $toggle = document.getElementsByClassName('navbar-toggler')[0] as HTMLElement;
  const body = document.body;
  let $layer = document.querySelector('.close-layer') as HTMLElement | null;

  if (this.sidebarVisible === false) {
    this.sidebarOpen();
  } else {
    this.sidebarClose();
  }

  if (this.mobile_menu_visible === 1) {
    body.classList.remove('nav-open');
    if ($layer) {
      $layer.remove();
    }
    setTimeout(() => {
      $toggle.classList.remove('toggled');
    }, 400);
    this.mobile_menu_visible = 0;
  } else {
    setTimeout(() => {
      $toggle.classList.add('toggled');
    }, 430);

    $layer = document.createElement('div');
    $layer.classList.add('close-layer');

    const mainPanel = document.querySelector('.main-panel');
    const fullPage = document.querySelector('.wrapper-full-page');

    if (mainPanel) {
      mainPanel.appendChild($layer);
    } else if (body.classList.contains('off-canvas-sidebar') && fullPage) {
      fullPage.appendChild($layer);
    }

    setTimeout(() => {
      $layer!.classList.add('visible');
    }, 100);

    $layer.onclick = () => {
      body.classList.remove('nav-open');
      this.mobile_menu_visible = 0;
      $layer!.classList.remove('visible');
      setTimeout(() => {
        $layer!.remove();
        $toggle.classList.remove('toggled');
      }, 400);
    };

    body.classList.add('nav-open');
    this.mobile_menu_visible = 1;
  }
}


    getTitle(){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }

      for(var item = 0; item < this.listTitles.length; item++){
          if(this.listTitles[item].path === titlee){
              return this.listTitles[item].title;
          }
      }
      return 'Dashboard';
    }
}
