import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GoogleMapsService } from './google-maps.service';
import { ConfigurationSettings, IAppConfig } from '../configuration/config-info';

describe('GoogleMapsService', () => {
    let service: GoogleMapsService;
    let httpMock: HttpTestingController;

    beforeAll(() => {
        // Mock ConfigurationSettings before any tests run
        ConfigurationSettings.appSettings = {
            apiKeys: {
                googleMaps: 'test-api-key'
            },
            environment: {
                name: 'test',
                isProduction: false,
                prefix: 'test'
            },
            build: {
                version: '1.0.0',
                buildId: 'test',
                buildNumber: '1',
                branch: 'test'
            },
            auth: {
                discoveryDoc: 'test'
            },
            connections: {
                apiUrl: 'test',
                hostUrl: 'test',
                slot: 'test'
            }
        } as IAppConfig;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(GoogleMapsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // Flush any pending requests before verifying
        const pendingRequests = httpMock.match(() => true);
        pendingRequests.forEach(req => req.flush({}));
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        
        // Handle the JSONP request made in constructor
        const req = httpMock.expectOne((request) => 
            request.url.startsWith('https://maps.googleapis.com/maps/api/js')
        );
        req.flush({});
    });

    it('should load Google Maps API on initialization', () => {
        // Verify the JSONP request was made
        const req = httpMock.expectOne((request) => 
            request.url.startsWith('https://maps.googleapis.com/maps/api/js')
        );
        expect(req.request.method).toBe('JSONP');

        // Simulate successful response
        req.flush({});

        // Verify the API loaded state is updated
        service.isApiLoaded$.subscribe((loaded) => {
            expect(loaded).toBe(true);
        });
    });
});
