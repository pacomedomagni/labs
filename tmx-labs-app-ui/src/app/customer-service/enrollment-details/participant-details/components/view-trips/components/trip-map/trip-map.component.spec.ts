import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthStorage } from 'angular-oauth2-oidc';

import { TripMapComponent } from './trip-map.component';
import { INFO_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/information-dialog/information-dialog.component';
import { ConfigurationSettings, IAppConfig } from 'src/app/shared/services/configuration/config-info';

describe('TripMapComponent', () => {
  let component: TripMapComponent;
  let fixture: ComponentFixture<TripMapComponent>;

  const mockDialogData = {
    tripSeqID: 123,
  };

  beforeEach(async () => {
    // Mock ConfigurationSettings
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

    await TestBed.configureTestingModule({
      imports: [TripMapComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OAuthStorage, useValue: sessionStorage },
        { provide: INFO_DIALOG_CONTENT, useValue: mockDialogData },
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TripMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
