using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Resources.Shared;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;
using System;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Services.Database
{
    [SingletonService]
    public interface IHomebaseDAL
    {
        Task<bool> UpdateMobileRegistration(Registration registration);
        Task<Registration> GetRegistration(int seqId);
        Task<int?> GetDeviceSeqIdAsync(Guid mobileIdentifier);
        Task<Guid?> GetParticipantExternalIdAsync(Guid mobileIdentifier);


        Task<DeviceDetails?> GetDeviceDetailsAsync(int seqId);
        Task<string> GetUspsShipTrackingNumberByOrderSeqId(int orderSeqId);
        Task<int?> GetMobileRegistrationSeqIdAsync(string participantExternalId);

	}

    public class HomebaseDAL : DbContext, IHomebaseDAL
    {
        public HomebaseDAL(
            ILogger<HomebaseDAL> logger,
            IOptions<ConnectionStringsConfig> config,
            IOptions<EnvironmentPrefixes> envConfig
        )
            : base(logger, envConfig.Value.SQL, config.Value.Homebase) { }

        public async Task<bool> UpdateMobileRegistration(Registration registration)
        {
            var query =
                @"UPDATE MobileRegistration 
							SET VehicleExternalId=@vehicleExternalId, 
								MobileChallengeCode=@mobileChallengeCode, 
								MobileAPITokenId=@mobileApiTokenId, 
								ChallengeRequestCount=@challengeRequestCount, 
								ChallengeExpirationDateTime=@challengeExpirationDateTime, 
								MobileRegistrationStatusCode=@mobileRegistrationStatusCode, 
								LastChangeDateTime=@lastChangeDateTime 
							WHERE MobileRegistrationSeqId=@mobileRegistrationSeqId";
            var parms = new
            {
                mobileRegistrationSeqId = registration.MobileRegistrationSeqId,
                mobileRegistrationStatusCode = registration.MobileRegistrationStatusCode,
                challengeExpirationDateTime = registration.ChallengeExpirationDateTime,
                challengeRequestCount = registration.ChallengeRequestCount,
                mobileChallengeCode = registration.MobileChallengeCode,
                mobileApiTokenId = registration.MobileApiTokenId,
                vehicleExternalId = registration.VehicleExternalId,
                lastChangeDateTime = registration.LastChangeDateTime
            };

            var result = await ExecuteQueryAsync<dynamic>(query, parms);
            return result != null ? true : false;
        }

        public async Task<Registration> GetRegistration(int seqId)
        {
            var query =
                @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                    
                    SELECT 
					MobileRegistrationSeqId,
					GroupExternalId,
					ParticipantExternalId,
					VehicleExternalId,
					DriverExternalId,
					MobileDeviceId,
					ProgramCode,
					MobileRegistrationCode,
					MobileChallengeCode,
					MobileAPITokenId,
					ChallengeRequestCount,
					ChallengeExpirationDateTime,
					MobileRegistrationStatusCode,
					CreateDateTime,
					LastChangeDateTime,
					MobileReregisteredInd,
					MobileLastRegistrationDateTime
				FROM MobileRegistration WHERE MobileRegistrationSeqId=@mobileRegistrationSeqId";
            var parms = new { mobileRegistrationSeqId = seqId };

            var result = await ExecuteQueryAsync<Registration>(query, parms);
            return result.ToList().FirstOrDefault();
        }

        public async Task<Guid?> GetParticipantExternalIdAsync(Guid mobileIdentifier)
        {
            var query =
                @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                
                SELECT 
					ParticipantExternalId
				FROM MobileRegistration WHERE MobileDeviceId = @mobileIdentifierId";
            var parms = new { mobileIdentifierId = mobileIdentifier.ToString() };

            var result = await ExecuteQueryAsync<Guid?>(query, parms);
            return result.FirstOrDefault();
        }

        public async Task<int?> GetDeviceSeqIdAsync(Guid mobileIdentifier)
        {
            var query =
                @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

                    select DeviceSeqId 
                    from MobileDevice 
					WHERE DeviceIdentifier=@mobileIdentifierId";
            var parms = new { mobileIdentifierId = mobileIdentifier.ToString() };

            var result = await ExecuteQueryAsync<int?>(query, parms);
            return result.FirstOrDefault();
        }


        public async Task<DeviceDetails?> GetDeviceDetailsAsync(int seqId)
        {
            var props = String.Join(
                ",",
                new DeviceDetails()
                    .GetType()
                    .GetProperties()
                    .Where(x => x.Name != "Extenders" && x.Name != "Messages")
                    .Select(pi => pi.Name)
                    .ToList()
            );
            var query =
                @$"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

                    select DeviceSeqID,DeviceSerialNumber,xv.CreateDateTime as CreateDateTime,SIM,ShipDateTime,FirstContactDateTime,
					LastContactDateTime,LastUploadDateTime,VersionCode,ProgramCode,TargetFirmwareSetCode,
					ConfigurationFirmwareTypeVersionCode,OBD2FirmwareTypeVersionCode,CellFirmwareTypeVersionCode,
					GPSFirmwareTypeVersionCode,MainFirmwareTypeVersionCode,ReportedVIN,WTFStateInfo,ManufacturerLotSeqID,
					ReturnLotSeqID,IsDataCollectionAllowed,IsSimActive,IsDBImportAllowed,IsCommunicationAllowed,
					StatusCode,BenchTestStatusCode,BinaryTransferInfo,CurrentAudioVolume,TargetAudioVolume,LocationCode,
					ReportedProtocolCode,LastRemoteResetDateTime,IMEI,RMALotSeqID,InventoryLotSeqID,IsRefurbished,
					xv.LastChangeDateTime  as LastChangeDateTime,GPSCollectionTypeCode,[Description] 
					from  XirgoVersion xv  join  XirgoDevice xd ON xd.VersionCode = xv.Code
				where DeviceSeqId = @DeviceSeqId
				";
            var parms = new { DeviceSeqId = seqId };

            var result = await ExecuteQueryAsync<DeviceDetails>(query, parms);

            return result?.FirstOrDefault();
        }

        public async Task<string> GetUspsShipTrackingNumberByOrderSeqId(int orderSeqId)
        {
            var orderSeqIdTable = new DataTable();
            orderSeqIdTable.Columns.Add("OrderSeqId", typeof(int));
            orderSeqIdTable.Rows.Add(orderSeqId);

            var parameters = new DynamicParameters();
            parameters.Add(
                "@Parm_OrderSeqIdTableValuedParameter",
                orderSeqIdTable.AsTableValuedParameter("dbo.OrderSeqIdTableType")
            );

            var result = await ExecuteStoredProcedureAsync<TrackingNumber>(
                "dbo.usp_TrackingNumber_SelectByOrderSeqId_WithShipTracking", parameters);

            // Order by TrackingNumberSeqId and return the last UspsShipTrackingNumber
            return result?
                .OrderBy(x => x.TrackingNumberSeqId)
                .LastOrDefault()?.UspsShipTrackingNumber;
        }

		public async Task<int?> GetMobileRegistrationSeqIdAsync(string participantExternalId)
		{
			var query =
					@"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                
                SELECT 
					MobileRegistrationSeqId
				FROM MobileRegistration WHERE ParticipantExternalId = @participantExternalId";
			var parms = new { participantExternalId };

			var result = await ExecuteQueryAsync<int?>(query, parms);
			return result?.FirstOrDefault();
		}
	}
}
