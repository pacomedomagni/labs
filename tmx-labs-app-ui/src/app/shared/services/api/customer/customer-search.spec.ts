import { TestBed } from '@angular/core/testing';
import { CustomerSearchService } from './customer-search';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('CustomerSearch', () => {
  let service: CustomerSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideOAuthClient(),
      ]
    });
    service = TestBed.inject(CustomerSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
