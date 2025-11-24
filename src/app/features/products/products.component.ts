import { Component } from '@angular/core';
import { CardProductComponent } from '../../shared/card-product/card-product.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CardProductComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export default class ProductsComponent {

}
