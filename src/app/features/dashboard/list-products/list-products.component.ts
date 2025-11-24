import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../core/services/ProductService/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.css'],
})
export default class ProductListComponent implements OnInit {
  @ViewChild('editModal') editModal!: ElementRef;
  @ViewChild('editModalContainer') editModalContainer!: ElementRef;

  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  public errorMessage: string = '';
  public successMessage: string = '';

  selectedProduct: Product | null = null;
  editForm!: FormGroup;

  products: Product[] = [];

  // Paginación
  currentPage: number = 1;
  totalPages: number = 1;
  totalProducts: number = 0;
  limit: number = 10;

  // Filtros
  searchTerm: string = '';

  ngOnInit() {
    this.initForm();
    this.loadProducts();
  }

  loadProducts() {
    this.productService
      .list({
        page: this.currentPage,
        limit: this.limit,
        search: this.searchTerm,
      })
      .subscribe({
        next: (response) => {
          if (
            response.success &&
            response.data &&
            Array.isArray(response.data)
          ) {
            this.products = response.data;
            if (response.pagination) {
              this.totalPages = response.pagination.totalPages;
              this.totalProducts = response.pagination.total;
            }
          }
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.errorMessage = 'No se pudo cargar la lista de productos';
        },
      });
  }

  private initForm() {
    this.editForm = this.fb.group({
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

  openEditModal(product: Product) {
    this.selectedProduct = product;
    this.editModalContainer.nativeElement.style.opacity = '1';
    this.editModalContainer.nativeElement.style.visibility = 'visible';
    this.editModal.nativeElement.classList.remove('modal-close');

    this.editForm.patchValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
  }

  closeModal() {
    this.editModal.nativeElement.classList.add('modal-close');
    setTimeout(() => {
      this.editModalContainer.nativeElement.style.opacity = '0';
      this.editModalContainer.nativeElement.style.visibility = 'hidden';
      this.selectedProduct = null;
      this.editForm.reset();
    }, 500);
  }

  onSubmit() {
    if (this.editForm.valid && this.selectedProduct?.id) {
      const updatedProduct: Partial<Product> = this.editForm.value;

      this.productService
        .update(this.selectedProduct.id, updatedProduct)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = 'Producto actualizado correctamente';
              this.loadProducts();
              this.closeModal();
              setTimeout(() => (this.successMessage = ''), 3000);
            }
          },
          error: (error) => {
            console.error('Error al actualizar producto:', error);
            this.errorMessage =
              error.error?.message || 'Error al actualizar el producto';
            setTimeout(() => (this.errorMessage = ''), 3000);
          },
        });
    }
  }

  deleteProduct(id: number) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Producto eliminado correctamente';
            this.loadProducts();
            setTimeout(() => (this.successMessage = ''), 3000);
          }
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          this.errorMessage =
            error.error?.message || 'Error al eliminar el producto';
          setTimeout(() => (this.errorMessage = ''), 3000);
        },
      });
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.currentPage = 1;
    this.loadProducts();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  incrementStock(product: Product) {
    if (product.id) {
              this.productService.updateStock(product.id!, 1).subscribe({
          next: (response: any) => {
            if (response.success) {
              product.stock += 1;
            }
          },
          error: (error: any) => {
            console.error('Error updating stock:', error);
          }
        });
    }
  }

  decrementStock(product: Product) {
    if (product.id && product.stock > 0) {
        this.productService.updateStock(product.id!, -1).subscribe({
          next: (response: any) => {
            if (response.success) {
              product.stock -= 1;
            }
          },
          error: (error: any) => {
            console.error('Error updating stock:', error);
          }
        });
    }
  }
}