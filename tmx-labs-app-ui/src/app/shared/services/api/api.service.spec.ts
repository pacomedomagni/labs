import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { CookieService } from 'ngx-cookie-service';
import { LoadingService } from '../infrastructure/loading/loading.service';
import { ConfigurationSettings, IAppConfig } from '../configuration/config-info';
import { HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

// Test data interfaces
interface TestDataResponse {
  data: string;
}

interface TestCreateResponse {
  id: number;
}

interface TestUpdateResponse {
  updated: boolean;
}

interface TestPayload {
  name: string;
}

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let authStorage: jasmine.SpyObj<OAuthStorage>;
  let cookieService: jasmine.SpyObj<CookieService>;
 
  const mockApiUrl = 'https://api.test.com';
  const mockAccessToken = 'test-access-token';
  const mockUsername = 'testuser';

  beforeEach(() => {
    const authStorageSpy = jasmine.createSpyObj('OAuthStorage', ['getItem', 'setItem', 'removeItem']);
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['startLoading', 'stopLoading']);

    // Mock ConfigurationSettings
    ConfigurationSettings.appSettings = {
      environment: {
        name: 'test',
        isProduction: false,
        prefix: 'test'
      },
      build: {
        version: '1.0.0',
        buildId: 'test-build',
        buildNumber: '1',
        branch: 'test'
      },
      auth: {
        discoveryDoc: 'test-discovery-doc',
        clientId: 'test-client',
        scope: 'openid profile',
        responseType: 'code',
        oidc: true
      },
      apiKeys: {
        googleMaps: 'test-google-maps-key'
      },
      connections: {
        apiUrl: mockApiUrl,
        hostUrl: 'http://localhost',
        slot: undefined
      }
    } as IAppConfig;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: OAuthStorage, useValue: authStorageSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    authStorage = TestBed.inject(OAuthStorage) as jasmine.SpyObj<OAuthStorage>;
    cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
  
    authStorage.getItem.and.returnValue(mockAccessToken);
    cookieService.get.and.returnValue(mockUsername);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should make a GET request', (done) => {
      const mockResponse: TestDataResponse = { data: 'test' };
      const uri = '/test';

      service.get<TestDataResponse>({ uri }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockAccessToken}`);
      expect(req.request.headers.get('x-tmxtrace-tmxuser')).toBe(mockUsername);
      req.flush(mockResponse);
    });

    it('should apply custom headers', (done) => {
      const customHeaders = new HttpHeaders({ 'Custom-Header': 'custom-value' });
      const uri = '/test';

      service.get<Record<string, unknown>>({ uri, headers$: of(customHeaders) }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.headers.get('Custom-Header')).toBe('custom-value');
      req.flush({});
    });
  });

  describe('getAsync', () => {
    it('should make a GET request with async option', (done) => {
      const mockResponse: TestDataResponse = { data: 'test' };
      const uri = '/test';

      service.getAsync<TestDataResponse>({ uri }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.method).toBe('GET');
      expect(req.request.reportProgress).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('post', () => {
    it('should make a POST request with payload', (done) => {
      const mockResponse: TestCreateResponse = { id: 1 };
      const payload: TestPayload = { name: 'test' };
      const uri = '/test';

      service.post<TestCreateResponse>({ uri, payload }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(JSON.stringify(payload));
      req.flush(mockResponse);
    });
  });

  describe('postAsync', () => {
    it('should make a POST request with async option', (done) => {
      const mockResponse: TestCreateResponse = { id: 1 };
      const payload: TestPayload = { name: 'test' };
      const uri = '/test';

      service.postAsync<TestCreateResponse>({ uri, payload }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.method).toBe('POST');
      expect(req.request.reportProgress).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('patch', () => {
    it('should make a PATCH request', (done) => {
      const mockResponse: TestUpdateResponse = { updated: true };
      const payload: TestPayload = { name: 'updated' };
      const uri = '/test/1';

      service.patch<TestUpdateResponse>({ uri, payload }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBe(JSON.stringify(payload));
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', (done) => {
      const uri = '/test/1';

      service.delete<void>({ uri }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('put', () => {
    it('should make a PUT request', (done) => {
      const mockResponse: TestUpdateResponse = { updated: true };
      const payload: TestPayload = { name: 'updated' };
      const uri = '/test/1';

      service.put<TestUpdateResponse>({ uri, payload }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(JSON.stringify(payload));
      req.flush(mockResponse);
    });
  });

  describe('error handling', () => {

    it('should handle timeout errors', (done) => {
      const uri = '/test';

      service.get<TestDataResponse>({ uri, options: { timeout: 100 } }).subscribe(
        () => fail('should have failed'),
        (error) => {
          // Check what properties the error actually has
          console.log('Error object:', error);
          console.log('Error keys:', Object.keys(error));
          
          // The service likely transforms timeout errors to have a status
          expect(error.status).toBe(408);
          done();
        }
      );

      // Handle the HTTP request but don't respond - let it naturally timeout
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      // Just let the request timeout naturally - don't call req.error()
    }, 300);

    it('should retry on specified status codes', (done) => {
      const uri = '/test';
      const mockResponse: TestDataResponse = { data: 'success' };

      service.get<TestDataResponse>({ uri, options: { retries: 2, retryDelay: 100 } }).subscribe(
        (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      );

      // First attempt fails
      const req1 = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      req1.flush('Error', { status: 0, statusText: 'Network Error' });

      // Retry succeeds
      setTimeout(() => {
        const req2 = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
        req2.flush(mockResponse);
      }, 150);
    }, 500);
  });

  describe('slotted URLs', () => {
    it('should append slot to URL when configured', (done) => {
      ConfigurationSettings.appSettings.connections.slot = 'production';
      const uri = '/test';

      service.get<Record<string, unknown>>({ uri }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${mockApiUrl}${uri}?=production`);
      expect(req.request.url).toContain('?=production');
      req.flush({});
    });

    it('should append slot with & when URL has query params', (done) => {
      ConfigurationSettings.appSettings.connections.slot = 'staging';
      const uri = '/test?id=1';

      service.get<Record<string, unknown>>({ uri }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${mockApiUrl}${uri}&=staging`);
      expect(req.request.url).toContain('&=staging');
      req.flush({});
    });
  });

  describe('request headers', () => {
    it('should include required trace headers', (done) => {
      const uri = '/test';

      service.get<Record<string, unknown>>({ uri }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.headers.get('x-tmxclient')).toBe('TMX Labs App');
      expect(req.request.headers.get('x-tmxtrace-traceid')).toBeTruthy();
      expect(req.request.headers.get('Cache-Control')).toBe('no-cache');
      req.flush({});
    });

    it('should include authorization header from OAuthStorage', (done) => {
      const uri = '/test';

      service.get<Record<string, unknown>>({ uri }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockAccessToken}`);
      expect(authStorage.getItem).toHaveBeenCalledWith('access_token');
      req.flush({});
    });
  });

  describe('response types', () => {
    it('should handle blob response type', (done) => {
      const uri = '/test/download';
      const blob = new Blob(['test'], { type: 'application/pdf' });

      service.get<Blob>({ uri, options: { responseType: 'blob' } }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
    });

    it('should handle text response type', (done) => {
      const uri = '/test/text';
      const textResponse = 'plain text response';

      service.get<string>({ uri, options: { responseType: 'text' } }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne((request) => request.url.startsWith(`${mockApiUrl}${uri}`));
      expect(req.request.responseType).toBe('text');
      req.flush(textResponse);
    });
  });
});