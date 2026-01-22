using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ILabsMyScoreDeviceDAL
    {
        Task<IEnumerable<HomebaseDeviceDataModel>> GetDevicesBySeqIds(IEnumerable<int> deviceSeqIds);
        Task<IEnumerable<HomebaseDeviceDataModel>> GetDevicesBySerialNumbers(IEnumerable<string> serialNumbers);
    }

    public class LabsMyScoreDeviceDal : DbContext, ILabsMyScoreDeviceDAL
    {
        public LabsMyScoreDeviceDal(
            ILogger<LabsMyScoreDeviceDal> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.LabsHomebase)
        {
        }

        public async Task<IEnumerable<HomebaseDeviceDataModel>> GetDevicesBySeqIds(IEnumerable<int> deviceSeqIds)
        {
            var ids = (deviceSeqIds ?? Enumerable.Empty<int>())
                .Distinct()
                .ToArray();

            if (ids.Length == 0)
            {
                return Enumerable.Empty<HomebaseDeviceDataModel>();
            }

            const string deviceStoredProc = "dbo.usp_XirgoDevice_SelectByPrimaryKey";
            const string versionStoredProc = "dbo.usp_XirgoVersion_SelectByPrimaryKey";

            var devices = new List<HomebaseDeviceDataModel>(ids.Length);

            foreach (var deviceSeqId in ids)
            {
                var record = (await ExecuteStoredProcedureAsync<XirgoDeviceRecord>(deviceStoredProc, new
                {
                    Parm_DeviceSeqID = deviceSeqId
                }))?.FirstOrDefault();
                if (record == null)
                {
                    continue;
                }

                var manufacturer = record.DeviceManufacturer ?? record.Manufacturer;
                var typeDescription = record.DeviceTypeDescription ?? record.DeviceVersion;

                if ((string.IsNullOrWhiteSpace(manufacturer) || string.IsNullOrWhiteSpace(typeDescription)) && record.VersionCode.HasValue)
                {
                    var version = (await ExecuteStoredProcedureAsync<XirgoVersionRecord>(versionStoredProc, new
                    {
                        Parm_Code = record.VersionCode.Value
                    }))?.FirstOrDefault();

                    if (version != null)
                    {
                        if (string.IsNullOrWhiteSpace(manufacturer))
                        {
                            manufacturer = version.DeviceManufacturer;
                        }

                        if (string.IsNullOrWhiteSpace(typeDescription))
                        {
                            typeDescription = version.Description ?? version.DeviceVersion;
                        }
                    }
                }

                if (string.IsNullOrWhiteSpace(typeDescription) && !string.IsNullOrWhiteSpace(record.DeviceVersion))
                {
                    typeDescription = record.DeviceVersion;
                }

                devices.Add(new HomebaseDeviceDataModel
                {
                    DeviceSeqID = record.DeviceSeqID,
                    DeviceSerialNumber = record.DeviceSerialNumber,
                    SIM = record.SIM,
                    DeviceStatusCode = record.DeviceStatusCode ?? record.StatusCode,
                    DeviceLocationCode = record.DeviceLocationCode ?? record.LocationCode,
                    DeviceManufacturer = manufacturer,
                    DeviceTypeDescription = typeDescription,
                    ReportedVIN = record.ReportedVIN ?? record.DeviceReportedVIN,
                    DeviceShipDateTime = record.DeviceShipDateTime ?? record.ShipDateTime,
                    FirstContactDateTime = record.FirstContactDateTime,
                    LastContactDateTime = record.LastContactDateTime,
                    LastUploadDateTime = record.LastUploadDateTime,
                });
            }

            return devices;
        }

        public async Task<IEnumerable<HomebaseDeviceDataModel>> GetDevicesBySerialNumbers(IEnumerable<string> serialNumbers)
        {
            var nums = (serialNumbers ?? Enumerable.Empty<string>())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim())
                .Distinct()
                .ToArray();

            if (nums.Length == 0)
            {
                return Enumerable.Empty<HomebaseDeviceDataModel>();
            }

            const string deviceStoredProc = "dbo.usp_XirgoDevice_SelectBySerialNumber";

            var devices = new List<HomebaseDeviceDataModel>(nums.Length);
            foreach (var serial in nums)
            {
                var record = (await ExecuteStoredProcedureAsync<XirgoDeviceRecord>(deviceStoredProc, new
                {
                    Parm_DeviceSerialNumber = serial
                }))?.FirstOrDefault();

                if (record == null)
                {
                    continue;
                }

                devices.Add(new HomebaseDeviceDataModel
                {
                    DeviceSeqID = record.DeviceSeqID,
                    DeviceSerialNumber = record.DeviceSerialNumber,
                    SIM = record.SIM,
                    DeviceStatusCode = record.DeviceStatusCode ?? record.StatusCode,
                    DeviceLocationCode = record.DeviceLocationCode ?? record.LocationCode,
                    DeviceManufacturer = record.DeviceManufacturer ?? record.Manufacturer,
                    DeviceTypeDescription = record.DeviceTypeDescription ?? record.DeviceVersion,
                    ReportedVIN = record.ReportedVIN ?? record.DeviceReportedVIN,
                    DeviceShipDateTime = record.DeviceShipDateTime ?? record.ShipDateTime,
                    FirstContactDateTime = record.FirstContactDateTime,
                    LastContactDateTime = record.LastContactDateTime,
                    LastUploadDateTime = record.LastUploadDateTime,
                });
            }

            return devices;
        }

        private sealed class XirgoDeviceRecord
        {
            public int DeviceSeqID { get; set; }
            public string DeviceSerialNumber { get; set; }
            public string SIM { get; set; }
            public int? StatusCode { get; set; }
            public int? DeviceStatusCode { get; set; }
            public int? LocationCode { get; set; }
            public int? DeviceLocationCode { get; set; }
            public string DeviceManufacturer { get; set; }
            public string Manufacturer { get; set; }
            public string DeviceTypeDescription { get; set; }
            public string DeviceVersion { get; set; }
            public int? VersionCode { get; set; }
            public string ReportedVIN { get; set; }
            public string DeviceReportedVIN { get; set; }
            public DateTime? DeviceShipDateTime { get; set; }
            public DateTime? ShipDateTime { get; set; }
            public DateTime? FirstContactDateTime { get; set; }
            public DateTime? LastContactDateTime { get; set; }
            public DateTime? LastUploadDateTime { get; set; }
        }

        private sealed class XirgoVersionRecord
        {
            public int Code { get; set; }
            public string DeviceManufacturer { get; set; }
            public string DeviceVersion { get; set; }
            public string Description { get; set; }
        }
    }
}
