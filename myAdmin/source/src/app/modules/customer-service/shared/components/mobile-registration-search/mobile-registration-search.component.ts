import { Component } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import { MaterialModule } from "@modules/shared/material.module";
import { PolicyService } from "@modules/customer-service/shared/services/policy.service";
import { Policy, Participant } from "@modules/shared/data/resources";

@Component({
  selector: "tmx-mobile-registration-search",
  templateUrl: "./mobile-registration-search.component.html",
  styleUrls: ["./mobile-registration-search.component.scss"],
  standalone: true,
  imports: [SharedModule, MaterialModule],
  providers: [PolicyService]
})
export class MobileRegistrationSearchComponent {
  policyNumber = "";
  hasSearched = false;
  isLoading = false;
  searchedPolicyNumber: string | null = null;
  policyFeatures: string | null = null;
  results: MobileRegistration[] = [];

  constructor(private policyService: PolicyService) {}

  onPolicySearch(policyNumber: string): void {
    this.isLoading = true;
    this.searchedPolicyNumber = policyNumber;

    this.policyService.getPolicy(policyNumber).subscribe({
      next: (policy: Policy) => {
        this.results = this.mapParticipantsToMobileRegistrations(policy.participants);
        this.policyFeatures = this.getPolicyFeatures(policy.participants);
        this.isLoading = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error("Error searching for policy:", error);
        this.results = [];
        this.policyFeatures = null;
        this.isLoading = false;
        this.hasSearched = true;
      }
    });
  }

  private mapParticipantsToMobileRegistrations(participants: Participant[]): MobileRegistration[] {
    if (!participants) {
      return [];
    }
    return participants
      .filter(participant => !!participant.telematicsId)
      .map(participant => ({
        telematicsId: participant.telematicsId,
        mobilePhone: participant.registrationDetails?.mobileRegistrationCode ?? "",
        features: this.getParticipantFeatures(participant),
        registrationStatus: participant.registrationDetails?.statusSummary ?? ""
      }));
  }

  private getParticipantFeatures(participant: Participant): string {
    const features: string[] = [];
    if (participant?.homebaseParticipantSummaryResponse?.adEnrolled) {
      features.push("AR");
    }
    if (participant?.homebaseParticipantSummaryResponse?.ubiEnrolled) {
      features.push("UBI");
    }
    return features.join("/") || "None";
  }

  private getPolicyFeatures(participants: Participant[]): string | null {
    if (!participants || participants.length === 0) {
      return null;
    }
    const hasAR = participants.some(p => !!p?.areDetails);
    const hasUBI = participants.some(p => !!p?.snapshotDetails);
    if (hasAR && hasUBI) {
      return "AR/UBI";
    } else if (hasAR) {
      return "AR";
    } else if (hasUBI) {
      return "UBI";
    }
    return null;
  }

  clearSearch(): void {
    this.policyNumber = "";
    this.hasSearched = false;
    this.searchedPolicyNumber = null;
    this.policyFeatures = null;
    this.results = [];
  }
}

export interface MobileRegistration {
  telematicsId: string;
  mobilePhone: string;
  features: string;
  registrationStatus: string;
}
