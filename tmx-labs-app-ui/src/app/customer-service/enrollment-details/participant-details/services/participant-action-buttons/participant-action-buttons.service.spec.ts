import { TestBed } from '@angular/core/testing';
import { ParticipantActionButtonsService, ParticipantActionItems } from './participant-action-buttons.service';
import { ActionVisibilityContext } from '../action-rules/action-display-rules.service';
import { DeviceExperience, DeviceExperienceValue, DeviceStatus, DeviceStatusValue } from 'src/app/shared/data/device/enums';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { UserInfoService } from 'src/app/shared/services/user-info/user-info.service';

describe('ParticipantActionButtonsService', () => {
    let service: ParticipantActionButtonsService;

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
            ]
        });
        service = TestBed.inject(ParticipantActionButtonsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createParticipantActions', () => {
        it('should always include general actions group', () => {
            const context: ActionVisibilityContext = {
                participant: { participantStatusCode: 2 }, // Not enrolled
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Mobile),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Available),
                    deviceSerialNumber: '',
                    deviceReceivedDateTime: new Date().toISOString()
                },
                eligibleSwapCandidatesCount: 0,
            };

            const actions = service.createParticipantActions(context);

            expect(actions).toHaveSize(1); // Only general group should be present
            expect(actions[0].id).toBe('general');
            expect(actions[0].label).toBe('General');
            expect(actions[0].children).toHaveSize(2);
            
            const children = actions[0].children!;
            expect(children[0].id).toBe(ParticipantActionItems.EditNickname);
            expect(children[1].id).toBe(ParticipantActionItems.EditVehicle);
        });

        it('should include plug-in actions when conditions are met', () => {
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
                eligibleSwapCandidatesCount: 2,
            };

            const actions = service.createParticipantActions(context);

            expect(actions.length).toBeGreaterThan(1);
            
            // Should have general and plug-in groups
            const generalGroup = actions.find(a => a.id === 'general');
            const plugInGroup = actions.find(a => a.id === 'plug-in-actions');
            
            expect(generalGroup).toBeDefined();
            expect(plugInGroup).toBeDefined();
            expect(plugInGroup?.children?.length).toBeGreaterThan(0);
        });

        it('should include opt-out action within general group when conditions are met', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantSeqID: 123,
                    participantStatusCode: 1 // Enrolled, can opt out
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device)
                },
                eligibleSwapCandidatesCount: 0,
            };

            const actions = service.createParticipantActions(context);

            const generalGroup = actions.find(a => a.id === 'general');
            expect(generalGroup).toBeDefined();
            const hasOptOut = generalGroup?.children?.some(
                (child) => child.id === ParticipantActionItems.OptOutParticipant,
            );
            expect(hasOptOut).toBeTrue();
        });

        it('should create buttons with correct ids and labels', () => {
            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1,
                    participantSeqID: 123,
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
                eligibleSwapCandidatesCount: 1
            };

            const actions = service.createParticipantActions(context);
            
            // Flatten all buttons from all groups
            const allButtons = actions.flatMap(group => group.children || []);
            
            // Verify button properties
            const swapButton = allButtons.find(b => b.id === ParticipantActionItems.SwapDevices);
            expect(swapButton?.label).toBe('Swap Devices');
            
            const replaceButton = allButtons.find(b => b.id === ParticipantActionItems.ReplaceDevice);
            expect(replaceButton?.label).toBe('Replace Device');
            
            const nicknameButton = allButtons.find(b => b.id === ParticipantActionItems.EditNickname);
            expect(nicknameButton?.label).toBe('Edit Nickname');
            
            const vehicleButton = allButtons.find(b => b.id === ParticipantActionItems.EditVehicle);
            expect(vehicleButton?.label).toBe('Edit Vehicle');
        });

        it('should include exclude trips action for Labs admins with eligible participants', () => {
            const userInfoService = TestBed.inject(UserInfoService);
            userInfoService.userInfo.next({ isLabsAdmin: true, isLabsUser: true, lanId: 'admin', name: 'Admin' });

            const context: ActionVisibilityContext = {
                participant: {
                    participantStatusCode: 1,
                    participantSeqID: 123,
                },
                device: {
                    deviceExperienceTypeCode: DeviceExperienceValue.get(DeviceExperience.Device),
                    deviceStatusCode: DeviceStatusValue.get(DeviceStatus.Assigned),
                    deviceSerialNumber: 'ABC123',
                    deviceSeqID: 123,
                },
                eligibleSwapCandidatesCount: 0,
            };

            const actions = service.createParticipantActions(context);
            const generalGroup = actions.find((group) => group.id === 'general');
            const hasExcludeTrips = generalGroup?.children?.some(
                (child) => child.id === ParticipantActionItems.ExcludeTrips,
            );

            expect(hasExcludeTrips).toBeTrue();
        });
    });
});
