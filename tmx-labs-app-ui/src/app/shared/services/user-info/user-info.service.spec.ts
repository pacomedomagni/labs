import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UserInfoService } from './user-info.service';
import { ApiService } from '../api/api.service';
import { CookieService } from 'ngx-cookie-service';
import { UserInfo } from '../../data/application/resources';

describe('UserInfoService', () => {
  let service: UserInfoService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  const mockUserInfo: UserInfo = {
    name: 'Test User',
    lanId: 'testuser',
    isLabsAdmin: false,
    isLabsUser: true,
    isInAppChangeRole: true,
    isInFeeReversalOnlyRole: false,
    isInFeeReversalRole: false,
    hasEligibilityAccess: true,
    isInOpsAdminRole: false,
    isInOpsUserRole: false,
    isInSupportAdminRole: false,
    isCommercialLineRole: false,
    hasInsertInitialParticipationScoreInProcessAccess: false,
    hasOptOutSuspensionAccess: false,
    hasPolicyMergeAccess: false,
    hasResetEnrollmentAccess: false,
    hasStopShipmentAccess: false,
    hasUpdatePProGuidAccess: false,
    hasVehicleSupportAccess: false,
    isInMobileRegistrationAdminRole: false,
    isInTheftOnlyRole: false,
    isInTheftRole: false
  };

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    cookieServiceSpy = jasmine.createSpyObj('CookieService', ['set', 'get']);

    TestBed.configureTestingModule({
      providers: [
        UserInfoService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: CookieService, useValue: cookieServiceSpy }
      ]
    });

    service = TestBed.inject(UserInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('data getter', () => {
    it('should return current userInfo value', () => {
      service.userInfo.next(mockUserInfo);
      expect(service.data).toEqual(mockUserInfo);
    });
  });

  describe('userInfo$ observable', () => {
    it('should emit when userInfo BehaviorSubject updates', (done) => {
      service.userInfo$.subscribe(info => {
        if (info.lanId) {
          expect(info).toEqual(mockUserInfo);
          done();
        }
      });

      service.userInfo.next(mockUserInfo);
    });
  });

  it('should fetch user info and update BehaviorSubject', (done) => {
    apiServiceSpy.get.and.returnValue(of({
      body: mockUserInfo
    }));

    service.getUserInfo().subscribe(result => {
      expect(result).toEqual(mockUserInfo);
      expect(service.data).toEqual(mockUserInfo);
      expect(cookieServiceSpy.set).toHaveBeenCalledWith('tmxuser', 'Test User', 1);
      done();
    });

    expect(apiServiceSpy.get).toHaveBeenCalledWith({ uri: '/customerService/roles', options: { fullResponse: true } });
  });

  it('should return true when user has required access', () => {
    service.userInfo.next(mockUserInfo);

    expect(service.getUserAccess(['isInAppChangeRole'])).toBeTrue();
  });

  it('should return false when user lacks required access', () => {
    service.userInfo.next({
      ...mockUserInfo,
      isInAppChangeRole: false
    });

    expect(service.getUserAccess(['isInAppChangeRole'])).toBeFalse();
  });

  it('should return false when lanId is undefined', () => {
    service.userInfo.next({} as UserInfo);

    expect(service.getUserAccess(['isInAppChangeRole'])).toBeFalse();
  });
});
