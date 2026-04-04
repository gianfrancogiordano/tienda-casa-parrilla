import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicApiService } from './services/public-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private api: PublicApiService) {}

  getWhatsAppLink(): string {
    const config = this.api.currentConfig;
    if (!config?.telefono) return '';
    const phone = config.telefono.replace(/\D/g, '');
    return `https://wa.me/${phone}`;
  }
}
