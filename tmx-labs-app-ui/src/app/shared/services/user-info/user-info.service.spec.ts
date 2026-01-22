import { TestBed } from '@angular/core/testing';
import { UserInfoService } from './user-info.service';
import { ApiService } from '../api/api.service';
import { CookieService } from 'ngx-cookie-service';
import { UserInfo } from '../../data/application/resources';

describe('UserInfoService', () => {
  let service: UserInfoService;

  const mockUserInfo: UserInfo = {
    name: 'Test User',
    lanId: 'testuser',
    isLabsAdmin: false,
    isInAppChangeRole: true,
    isInFeeReversalOnlyRole: false,
    isInFeeReversalRole: false,
  } as UserInfo;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', ['set', 'get']);

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

  // TODO: Uncomment and complete these tests once roles are defined
  //   it('should return true if user has access to at least one specified role', () => {
  //     const result = service.getUserAccess(['isInFeeReversalRole']);
  //     expect(result).toBe(true);
  //   });

  //   it('should return false if user does not have access to any specified role', () => {
  //     const result = service.getUserAccess(['canViewOrderManagement']);
  //     expect(result).toBe(false);
  //   });

  //   it('should return true if user has access to at least one of multiple roles', () => {
  //     const result = service.getUserAccess(['isInFeeReversalRole', 'canViewCustomerService']);
  //     expect(result).toBe(true);
  //   });

  //   it('should return false if lanId is undefined', () => {
  //     service.userInfo.next({} as UserInfo);
  //     const result = service.getUserAccess(['canViewCustomerService']);
  //     expect(result).toBe(false);
  //   });
  // });

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
});
