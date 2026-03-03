import {
	PolicyEnrolledFeatures
} from "@modules/shared/data/resources";
import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class CrossAppQuery {

	private policyEnrolledFeaturesSubject: BehaviorSubject<PolicyEnrolledFeatures> = new BehaviorSubject<PolicyEnrolledFeatures>(undefined);
	policyEnrolledFeatures$: Observable<PolicyEnrolledFeatures> = this.policyEnrolledFeaturesSubject.asObservable();

	constructor() { }

	updatePolicyEnrolledFeatures(enrolledFeatures: PolicyEnrolledFeatures): void {
		this.policyEnrolledFeaturesSubject.next(enrolledFeatures);
	}

}
