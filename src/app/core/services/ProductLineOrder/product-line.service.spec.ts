import { TestBed } from '@angular/core/testing';

import { ProductLineService } from './product-line.service';

describe('ProductLineService', () => {
  let service: ProductLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
