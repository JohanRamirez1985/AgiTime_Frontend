import { Component } from '@angular/core';

@Component({
  selector: 'app-modal-actualizando',
  standalone: true,
  imports: [],
  templateUrl: './modal-actualizando.html',
  styleUrl: './modal-actualizando.css'
})
export class ModalActualizando {


  ngOnInit(): void {
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

}
