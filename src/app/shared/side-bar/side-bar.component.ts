import { AfterViewInit, Component, ElementRef, inject, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements AfterViewInit {
  @ViewChild('lateral_bar') lateral_bar!: ElementRef;
  @ViewChild('logo') logo!: ElementRef;
  @ViewChildren('span', { read: ElementRef }) spans!: QueryList<ElementRef>;
  @ViewChild('circle') circle!: ElementRef;
  @ViewChild('switch') switch!: ElementRef;
  @ViewChild('menu') menu!: ElementRef;
  @ViewChildren('list__button', { read: ElementRef }) listElements!: QueryList<ElementRef>;

  @Input() parentElement!: HTMLElement;

  private router = inject(Router);

  ngAfterViewInit(): void {
    
  }

  moveMenu() {
    this.lateral_bar.nativeElement.classList.toggle('mini-bar');
    this.logo.nativeElement.classList.toggle('hid');
    this.parentElement.classList.toggle('min-main')
    this.spans.forEach(span => {
      span.nativeElement.classList.toggle('hid');
    });
  }

  clickSwitch() {
    this.circle.nativeElement.classList.toggle('dark-on');
    this.switch.nativeElement.classList.toggle('switch-on');
  }

  btnMenu() {
    this.lateral_bar.nativeElement.classList.toggle('max-lateral-bar');
    const icon = this.menu.nativeElement.children[0];
    const closeIcon = this.menu.nativeElement.children[1];
    if (this.lateral_bar.nativeElement.classList.contains('max-lateral-bar')) {
      icon.style.display = 'none';
      closeIcon.style.display = 'block';
    } else {
      icon.style.display = 'block';
      closeIcon.style.display = 'none';
    }
    if (window.innerWidth <= 320){
      this.lateral_bar.nativeElement.classList.add('mini-bar');
      this.logo.nativeElement.classList.toggle('hid');
      this.spans.forEach(span => {
        span.nativeElement.classList.toggle('hid');
      });
    }
  }

  toggleArrow(button: HTMLButtonElement) {
    button.classList.toggle('arrow');
    
    let height = 0;
    const menu = button.nextElementSibling as HTMLElement;
  
    if (menu) {
      height = menu.clientHeight === 0 ? menu.scrollHeight : 0;
      menu.style.height = `${height}px`;
    }
  }

  logOut() {

    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
    }
    this.router.navigate(["/login"])
  }
}
