import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { SliderComponent } from "./shared/slider/slider.component";
import { FooterComponent } from './shared/footer/footer.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SliderComponent,
    CommonModule,
    FooterComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SILAU-Project';

  showSlider: boolean = true;
  showHeader: boolean = true;
  showFooter: boolean = true;


  constructor(private router: Router) {
    this.router.events.subscribe((val: any) => {
      if (val.url) {
        this.showSlider = val.url === '/' || val.url === '/enterprise' || val.url === '/events' || val.url === '/products' || val.url === '/contact';
        this.showHeader = val.url === '/' || val.url === '/enterprise' || val.url === '/events' || val.url === '/products' || val.url === '/contact' || val.url === '/login';
        this.showFooter = val.url === '/' || val.url === '/enterprise' || val.url === '/events' || val.url === '/products' || val.url === '/contact' || val.url === '/login';
      }
    });
  }
}
