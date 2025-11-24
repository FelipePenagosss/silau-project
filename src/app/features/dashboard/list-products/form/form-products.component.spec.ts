import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import ProductFormComponent from './form-products.component';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.productForm.get('nombre')?.value).toBe('');
    expect(component.productForm.get('descripcion')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.productForm;
    expect(form.valid).toBeFalsy();
    
    form.controls['nombre'].setValue('Test Product');
    form.controls['linea_producto'].setValue('Test Line');
    form.controls['tamanio'].setValue('Medium');
    form.controls['precio'].setValue(100);
    form.controls['cantidad'].setValue(10);
    form.controls['estado'].setValue('Active');
    form.controls['imagen'].setValue('test.jpg');
    form.controls['descripcion'].setValue('Test description');

    expect(form.valid).toBeTruthy();
  });
});