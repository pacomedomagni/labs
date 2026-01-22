export interface ContactDetailsModel {
  participantGroupTypeCode: number;
  participantGroupSeqID: number;
  email: string;
  userName: string;
  isAbleToEnroll: boolean;
  isCustomer: boolean;
  address: string;
  city: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  phoneAreaCode: string;
  phoneFirstThree: string;
  phoneLastFour: string;
  state: string;
  zip: string;
  participantId: string;
  mustEnrollIntoOwnGroup: boolean;
  currentUserParticipantGroup: number | null;
}

export interface AddAccountRequest {
    address: string;
    city: string;
    company?: string | null;
    driversVehicles: AddAccountDriverVehicleInformation[];
    firstName?: string | null;
    fullName: string;
    lastName: string;
    password?: string | null;
    passwordAnswer?: string | null;
    passwordQuestion?: string | null;
    phoneNumber?: string | null;
    state: string;
    userName: string;
    zip: string;
}

export interface AddAccountResponse {
    deviceOrderSeqIDs: number[];
    participantGroupExternalKey: string;
    participantGroupSeqID: number;
}

export interface AddAccountDriverVehicleInformation {
    vehicle: AddVehicleModel;
    scoringAlgorithmCode: number;
}

export interface AddVehicleModel {
    year: number;
    make: string;
    model: string;
    vin: string;
}