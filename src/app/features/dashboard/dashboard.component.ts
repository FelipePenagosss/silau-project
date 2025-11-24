import { Component, ElementRef, ViewChild } from '@angular/core';
import { SideBarComponent } from '../../shared/side-bar/side-bar.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    SideBarComponent,
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent {
  @ViewChild('main') main!: ElementRef;

  showDashboard: boolean = true;

  constructor(private router: Router){
    this.router.events.subscribe((val: any) =>{
      this.showDashboard = val.url === '/dashboard'
    })
  }
}
