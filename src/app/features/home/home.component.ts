import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CardProductComponent } from '../../shared/card-product/card-product.component';
import { SliderComponent } from '../../shared/slider/slider.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, CardProductComponent, RouterLink,SliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent {
  
}