import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CustomerService } from '../../../core/services/CustomerService/customer.service';
import {
  Customer,
  CustomerCreateDTO,
} from '../../../core/models/customer.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule], // ← AGREGAR FormsModule
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export default class CustomersComponent implements OnInit {
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);

  public customerList: Customer[] = [];
  public customerListFilter: Customer[] = [];
  public errorMessage: string = '';
  public successMessage: string = '';
  public searchTerm: string = '';

  // Paginación
  currentPage: number = 1;
  totalPages: number = 1;
  totalCustomers: number = 0;
  limit: number = 10;

  public numberList: number[] = [5, 10, 15, 20, 25, 30];

  @ViewChild('modal') modal!: ElementRef;
  @ViewChild('modal_container') modal_container!: ElementRef;

  customerForm!: FormGroup;
  isEditMode: boolean = false;
  selectedCustomerId: number | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
  }

  private initForm() {
    this.customerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      phone: [''],
      document_type: [''],
      document_number: [''],
    });
  }

  loadCustomers() {
    this.customerService
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
            this.customerList = response.data;
            this.customerListFilter = response.data;
            if (response.pagination) {
              this.totalPages = response.pagination.totalPages;
              this.totalCustomers = response.pagination.total;
            }
          }
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
          this.errorMessage = 'No se pudo cargar la lista de clientes';
        },
      });
  }

  filterByLimit(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.limit = parseInt(selectElement.value, 10);
    this.currentPage = 1;
    this.loadCustomers();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadCustomers();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCustomers();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCustomers();
    }
  }

  openModal(customer?: Customer) {
    this.isEditMode = !!customer;
    this.selectedCustomerId = customer?.id || null;

    if (customer) {
      this.customerForm.patchValue({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        document_type: customer.document_type,
        document_number: customer.document_number,
      });
    } else {
      this.customerForm.reset();
    }

    this.modal_container.nativeElement.style.opacity = '1';
    this.modal_container.nativeElement.style.visibility = 'visible';
    this.modal.nativeElement.classList.remove('modal-close');
  }

  closeModal() {
    this.modal.nativeElement.classList.add('modal-close');
    setTimeout(() => {
      this.modal_container.nativeElement.style.opacity = '0';
      this.modal_container.nativeElement.style.visibility = 'hidden';
      this.customerForm.reset();
      this.isEditMode = false;
      this.selectedCustomerId = null;
    }, 500);
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const customerData: CustomerCreateDTO = {
        first_name: this.customerForm.value.first_name,
        last_name: this.customerForm.value.last_name,
        email: this.customerForm.value.email || undefined,
        phone: this.customerForm.value.phone || undefined,
        document_type: this.customerForm.value.document_type || undefined,
        document_number: this.customerForm.value.document_number || undefined,
      };

      if (this.isEditMode && this.selectedCustomerId) {
        // Actualizar
        this.customerService
          .update(this.selectedCustomerId, customerData)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.successMessage = 'Cliente actualizado correctamente';
                this.loadCustomers();
                this.closeModal();
                setTimeout(() => (this.successMessage = ''), 3000);
              }
            },
            error: (error) => {
              console.error('Error al actualizar cliente:', error);
              this.errorMessage =
                error.error?.message || 'Error al actualizar el cliente';
              setTimeout(() => (this.errorMessage = ''), 3000);
            },
          });
      } else {
        // Crear
        this.customerService.create(customerData).subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = 'Cliente creado correctamente';
              this.loadCustomers();
              this.closeModal();
              setTimeout(() => (this.successMessage = ''), 3000);
            }
          },
          error: (error) => {
            console.error('Error al crear cliente:', error);
            this.errorMessage =
              error.error?.message || 'Error al crear el cliente';
            setTimeout(() => (this.errorMessage = ''), 3000);
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.customerForm);
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      setTimeout(() => (this.errorMessage = ''), 3000);
    }
  }

  deleteCustomer(id: number) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.customerService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Cliente eliminado correctamente';
            this.loadCustomers();
            setTimeout(() => (this.successMessage = ''), 3000);
          }
        },
        error: (error) => {
          console.error('Error al eliminar cliente:', error);
          this.errorMessage =
            error.error?.message || 'Error al eliminar el cliente';
          setTimeout(() => (this.errorMessage = ''), 3000);
        },
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}