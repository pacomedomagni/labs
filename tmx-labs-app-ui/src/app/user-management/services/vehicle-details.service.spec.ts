import { TestBed } from '@angular/core/testing';

import { VehicleDetailsService } from './vehicle-details.service';

describe('VehicleDetailsService', () => {
  let service: VehicleDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
