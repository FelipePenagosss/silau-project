import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [],
  templateUrl: './card-product.component.html',
  styleUrl: './card-product.component.css'
})
export class CardProductComponent {
  @Input() url!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() price!: number;
}
