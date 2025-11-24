import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../../core/services/ProductService/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-products.component.html',
})
export default class ProductFormComponent {
  private productService = inject(ProductService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  productForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor() {
    this.productForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const productData = {
        name: this.productForm.value.name,
        price: parseFloat(this.productForm.value.price),
        stock: parseInt(this.productForm.value.stock),
      };

      this.productService.create(productData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = '¡Producto creado exitosamente!';
            setTimeout(() => {
              this.router.navigate(['/dashboard/list-products']);
            }, 1500);
          }
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          this.isSubmitting = false;
          if (error.status === 409) {
            this.errorMessage = 'Ya existe un producto con ese nombre';
          } else if (error.status === 401) {
            this.errorMessage = 'Debes iniciar sesión para crear productos';
          } else {
            this.errorMessage =
              error.error?.message || 'Error al crear el producto';
          }
        },
      });
    } else {
      this.markFormGroupTouched(this.productForm);
      this.errorMessage = 'Por favor completa todos los campos correctamente';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/list-products']);
  }
}
