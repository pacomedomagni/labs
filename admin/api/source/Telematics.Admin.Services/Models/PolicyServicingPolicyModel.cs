using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class PolicyServicingPolicy
    {
        [JsonPropertyName("corePolicyDetails")]
        public CorePolicyDetails CorePolicyDetails { get; set; }
    }

    public class CorePolicyDetails
    {
        [JsonPropertyName("insuredFirstName")]
        public string InsuredFirstName { get; set; }
        [JsonPropertyName("insuredLastName")]
        public string InsuredLastName { get; set; }
        [JsonPropertyName("isNamedOperator")]
        public bool IsNamedOperator { get; set; }
        [JsonPropertyName("policyStatus")]
        public string PolicyStatus { get; set; }
        [JsonPropertyName("productCode")]
        public string ProductCode { get; set; }
        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }
        [JsonPropertyName("stateCode")]
        public string StateCode { get; set; }
        [JsonPropertyName("street")]
        public string Street { get; set; }
        [JsonPropertyName("street2")]
        public string Street2 { get; set; }
        [JsonPropertyName("city")]
        public string City { get; set; }
        [JsonPropertyName("insuredStateCode")]
        public string InsuredStateCode { get; set; }
        [JsonPropertyName("zip")]
        public string Zip { get; set; }
        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; }
        [JsonPropertyName("riskTypeCode")]
        public string RiskTypeCode { get; set; }
        [JsonPropertyName("policyEffectiveDate")]
        public string PolicyEffectiveDate { get; set; }
        [JsonPropertyName("policyExpirationDate")]
        public string PolicyExpirationDate { get; set; }
        [JsonPropertyName("policyRenewalCounter")]
        public string PolicyRenewalCounter { get; set; }
        [JsonPropertyName("policyInfoKey")]
        public string PolicyInfoKey { get; set; }
        [JsonPropertyName("policySuffix")]
        public string PolicySuffix { get; set; }
        [JsonPropertyName("channel")]
        public string Channel { get; set; }
        [JsonPropertyName("insurerCompanyName")]
        public string InsurerCompanyName { get; set; }
        [JsonPropertyName("insurerCompanyStreetAddress")]
        public string InsurerCompanyStreetAddress { get; set; }
        [JsonPropertyName("insurerCompanyState")]
        public string InsurerCompanyState { get; set; }
        [JsonPropertyName("insurerCompanyCity")]
        public string InsurerCompanyCity { get; set; }
        [JsonPropertyName("insurerCompanyZip")]
        public string InsurerCompanyZip { get; set; }
        [JsonPropertyName("naicCode")]
        public string NaicCode { get; set; }
        [JsonPropertyName("renewalEffectiveDate")]
        public string RenewalEffectiveDate { get; set; }
        [JsonPropertyName("renewalExpirationDate")]
        public string RenewalExpirationDate { get; set; }
        [JsonPropertyName("supportsProgressiveVehicleProtection")]
        public bool SupportsProgressiveVehicleProtection { get; set; }
        [JsonPropertyName("phoneNumbers")]
        public PhoneNumber[] PhoneNumbers { get; set; }
        [JsonPropertyName("vehicles")]
        public PolicyServicingVehicle[] Vehicles { get; set; }
        [JsonPropertyName("drivers")]
        public PolicyServicingDriver[] Drivers { get; set; }
        [JsonPropertyName("termDetail")]
        public TermDetail[] TermDetail { get; set; }
    }

    public class PhoneNumber
    {
        [JsonPropertyName("type")]
        public string Type { get; set; }
        [JsonPropertyName("number")]
        public string Number { get; set; }
    }

    public class PolicyServicingVehicle
    {
        [JsonPropertyName("vehicleId")]
        public string VehicleId { get; set; }
        [JsonPropertyName("year")]
        public string Year { get; set; }
        [JsonPropertyName("make")]
        public string Make { get; set; }
        [JsonPropertyName("model")]
        public string Model { get; set; }
        [JsonPropertyName("vin")]
        public string Vin { get; set; }
        [JsonPropertyName("comprehensiveLineCoverageLimit")]
        public string ComprehensiveLineCoverageLimit { get; set; }
        [JsonPropertyName("isVehicleTrailer")]
        public bool IsVehicleTrailer { get; set; }
        [JsonPropertyName("hasComprehensiveCoverage")]
        public bool HasComprehensiveCoverage { get; set; }
        [JsonPropertyName("hasCollisionCoverage")]
        public bool HasCollisionCoverage { get; set; }
        [JsonPropertyName("vehicleUbiParticipantId")]
        public string VehicleUbiParticipantId { get; set; }
    }

    public class PolicyServicingDriver
    {
        [JsonPropertyName("driverId")]
        public string DriverId { get; set; }
        [JsonPropertyName("status")]
        public string Status { get; set; }
        [JsonPropertyName("relationship")]
        public string Relationship { get; set; }
        [JsonPropertyName("fullName")]
        public object FullName { get; set; }
        [JsonPropertyName("firstName")]
        public string FirstName { get; set; }
        [JsonPropertyName("lastName")]
        public string LastName { get; set; }
        [JsonPropertyName("sex")]
        public string Sex { get; set; }
        [JsonPropertyName("maritalStatus")]
        public string MaritalStatus { get; set; }
        [JsonPropertyName("isSecondaryNamedInsured")]
        public bool IsSecondaryNamedInsured { get; set; }
        [JsonPropertyName("driverLicenseStatus")]
        public string DriverLicenseStatus { get; set; }
        [JsonPropertyName("driverUbiParticipantId")]
        public string DriverUbiParticipantId { get; set; }

    }

    public class TermDetail
    {
        [JsonPropertyName("termRenewalCount")]
        public string TermRenewalCount { get; set; }
        [JsonPropertyName("termStatusCode")]
        public string TermStatusCode { get; set; }
        [JsonPropertyName("termEffectiveDate")]
        public string TermEffectiveDate { get; set; }
        [JsonPropertyName("termExpirationDate")]
        public string TermExpirationDate { get; set; }
        [JsonPropertyName("termKey")]
        public string TermKey { get; set; }
        [JsonPropertyName("termRateRevisionId")]
        public string TermRateRevisionId { get; set; }
    }

}
