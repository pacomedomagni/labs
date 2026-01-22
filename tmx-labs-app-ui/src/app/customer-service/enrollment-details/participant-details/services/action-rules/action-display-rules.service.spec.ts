import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { ActionDisplayRulesService, ActionVisibilityContext } from './action-display-rules.service';
import { DeviceExperience, DeviceExperienceValue, DeviceStatus, DeviceStatusValue } from 'src/app/shared/data/device/enums';
import { UserInfoService } from 'src/app/shared/services/user-info/user-info.service';

describe('ActionDisplayRulesService', () => {
    let service: ActionDisplayRulesService;
    let userInfoService: UserInfoService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: OAuthStorage,
                    useValue: {
                        getItem: jasmine.createSpy('getItem').and.returnValue(null),
                        setItem: jasmine.createSpy('setItem'),
                        removeItem: jasmine.createSpy('removeItem'),
                    },
                },
            ],
        });
        service = TestBed.inject(ActionDisplayRulesService);
        userInfoService = TestBed.inject(UserInfoService);
        userInfoService.userInfo.next({ isLabsAdmin: false, isLabsUser: false, lanId: 'tester', name: 'Tester' });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('canReplaceDevice', () => {
        it('should return true when all conditions for device reassignment are met', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1, // Enrolled
                    deviceSeqID: 123
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canReplaceDevice(context)).toBe(true);
        });

        it('should return false when participant is not enrolled', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 2, // Not enrolled
                    deviceSeqID: 123
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canReplaceDevice(context)).toBe(false);
        });

        it('should return false when device is not plug-in type', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1,
                    deviceSeqID: 123
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Mobile),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canReplaceDevice(context)).toBe(false);
        });

        it('should return false when device has been returned', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1,
                    deviceSeqID: 123
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: new Date().toISOString(),
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canReplaceDevice(context)).toBe(false);
        });
    });

    describe('canSwapDevices', () => {
        it('should return true when device reassignment conditions are met and swap candidates exist', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1,
                    deviceSeqID: 123
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 2
            };

            expect(service.canSwapDevices(context)).toBe(true);
        });

        it('should return false when no swap candidates are available', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1,
                    deviceSeqID: 123
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canSwapDevices(context)).toBe(false);
        });
    });

    describe('canPingDevice', () => {
        it('should return true when all ping conditions are met', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canPingDevice(context)).toBe(true);
        });

        it('should return false when device has no serial number', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: '',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canPingDevice(context)).toBe(false);
        });

        it('should return false when device is not assigned', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Available),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canPingDevice(context)).toBe(false);
        });
    });

    describe('canResetDevice', () => {
        it('should return true when ping conditions are met', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canResetDevice(context)).toBe(true);
        });

        it('should return false when ping conditions are not met', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 2
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canResetDevice(context)).toBe(false);
        });
    });

    describe('canManageAudio', () => {
        const buildContext = (): ActionVisibilityContext => ({
            participant: {
                participantStatusCode: 1,
            },
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                deviceSerialNumber: 'ABC123',
                deviceSeqID: 456,
                deviceReceivedDateTime: null,
                deviceAbandonedDateTime: null,
            },
            eligibleSwapCandidatesCount: 0,
        });

        it('should return true when user has access and device is eligible', () => {
            userInfoService.userInfo.next({ isLabsAdmin: true, isLabsUser: false, lanId: 'admin', name: 'Admin' });

            const context = buildContext();

            expect(service.canManageAudio(context)).toBe(true);
        });

        it('should return false when user lacks access', () => {
            userInfoService.userInfo.next({ isLabsAdmin: false, isLabsUser: false, lanId: 'user', name: 'User' });

            const context = buildContext();

            expect(service.canManageAudio(context)).toBe(false);
        });

        it('should return false when user is Labs user but not Labs admin', () => {
            userInfoService.userInfo.next({ isLabsAdmin: false, isLabsUser: true, lanId: 'labsuser', name: 'Labs User' });

            const context = buildContext();

            expect(service.canManageAudio(context)).toBe(false);
        });

        it('should return false when device has been returned', () => {
            userInfoService.userInfo.next({ isLabsAdmin: true, isLabsUser: false, lanId: 'admin', name: 'Admin' });

            const context = buildContext();
            context.device.deviceReceivedDateTime = new Date().toISOString();

            expect(service.canManageAudio(context)).toBe(false);
        });

        it('should return false when deviceSeqID is missing', () => {
            userInfoService.userInfo.next({ isLabsAdmin: true, isLabsUser: false, lanId: 'admin', name: 'Admin' });

            const context = buildContext();
            delete (context.device as { deviceSeqID?: number }).deviceSeqID;

            expect(service.canManageAudio(context)).toBe(false);
        });
    });

    describe('canBeMarkedAbandoned', () => {
        it('should return true when device can be marked as abandoned', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedAbandoned(context)).toBe(true);
        });

        it('should return false when device is already abandoned', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Abandoned),
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedAbandoned(context)).toBe(false);
        });

        it('should return false when device is defective', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Defective),
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedAbandoned(context)).toBe(false);
        });

        it('should return false when device has already been abandoned', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceReceivedDateTime: null,
                    deviceAbandonedDateTime: new Date().toISOString()
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedAbandoned(context)).toBe(false);
        });
    });

    describe('canBeMarkedDefective', () => {
        it('should return true when device can be marked as defective', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedDefective(context)).toBe(true);
        });

        it('should return false when device is already defective', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Defective),
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedDefective(context)).toBe(false);
        });

        it('should return false when device has been returned', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceReceivedDateTime: new Date().toISOString()
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedDefective(context)).toBe(false);
        });

        it('should return false when device is not plug-in type', () => {
            const context: ActionVisibilityContext = {
                participant: {},
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Mobile),
                    deviceSerialNumber: 'ABC123',
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canBeMarkedDefective(context)).toBe(false);
        });
    });

    describe('canOptOut', () => {
        it('should return true when participant can opt out', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantSeqID: 123,
                    participantStatusCode: 1 // Enrolled
                },
                device: {},
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canOptOut(context)).toBe(true);
        });

        it('should return false when participant is already opted out', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantSeqID: 123,
                    participantStatusCode: 2 // Opted out
                },
                device: {},
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canOptOut(context)).toBe(false);
        });

        it('should return false when participant has no seqID', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantSeqID: null,
                    participantStatusCode: 1
                },
                device: {},
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canOptOut(context)).toBe(false);
        });

        it('should return false when participant seqID is zero or negative', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantSeqID: 0,
                    participantStatusCode: 1
                },
                device: {},
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canOptOut(context)).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null/undefined device serial numbers', () => {
            const contextWithNull: ActionVisibilityContext = {
                participant: { participantStatusCode: 1 },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: null,
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            const contextWithUndefined: ActionVisibilityContext = {
                participant: { participantStatusCode: 1 },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: undefined,
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canPingDevice(contextWithNull)).toBe(false);
            expect(service.canPingDevice(contextWithUndefined)).toBe(false);
        });

        it('should handle whitespace-only device serial numbers', () => {
            const context: ActionVisibilityContext = {
                participant: { participantStatusCode: 1 },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: '   ',
                    deviceSeqID: 123,
                    deviceReceivedDateTime: null
                },
                eligibleSwapCandidatesCount: 0
            };

            expect(service.canPingDevice(context)).toBe(false);
        });
    });

    describe('canExcludeTrips', () => {
        const buildContext = (overrides?: Partial<ActionVisibilityContext>): ActionVisibilityContext => ({
            participant: {
                participantStatusCode: 1,
                participantSeqID: 456,
            },
            device: {
                deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                deviceSerialNumber: 'ABC123',
                deviceSeqID: 789,
            },
            eligibleSwapCandidatesCount: 0,
            ...overrides,
        });

        it('should return true for Labs admin with an enrolled plug-in participant', () => {
            userInfoService.userInfo.next({ isLabsAdmin: true, isLabsUser: true, lanId: 'admin', name: 'Admin' });

            const context = buildContext();

            expect(service.canExcludeTrips(context)).toBe(true);
        });

        it('should return false when user is not a Labs admin', () => {
            userInfoService.userInfo.next({ isLabsAdmin: false, isLabsUser: true, lanId: 'user', name: 'User' });

            const context = buildContext();

            expect(service.canExcludeTrips(context)).toBe(false);
        });

        it('should return false when participant is not enrolled', () => {
            userInfoService.userInfo.next({ isLabsAdmin: true, isLabsUser: true, lanId: 'admin', name: 'Admin' });

            const context = buildContext({
                participant: { participantStatusCode: 2, participantSeqID: 456 },
            });

            expect(service.canExcludeTrips(context)).toBe(false);
        });

        it('should ignore device type when user is admin and participant enrolled', () => {
            userInfoService.userInfo.next({ isLabsAdmin: true, isLabsUser: true, lanId: 'admin', name: 'Admin' });

            const context = buildContext({
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Mobile),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 789,
                },
            });

            expect(service.canExcludeTrips(context)).toBe(true);
        });
    });
});