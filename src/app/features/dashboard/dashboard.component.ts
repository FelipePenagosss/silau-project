import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { SideBarComponent } from '../../shared/side-bar/side-bar.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../core/services/CustomerService/customer.service';
import { ProductService } from '../../core/services/ProductService/product.service';
import { OrderService } from '../../core/services/OrderService/order.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    SideBarComponent,
    CommonModule,
    RouterLink, 
    RouterLinkActive
    
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit {
  @ViewChild('main') main!: ElementRef;

  showDashboard: boolean = true;
  
  // Datos reales
  totalCustomers = 0;
  totalOrders = 0;
  totalProducts = 0;
  monthlyRevenue = '0';
  isLoading = true;

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private productService: ProductService,
    private orderService: OrderService
  ) {
    this.router.events.subscribe((val: any) => {
      this.showDashboard = val.url === '/dashboard';
    });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Cargar total de clientes
    this.customerService.list().subscribe({
      next: (response) => {
        this.totalCustomers = response.pagination?.total ||  0;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.totalCustomers = 0;
        this.checkLoadingComplete();
      }
    });

    // Cargar total de productos
    this.productService.list().subscribe({
      next: (response: any) => {
        if (response.pagination) {
          this.totalProducts = response.pagination.total;
        } else if (Array.isArray(response)) {
          this.totalProducts = response.length;
        } else if (response.data) {
          this.totalProducts = response.data.length;
        } else {
          this.totalProducts = 0;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.totalProducts = 0;
        this.checkLoadingComplete();
      }
    });

    // Cargar total de pedidos
    this.orderService.list().subscribe({
      next: (response: any) => {
        if (response.pagination) {
          this.totalOrders = response.pagination.total;
        } else if (Array.isArray(response)) {
          this.totalOrders = response.length;
        } else if (response.data) {
          this.totalOrders = response.data.length;
        } else {
          this.totalOrders = 0;
        }
        
        this.calculateMonthlyRevenue(response);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.totalOrders = 0;
        this.monthlyRevenue = '0';
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete() {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  calculateMonthlyRevenue(orders: any) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let monthlyTotal = 0;
    
    const ordersData = orders.data || orders || [];
    
    ordersData.forEach((order: any) => {
      if (order.created_at) {
        const orderDate = new Date(order.created_at);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthlyTotal += order.total || order.amount || 0;
        }
      }
    });
    
    this.monthlyRevenue = monthlyTotal.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  }

  refreshData() {
    this.loadDashboardData();
  }
}