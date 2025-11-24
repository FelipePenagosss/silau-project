import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('carouselContainer') carousel!: ElementRef;
  @ViewChild('carousels') carousels!: ElementRef;
  @ViewChildren('sliderSection', { read: ElementRef }) sliderSections!: QueryList<ElementRef>;

  private operation = 0;
  private count = 0;
  private widthImg = 0;
  private length = 0;
  private animationFrameId: any;  // ID para la animación
  private isAnimating = false;

  ngAfterViewInit() {
    if (this.sliderSections.length > 0) {
      this.widthImg = 100 / this.sliderSections.length;
      this.length = this.sliderSections.length;

      // Inicia el ciclo de deslizamiento una vez que todo esté cargado
      this.startAutoSlide();
    } else {
      console.error('No se encontraron secciones de slider.');
    }
  }

  startAutoSlide() {
    // Usa requestAnimationFrame para iniciar la animación automática
    this.scheduleNextSlide();
  }

  scheduleNextSlide() {
    if (typeof requestAnimationFrame !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(() => {
        if (!this.isAnimating) {
          this.isAnimating = true;
          setTimeout(() => {
            this.moveToRight();
            this.isAnimating = false;
            this.scheduleNextSlide();
          }, 5000);
        }
      });
    } else {
      console.log('requestAnimationFrame no está disponible.');
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  moveToLeft() {
    const slider = this.carousels.nativeElement;
    this.count--;
    if (this.count < 0) {
      this.count = this.length - 1;
      this.operation = this.widthImg * (this.length - 1);
      slider.style.transform = `translateX(-${this.operation}%)`;
      slider.style.transition = 'none';
    } else {
      this.operation = this.operation - this.widthImg;
      slider.style.transform = `translateX(-${this.operation}%)`;
      slider.style.transition = 'transform 0.5s ease';  // Asegura que la transición sea fluida
    }
  }

  moveToRight() {
    const slider = this.carousels.nativeElement;
    if (this.count >= this.length - 1) {
      this.operation = 0;
      this.count = 0;
      slider.style.transform = `translateX(-${this.operation}%)`;
      slider.style.transition = 'none'; // Sin transición para el reinicio
    } else {
      this.count++;
      this.operation = this.operation + this.widthImg;
      slider.style.transform = `translateX(-${this.operation}%)`;
      slider.style.transition = 'transform 0.5s ease';  // Asegura que la transición sea fluida
    }
  }
}
