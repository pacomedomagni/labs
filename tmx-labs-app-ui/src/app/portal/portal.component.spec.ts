import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortalContainerComponent } from './portal.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { AppConfigService } from '../shared/services/configuration/config.service';
import { EnvConfigService } from '../shared/services/configuration/env-config.service';
import { AppDataService } from '../shared/services/app-data-service/app-data.service';
import { UserInfoService } from '../shared/services/user-info/user-info.service';
import { ApplicationGroupIds } from '../shared/data/application/application-groups.model';
import { ApplicationGroupMetadata } from '../shared/data/application/application.interface';

describe('PortalContainerComponent', () => {
  let component: PortalContainerComponent;
  let fixture: ComponentFixture<PortalContainerComponent>;
  let appDataService: jasmine.SpyObj<AppDataService>;
  let userInfoService: jasmine.SpyObj<UserInfoService>;

  beforeEach(async () => {
    const appDataServiceSpy = jasmine.createSpyObj('AppDataService', ['shouldDisplayApplication']);
    const userInfoServiceSpy = jasmine.createSpyObj('UserInfoService', ['getUserAccess']);

    await TestBed.configureTestingModule({
      imports: [PortalContainerComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideOAuthClient(),
        {
          provide: EnvConfigService,
          useValue: {
            environment: 'test',
            config: {}
          }
        },
        {
          provide: AppConfigService,
          useValue: {
            config: {},
            getConfig: () => ({})
          }
        },
        { provide: AppDataService, useValue: appDataServiceSpy },
        { provide: UserInfoService, useValue: userInfoServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalContainerComponent);
    component = fixture.componentInstance;
    appDataService = TestBed.inject(AppDataService) as jasmine.SpyObj<AppDataService>;
    userInfoService = TestBed.inject(UserInfoService) as jasmine.SpyObj<UserInfoService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have apps defined from applicationGroups', () => {
    expect(component.apps).toBeDefined();
    expect(Array.isArray(component.apps)).toBe(true);
  });

  describe('shouldDisplay', () => {
    let mockApp: ApplicationGroupMetadata;

    beforeEach(() => {
      mockApp = {
        id: ApplicationGroupIds.CustomerService,
        name: 'Customer Service'
      } as ApplicationGroupMetadata;
    });

    it('should return false if app id is Portal', () => {
      mockApp.id = ApplicationGroupIds.Portal;
      appDataService.shouldDisplayApplication.and.returnValue(true);
      userInfoService.getUserAccess.and.returnValue(true);

      const result = component.shouldDisplay(mockApp);

      expect(result).toBe(false);
    });

    it('should return false if appDataService.shouldDisplayApplication returns false', () => {
      appDataService.shouldDisplayApplication.and.returnValue(false);
      userInfoService.getUserAccess.and.returnValue(true);

      const result = component.shouldDisplay(mockApp);

      expect(result).toBe(false);
    });

    it('should return false if userInfoService.getUserAccess returns false', () => {
      appDataService.shouldDisplayApplication.and.returnValue(true);
      userInfoService.getUserAccess.and.returnValue(false);

      const result = component.shouldDisplay(mockApp);

      expect(result).toBe(false);
    });

    it('should return true if all conditions are met', () => {
      appDataService.shouldDisplayApplication.and.returnValue(true);
      userInfoService.getUserAccess.and.returnValue(true);

      const result = component.shouldDisplay(mockApp);

      expect(result).toBe(true);
      expect(appDataService.shouldDisplayApplication).toHaveBeenCalledWith(mockApp);
      expect(userInfoService.getUserAccess).toHaveBeenCalledWith(mockApp.access);
    });
  });
});