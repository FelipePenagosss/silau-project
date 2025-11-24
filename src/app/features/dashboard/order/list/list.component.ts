import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../../../core/services/OrderService/order.service';
import { CustomerService } from '../../../../core/services/CustomerService/customer.service';
import { Order } from '../../../../core/models/order.model';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export default class OrderListComponent implements OnInit {
  @ViewChild('detailModal') detailModal!: ElementRef;
  @ViewChild('detailModalContainer') detailModalContainer!: ElementRef;
  @ViewChild('statusModal') statusModal!: ElementRef;
  @ViewChild('statusModalContainer') statusModalContainer!: ElementRef;

  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);

  orders: Order[] = [];
  customers: Customer[] = [];
  selectedOrder: Order | null = null;
  statusForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  // Paginación
  currentPage: number = 1;
  totalPages: number = 1;
  totalOrders: number = 0;
  limit: number = 10;

  // Filtros
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedCustomerId: string = '';

  // Estados disponibles
  statuses = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'En proceso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  ngOnInit() {
    this.initForm();
    this.loadOrders();
    this.loadCustomers();
  }

  private initForm() {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
    });
  }

  loadCustomers() {
    this.customerService.list({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.customers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      },
    });
  }

  loadOrders() {
    const query: any = {
      page: this.currentPage,
      limit: this.limit,
    };

    if (this.searchTerm) query.search = this.searchTerm;
    if (this.selectedStatus) query.status = this.selectedStatus;
    if (this.selectedCustomerId)
      query.customer_id = Number(this.selectedCustomerId);

    this.orderService.list(query).subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.orders = response.data;
          if (response.pagination) {
            this.totalPages = response.pagination.totalPages;
            this.totalOrders = response.pagination.total;
          }
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'No se pudo cargar la lista de pedidos';
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.currentPage = 1;
    this.loadOrders();
  }

  onStatusFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
    this.currentPage = 1;
    this.loadOrders();
  }

  onCustomerFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCustomerId = target.value;
    this.currentPage = 1;
    this.loadOrders();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  // Ver detalle del pedido
  openDetailModal(order: Order) {
    this.selectedOrder = order;
    this.detailModalContainer.nativeElement.style.opacity = '1';
    this.detailModalContainer.nativeElement.style.visibility = 'visible';
    this.detailModal.nativeElement.classList.remove('modal-close');
  }

  closeDetailModal() {
    this.detailModal.nativeElement.classList.add('modal-close');
    setTimeout(() => {
      this.detailModalContainer.nativeElement.style.opacity = '0';
      this.detailModalContainer.nativeElement.style.visibility = 'hidden';
      this.selectedOrder = null;
    }, 500);
  }

  // Cambiar estado
  openStatusModal(order: Order) {
    this.selectedOrder = order;
    this.statusForm.patchValue({
      status: order.status,
    });
    this.statusModalContainer.nativeElement.style.opacity = '1';
    this.statusModalContainer.nativeElement.style.visibility = 'visible';
    this.statusModal.nativeElement.classList.remove('modal-close');
  }

  closeStatusModal() {
    this.statusModal.nativeElement.classList.add('modal-close');
    setTimeout(() => {
      this.statusModalContainer.nativeElement.style.opacity = '0';
      this.statusModalContainer.nativeElement.style.visibility = 'hidden';
      this.selectedOrder = null;
      this.statusForm.reset();
    }, 500);
  }

  onStatusSubmit() {
    if (this.statusForm.valid && this.selectedOrder?.id) {
      const newStatus = this.statusForm.value.status;

      this.orderService
        .updateStatus(this.selectedOrder.id, newStatus)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = 'Estado actualizado correctamente';
              this.loadOrders();
              this.closeStatusModal();
              setTimeout(() => (this.successMessage = ''), 3000);
            }
          },
          error: (error) => {
            console.error('Error updating status:', error);
            this.errorMessage =
              error.error?.message || 'Error al actualizar el estado';
            setTimeout(() => (this.errorMessage = ''), 3000);
          },
        });
    }
  }

  deleteOrder(id: number) {
    if (confirm('¿Está seguro de eliminar este pedido?')) {
      this.orderService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Pedido eliminado correctamente';
            this.loadOrders();
            setTimeout(() => (this.successMessage = ''), 3000);
          }
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.errorMessage =
            error.error?.message || 'Error al eliminar el pedido';
          setTimeout(() => (this.errorMessage = ''), 3000);
        },
      });
    }
  }

  // Helpers
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      pending: 'Pendiente',
      processing: 'En proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return statusLabels[status] || status;
  }

  getCustomerName(order: Order): string {
    if (order.customer) {
      return `${order.customer.first_name} ${order.customer.last_name}`;
    }
    return 'N/A';
  }
}
