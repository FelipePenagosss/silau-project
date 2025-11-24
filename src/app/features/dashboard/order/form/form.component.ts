import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../../core/services/CustomerService/customer.service';
import {
  ProductService,
  Product,
} from '../../../../core/services/ProductService/product.service';
import { OrderService } from '../../../../core/services/OrderService/order.service';
import { Customer } from '../../../../core/models/customer.model';
import { CreateOrderDTO } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export default class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  orderForm!: FormGroup;
  customers: Customer[] = [];
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
    this.loadProducts();
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      customer_id: ['', Validators.required],
      items: this.fb.array([]),
      notes: [''],
      discount: [0, [Validators.min(0)]],
      tax: [0, [Validators.min(0)]],
    });
  }

  loadCustomers(): void {
    this.customerService.list({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.customers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.errorMessage = 'Error al cargar clientes';
      },
    });
  }

  loadProducts(): void {
    this.productService.list({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.products = response.data;
          console.log('Productos cargados:', this.products); // Debug
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Error al cargar productos';
      },
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addProduct(): void {
    const item = this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [{ value: 0, disabled: true }],
      subtotal: [{ value: 0, disabled: true }],
    });

    this.items.push(item);

    // Subscribe DESPUÉS de agregar al array
    const currentIndex = this.items.length - 1;

    item.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateItemTotal(currentIndex);
    });

    item.get('product_id')?.valueChanges.subscribe((productId) => {
      if (productId) {
        this.onProductSelect(Number(productId), currentIndex);
      }
    });
  }

  removeProduct(index: number): void {
    this.items.removeAt(index);
  }

  onProductSelect(productId: number, index: number): void {
    console.log('Producto seleccionado ID:', productId, 'Índice:', index); // Debug
    const product = this.products.find((p) => p.id === Number(productId));
    console.log('Producto encontrado:', product); // Debug

    if (product && this.items.at(index)) {
      const item = this.items.at(index);
      item.patchValue({
        unit_price: product.price,
      });
      this.calculateItemTotal(index);
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unit_price')?.value || 0;
    const subtotal = quantity * unitPrice;

    item.patchValue({ subtotal }, { emitEvent: false });
  }

  getOrderSubtotal(): number {
    return this.items.controls.reduce((sum, item) => {
      return sum + (item.get('subtotal')?.value || 0);
    }, 0);
  }

  getOrderTotal(): number {
    const subtotal = this.getOrderSubtotal();
    const discount = this.orderForm.get('discount')?.value || 0;
    const tax = this.orderForm.get('tax')?.value || 0;
    return subtotal - discount + tax;
  }

  getCustomerName(customerId: number): string {
    const customer = this.customers.find((c) => c.id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name}` : '';
  }

  getProductName(productId: number): string {
    const product = this.products.find((p) => p.id === Number(productId));
    return product ? product.name : '';
  }

  getProductStock(productId: number): number {
    const product = this.products.find((p) => p.id === Number(productId));
    console.log(
      'Buscando stock para producto ID:',
      productId,
      'Encontrado:',
      product
    ); // Debug
    return product ? product.stock : 0;
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched(this.orderForm);
      this.errorMessage = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (this.items.length === 0) {
      this.errorMessage = 'Debe agregar al menos un producto';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.orderForm.getRawValue();

    const orderData: CreateOrderDTO = {
      customer_id: Number(formValue.customer_id),
      items: formValue.items.map((item: any) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
      notes: formValue.notes || undefined,
      discount: Number(formValue.discount) || 0,
      tax: Number(formValue.tax) || 0,
    };

    console.log('Datos del pedido a enviar:', orderData); // Debug

    this.orderService.create(orderData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Pedido creado exitosamente';
          setTimeout(() => {
            this.router.navigate(['/dashboard/orders']);
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al crear el pedido';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating order:', error);
        this.errorMessage = error.error?.message || 'Error al crear el pedido';
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
      control.markAsTouched();
    });
  }
}
