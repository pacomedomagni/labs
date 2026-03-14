import {
	Address,
	Registration,
	Participant,
	Policy,
	PolicyPeriod,
	ExcludedDateRangeReasonCode,
	CompatibilityType,
	CompatibilityAction,
	HomebaseParticipantSummaryResponse
} from "@modules/shared/data/resources";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { DeviceExperience, MessageCode } from "@modules/shared/data/enums";
import { HelperService } from "@modules/shared/services/_index";

@Injectable()
export class PolicyQuery {
	//#region Shared
	protected policySubject: BehaviorSubject<Policy> = new BehaviorSubject<Policy>(undefined);
	protected policyTransactionError: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	protected multiPolicySubject: BehaviorSubject<Policy[]> = new BehaviorSubject<Policy[]>(undefined);
	protected policyRegistrationsSubject: BehaviorSubject<Registration[]> = new BehaviorSubject<Registration[]>(undefined);
	protected homebaseParticipantsSummariesSubject: BehaviorSubject<HomebaseParticipantSummaryResponse[]> = new BehaviorSubject<HomebaseParticipantSummaryResponse[]>(undefined);
	protected currentPolicyPeriodSubject: BehaviorSubject<PolicyPeriod> = new BehaviorSubject<PolicyPeriod>(undefined);

	policy$: Observable<Policy> = this.policySubject.asObservable();

	multiPolicy$: Observable<Policy[]> = this.multiPolicySubject.asObservable();
	policyTransactionError$: Observable<string> = this.policyTransactionError.asObservable();
	currentpolicyPeriod$: Observable<PolicyPeriod> = this.currentPolicyPeriodSubject.asObservable();
	policyRegistrations$: Observable<Registration[]> = this.policyRegistrationsSubject.asObservable();
	homebaseParticipantsSummaries$: Observable<HomebaseParticipantSummaryResponse[]> = this.homebaseParticipantsSummariesSubject.asObservable();

	policySearchHasErrors$: Observable<boolean> = this.policy$.pipe(map(x => x?.messages === undefined ? false : x?.messages[MessageCode[MessageCode.Error]] !== undefined));
	//#region

	//#region Snapshot
	mobileParticipants$ = this.policy$.pipe(map(policy => policy?.participants?.filter(p => this.helper.isParticipantMobile(p))));
	pluginParticipants$ = this.policy$.pipe(map(policy => policy?.participants?.filter(p => !this.helper.isParticipantMobile(p))));

	private compatibilityActionsSubject: BehaviorSubject<CompatibilityAction[]> = new BehaviorSubject(undefined);
	private compatibilityTypesSubject: BehaviorSubject<CompatibilityType[]> = new BehaviorSubject(undefined);
	private excludedDateRangeReasonCodesSubject: BehaviorSubject<ExcludedDateRangeReasonCode[]> = new BehaviorSubject(undefined);
	//#region

	constructor(private helper: HelperService) { }

	//#region Shared
	get activePolicyNumber(): string {
		return this.policySubject.value.policyNumber;
	}

	get policyRegistrations(): Registration[] {
		return this.policyRegistrationsSubject.value;
	}

	get primaryErrorMessage(): string {
		return this.policySubject.value.messages[MessageCode[MessageCode.Error]];
	}

	updateMultiPolicy(policies: Policy[]): void {
		this.multiPolicySubject.next(policies);
	}

	updatePolicy(policy: Policy): void {
		this.policySubject.next(policy);
	}
	updateTransactionError(error: string): void {
		this.policyTransactionError.next(error?.length > 0 ? error : null);
	}

	updateParticipant(participant: Participant): void {
		const policy = this.policySubject.getValue();
		let index = !participant.telematicsId ? -1 : policy.participants.findIndex(x => x.telematicsId === participant.telematicsId);
		if (index === -1) {
			index = policy.participants.findIndex(x => x.snapshotDetails.participantId === participant.snapshotDetails.participantId);
		}
		policy.participants[index] = participant;
		this.updatePolicy(policy);
	}

	updateCurrentPolicyPeriod(policyPeriod: PolicyPeriod): void {
		this.currentPolicyPeriodSubject.next(policyPeriod);
	}

	updatePolicyMailingAddress(address: Address): void {
		const policy = this.policySubject.getValue();
		policy.snapshotDetails.mailingAddress = address;
		this.updatePolicy(policy);
	}

	updatePolicyRegistrations(registrations: Registration[]): void {
		this.policyRegistrationsSubject.next(registrations);
	}

	updatePolicyParticipantsHomebaseSummaries(homebaseParticipantSummaryResponses:HomebaseParticipantSummaryResponse[]): void {
		this.homebaseParticipantsSummariesSubject.next(homebaseParticipantSummaryResponses);
	}
	//#endregion

	//#region Snapshot
	get compatibilityActionsMobile(): CompatibilityAction[] {
		return this.compatibilityActionsSubject.value.filter(x => x.deviceExperienceTypeCode === DeviceExperience.Mobile);
	}

	get compatibilityActionsPlugin(): CompatibilityAction[] {
		return this.compatibilityActionsSubject.value.filter(x => x.deviceExperienceTypeCode !== DeviceExperience.Mobile);
	}

	get excludedDateRangeReasonCodes(): ExcludedDateRangeReasonCode[] {
		return this.excludedDateRangeReasonCodesSubject.value;
	}

	get compatibilityTypesMobile(): CompatibilityType[] {
		return this.compatibilityTypesSubject.value.filter(x => x.deviceExperienceTypeCode === DeviceExperience.Mobile);
	}

	get compatibilityTypesPlugin(): CompatibilityType[] {
		return this.compatibilityTypesSubject.value.filter(x => x.deviceExperienceTypeCode !== DeviceExperience.Mobile);
	}

	updatePolicyAppAssignment(appName: string): void {
		const policy = this.policySubject.getValue();
		policy.snapshotDetails.appInfo.appName = appName;
		this.updatePolicy(policy);
	}

	updateCompatibilityTypes(data: CompatibilityType[]): void {
		this.compatibilityTypesSubject.next(data);
	}

	updateCompatibilityActions(data: CompatibilityAction[]): void {
		this.compatibilityActionsSubject.next(data);
	}

	updateExcludedDateReasonCodes(data: ExcludedDateRangeReasonCode[]): void {
		this.excludedDateRangeReasonCodesSubject.next(data);
	}

	getCompatibilityReasonDisplay(reasonCode: number): string {
		return this.compatibilityTypesSubject.value?.find(x => x.code === reasonCode)?.description ?? reasonCode.toString();
	}
	//#endregion

}
