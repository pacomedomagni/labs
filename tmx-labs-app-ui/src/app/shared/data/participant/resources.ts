import { Resource, TimeSpan } from '../application/resources';
import { VehicleInformation } from '../vehicle/resources';

// Represents a customer
export interface CustomerInfo {
    user?: User | null;
    participantGroup?: ParticipantGroup | null;
    pendingOrdersForCustomer?: boolean | null;
}

// Represents a customer group
export interface ParticipantGroup {
    participantGroupSeqID?: number | null;
    participantGroupSeqId?: number | null;
    createDateTime?: string | null;
}

// Represents a search result for customer and device
export interface CustAndDevSearchResult {
    customer: CustomerInfo;
    participant: ParticipantInfo;
    extenders?: Record<string, unknown>[];
    messages?: Record<string, unknown>;
}

export interface AccountParticipantSummary {
    participantSeqID?: number | null;
    participantExternalID?: string | null;
    participantId?: string | null;
    participantStatusCode?: number | null;
    participantGroupSeqID?: number | null;
    deviceSeqID?: number | null;
    lastUpdateDateTime?: string | null;
    scoringAlgorithmCode?: number | null;
    participantCreateDateTime?: string | null;
    openDeviceOrder?: DeviceOrder | null;
}

export interface DeviceOrder {
    deviceOrderStatusCode: number;
    deviceOrderStatus: string;
    deviceOrderSeqID: number;
}

export interface TripsResponse {
    tripDays: TripDaySummary[];
}
export interface ExcludedDateRange {
    participantSeqId: number;
    rangeStart: string;
    rangeEnd: string;
    description?: string | null;
    createDate: string;
}

export interface TripDetailsGPSResponse {
    tripDetails: TripDetailGPS[];
    tripEvents: TripEvent[];
}

export interface TripEvent {
    latitudeNbr: number;
    longitudeNbr: number;
    description: string;
}

//* Represents a summary of trips on a given day *//
export interface TripDaySummary {
    hardAccels: number;
    tripDay: Date;
    duration: string;
    mileage: number;
    totalDuration: string;
    trips: Trip[];
}

//* Represents a summary of all trips on a given day of the week *//
export interface DayOfWeekTripSummary {
    dayOfWeek: number;
    trips: number;
    duration: TimeSpan;
    mileage: number;
    hardBrakes: number;
    hardAccels: number;
    highRiskSeconds: number;
}

export interface Trip {
    audioOn: boolean;
    createDateTime: string;
    deviceSeqID: number;
    extremeAccelerations: number;
    extremeBrakeHighJerkCount: number;
    extremeBrakeLowJerkCount: number;
    extremeBrakeMedJerkCount: number;
    extremeBrakes: number;
    hardAccelerationV2Count: number;
    hardAccelerations: number;
    hardBrakeV2Count: number;
    hardBrakes: number;
    highRiskSeconds: number;
    idleTime: number;
    maxSpeedKPH: number;
    milesSinceCheckEngineLightReset: number;
    mobileTripID: string | null;
    participantSeqID: number;
    reportedVehicleProtocolCode: number;
    reportedVehicleVIN: string | null;
    riskLevel1ExtremeBrakeCount: number;
    riskLevel1HardBrakeCount: number;
    riskLevel2ExtremeBrakeCount: number;
    riskLevel2HardBrakeCount: number;
    riskLevel3ExtremeBrakeCount: number;
    riskLevel3HardBrakeCount: number;
    timeAboveSpeedCeiling: number;
    timeSpeedBand1: number;
    timeSpeedBand2: number;
    timeSpeedBand3: number;
    tripDurationString: string;
    tripEndDateTime: string;
    tripEndTimeZoneOffsetNbr: number | null;
    tripEndTimestamp: string | null;
    tripKilometers: number;
    tripMiles: number;
    tripSeqID: number;
    tripStartDateTime: string;
    tripStartTimeZoneOffsetNbr: number | null;
    tripStartTimestamp: string | null;
    unreasonableTripCode: number;
    vehicleSeqID: number;
}

export interface TripDetailsForParticipantResponse {
    recordCount: number;
    SpeedDistanceUnit: string;
    TripAndDetails: TripAndDetails[];
}
export interface TripAndDetails {
    trip: Trip;
    tripDetails: TripDetail[];
}
export interface TripDetail {
    elapsedTimeMilliseconds: number;
    speed: number;
}

export interface TripDetailsResponse {
    recordCount: number;
    tripDetails: TripDetail[];
}

export interface DeviceLocationInfo {
	latitude: number;
	locationDate: Date;
	longitude: number;
}

export interface TripDetailGPS {
  tripSeqID: number;
  elapsedTimeMilliseconds: number;
  utcDateTime: Date | null;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  speedGPS: number;
  hdop: number;
  vdop: number;
  horizontalAccuracy: number;
}

export interface User {
    accessType: string; // You may want to define an enum for AccessType
    address: string;
    city: string;
    company: string;
    email: string;
    firstName: string;
    fullName: string;
    lastName: string;
    password: string;
    passwordAnswer: string;
    passwordQuestion: string;
    passwordResetDate: string;
    phoneNumber: string;
    roles: string[];
    state: string;
    uid: string;
    userName: string;
    zip: string;
}

export interface AccountVehicleSummary {
    year?: number | null;
    make?: string | null;
    model?: string | null;
    vin?: string | null;
    vehicleSeqID?: number | null;
}

export interface AccountDeviceSummary {
    deviceExperienceTypeCode?: number | null;
    deviceReturnReasonCode?: number | null;
    deviceAbandonedDateTime?: string | null;
    deviceReceivedDateTime?: string | null;
    deviceSeqID?: number | null;
    deviceShipDateTime?: string | null;
    firstContactDateTime?: string | null;
    lastContactDateTime?: string | null;
    lastUploadDateTime?: string | null;
    deviceStatusCode?: number | null;
    deviceLocationCode?: number | null;
    deviceTypeDescription?: string | null;
    deviceSerialNumber?: string | null;
    sim?: string | null;
    deviceManufacturer?: string | null;
    reportedVIN?: string | null;
    features?: string[] | null;
}

export interface AccountDriverSummary {
    nickname?: string | null;
    driverExternalId?: string | null;
}

export interface AccountSummary {
    accountSeqID?: number | null;
    participant?: AccountParticipantSummary | null;
    vehicle?: AccountVehicleSummary | null;
    device?: AccountDeviceSummary | null;
    driver?: AccountDriverSummary | null;
}

export interface AccountCollectionResponse {
    accounts?: AccountSummary[] | null;
}

// Response for customer search
export interface CustomerSearchResponse {
    customers: CustomerInfo[];
    recordCount: number;
}

// Response for device search
export interface GetCustsByDevSearchResponse {
    recordCount: number;
    searchResults: CustAndDevSearchResult[];
    device: unknown;
}

export interface AddAccountParticipantRequest {
    participantGroupSeqId: number;
    driverVehicleInformation: VehicleInformation;
}

export interface EnrollmentDetails {
    customer: CustomerInfo;
    accounts: AccountSummary[];
}

// Represents a participant
export interface ParticipantInfo extends Partial<Resource> {
    participantSeqID?: number | null;
    participantGroupSeqID?: number | null;
    vehicleSeqID?: number | null;
    participantStatusCode?: number | null;
    scoreCalculatorCode?: number | null;
    lastUpdateDateTime?: string | null;
    createDateTime?: string | null;
    nickname?: string | null;
    deviceSeqID?: number | null;
    scoringAlgorithmCode?: number | null;
    mobileSummarizerVersionCode?: number | null;
    deviceExperienceTypeCode?: number | null;
    driverSeqId?: number | null;
    participantExternalId?: string | null;
    driverExternalId?: string | null;
    participantId?: string | null;
}

export interface UpdateParticipantNicknameRequest extends Partial<Resource> {
    participantSeqID: number;
    nickname?: string | null;
}

export interface UpdateParticipantNicknameResponse extends Partial<Resource> {
    participant?: ParticipantInfo | null;
}

export interface ParticipantOptOutRequest extends Partial<Resource> {
    participantSequenceId: number;
    deviceSerialNumber?: string | null;
}

export interface UpdateVehicleStatusRequest {
    participantSeqId: number;
    isActive: boolean;
}
