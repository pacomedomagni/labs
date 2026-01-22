import { AccountParticipantSummary, AccountVehicleSummary, AccountDeviceSummary, AccountDriverSummary } from "src/app/shared/data/participant/resources";

export const EMPTY_PARTICIPANT: AccountParticipantSummary = {
    participantSeqID: null,
    participantExternalID: null,
    participantId: null,
    participantStatusCode: null,
    participantGroupSeqID: null,
    deviceSeqID: null,
    lastUpdateDateTime: null,
    scoringAlgorithmCode: null,
    participantCreateDateTime: null,
};

export const EMPTY_VEHICLE: AccountVehicleSummary = {
    year: null,
    make: null,
    model: null,
    vin: null,
};

export const EMPTY_DEVICE: AccountDeviceSummary = {
    deviceExperienceTypeCode: null,
    deviceSeqID: null,
    deviceReturnReasonCode: null,
    deviceAbandonedDateTime: null,
    deviceReceivedDateTime: null,
    deviceShipDateTime: null,
    firstContactDateTime: null,
    lastContactDateTime: null,
    lastUploadDateTime: null,
    deviceStatusCode: null,
    deviceLocationCode: null,
    deviceTypeDescription: null,
    deviceSerialNumber: null,
    sim: null,
    deviceManufacturer: null,
    reportedVIN: null,
};

export const EMPTY_DRIVER: AccountDriverSummary = {
    nickname: null,
    driverExternalId: null,
};