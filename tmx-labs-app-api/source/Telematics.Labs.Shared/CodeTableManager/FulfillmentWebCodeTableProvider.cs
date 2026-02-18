using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using FulfillmentWeb.Shared.CodeTableManager;
using FulfillmentWeb.Shared.CodeTableManager.Models;
using WCFGetCodeTablesService;
using WCFSupportCodeTableService;
using WCFPolicySystemBusinessCodeTablesService;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Extensions;


namespace FulfillmentWeb.Shared
{
    [SingletonService]
    public class FulfillmentWebCodeTableProvider
    {
        #region  Member Variables

        private const int cEXPIRATIONSECONDS = 1000;
        private const string cCODETABLEDATASETKEY = "FULFILLMENTWEBCODETABLEKEY";
        
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;
        
        #endregion  Member Variables

        public FulfillmentWebCodeTableProvider(IMemoryCache cache, IConfiguration configuration)
        {
            _cache = cache;
            _configuration = configuration;
        }

        #region  Methods

        public async Task<CodeTableData> GetCodeTablesAsync()
        {
            return await _cache.GetOrCreateAsync(cCODETABLEDATASETKEY, async entry =>
            {
                var expirationSeconds = GetExpirationSeconds();
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(expirationSeconds);
                
                return await LoadCodeTablesAsync();
            });
        }

        private int GetExpirationSeconds()
        {
            string expirationValue = _configuration["AppSettings:CodeTableManagerExpirationSeconds"];
            
            if (!int.TryParse(expirationValue, out int expirationSeconds))
            {
                expirationSeconds = cEXPIRATIONSECONDS;
            }

            return expirationSeconds;
        }

        private async Task<CodeTableData> LoadCodeTablesAsync()
        {
            var codeTableData = new CodeTableData();
            
            // Load from multiple services
            var policyData = await GetPolicySystemBusinessCodeTablesAsync();
            var trialData = await GetTrialBusinessCodeTablesAsync();
            var supportData = await GetUbiSupportCodeTablesAsync();
            
            // Merge data from all sources
            MergeCodeTables(codeTableData, policyData);
            MergeCodeTables(codeTableData, trialData);
            MergeCodeTables(codeTableData, supportData);
            
            return codeTableData;
        }

        private async Task<DataSet> GetTrialBusinessCodeTablesAsync()
        {
            using var codeTablesService = new GetCodeTablesServiceClient();
            codeTablesService.Endpoint.AddTokenEndpoint(_configuration);
            
            WCFGetCodeTablesService.GetCodeTablesResponse1 response = await codeTablesService.GetCodeTablesAsync();
            if (response.GetCodeTablesResult.ResponseStatus == WCFGetCodeTablesService.ResponseStatus.Success)
            {
                if (response.GetCodeTablesResult.CodeTableDataSet != null)
                {
                    using (var reader = new System.Xml.XmlNodeReader(response.GetCodeTablesResult.CodeTableDataSet))
                    {
                        DataSet tempDs = new DataSet();
                        tempDs.ReadXml(reader);
                        return tempDs;
                    }
                }
            }
            else
            {
                throw new Exception("Failed to retrieve the CodeTables from TrialBusiness");
            }
            
            return new DataSet();
        }

        private async Task<DataSet> GetPolicySystemBusinessCodeTablesAsync()
        {
            using var policyCodeTablesService = new WCFPolicySystemBusinessCodeTablesService.CodeTablesServiceClient();
            policyCodeTablesService.Endpoint.AddTokenEndpoint(_configuration);
            
            WCFPolicySystemBusinessCodeTablesService.GetCodeTablesResponse1 response = await policyCodeTablesService.GetCodeTablesAsync();
            if (response.GetCodeTablesResult.ResponseStatus == WCFPolicySystemBusinessCodeTablesService.ResponseStatus.Success)
            {
                if (response.GetCodeTablesResult.CodeTableDataSet != null)
                {
                    using (var reader = new System.Xml.XmlNodeReader(response.GetCodeTablesResult.CodeTableDataSet))
                    {
                        DataSet tempDs = new DataSet();
                        tempDs.ReadXml(reader);
                        return tempDs;
                    }
                }
            }
            else
            {
                throw new Exception("Failed to retrieve the CodeTables from PolicySystemBusiness");
            }
            
            return new DataSet();
        }

        private async Task<DataSet> GetUbiSupportCodeTablesAsync()
        {
            using var supportCodeTablesService = new WCFSupportCodeTableService.CodeTablesServiceClient();
            supportCodeTablesService.Endpoint.AddTokenEndpoint(_configuration);
            
            WCFSupportCodeTableService.GetResponse response = await supportCodeTablesService.GetAsync();
            if (response.GetResult.ResponseStatus == WCFSupportCodeTableService.ResponseStatus.Success)
            {
                if (response.GetResult.CodeTablesDataSet != null)
                {
                    using (var reader = new System.Xml.XmlNodeReader(response.GetResult.CodeTablesDataSet))
                    {
                        DataSet tempDs = new DataSet();
                        tempDs.ReadXml(reader);
                        return tempDs;
                    }
                }
            }
            else
            {
                throw new Exception("Failed to retrieve the CodeTables from UbiSupport");
            }
            
            return new DataSet();
        }

        private void MergeCodeTables(CodeTableData target, DataSet source)
        {
            // Map CalculatorVersion table
            if (source.Tables.Contains("CalculatorVersion"))
            {
                target.CalculatorVersions.AddRange(
                    source.Tables["CalculatorVersion"].AsEnumerable()
                        .Select(row => new CalculatorVersion
                        {
                            Product = row.Field<string>("Product"),
                            State = row.Field<string>("State"),
                            RateRevision = row.Field<string>("RateRevision"),
                            Channel = row.Field<string>("Channel"),
                            InputCalculatorVersion = row.Field<string>("InputCalculatorVersion"),
                            DiscountCalculatorVersion = row.Field<string>("DiscountCalculatorVersion"),
                            ValueCalculatorVersion = row.Field<string>("ValueCalculatorVersion"),
                            ParticipationType = row.Field<string>("ParticipationType"),
                            ConnectPercentRequired = row.Field<int?>("ConnectPercentRequired"),
                            AmnestyPercentAllowed = row.Field<int?>("AmnestyPercentAllowed"),
                            ConnectDaysRequired = row.Field<int?>("ConnectDaysRequired"),
                            DisconnectsPerDayAllowed = row.Field<decimal?>("DisconnectsPerDayAllowed"),
                            MonitoringTypeCode = row.Field<int?>("MonitoringTypeCode"),
                            HomeBaseDeviceRuleCode = row.Field<int?>("HomeBaseDeviceRuleCode")
                        })
                );
            }
            
            // Map ProgramRules table
            if (source.Tables.Contains("ProgramRules"))
            {
                target.ProgramRules.AddRange(
                    source.Tables["ProgramRules"].AsEnumerable()
                        .Select(row => new ProgramRules
                        {
                            ProgramRulesSeqID = row.Field<int>("ProgramRulesSeqID"),
                            State = row.Field<string>("State"),
                            ProductCode = row.Field<string>("ProductCode"),
                            ChannelCode = row.Field<string>("ChannelCode"),
                            RateRevisionCode = row.Field<string>("RateRevisionCode"),
                            DeviceVersionSeqID = row.Field<int>("DeviceVersionSeqID")
                        })
                );
            }
            
            // Map XirgoVersion table
            if (source.Tables.Contains("XirgoVersion"))
            {
                target.XirgoVersions.AddRange(
                    source.Tables["XirgoVersion"].AsEnumerable()
                        .Select(row => new XirgoVersion
                        {
                            Code = row.Field<int>("Code"),
                            DeviceManufacturer = row.Field<string>("DeviceManufacturer"),
                            DeviceVersion = row.Field<string>("DeviceVersion"),
                            Description = row.Field<string>("Description"),
                            FeatureSetCode = row.Field<int>("FeatureSetCode"),
                            DefaultFirmwareSetCode = row.Field<int>("DefaultFirmwareSetCode"),
                            CreateDateTime = row.Field<DateTime>("CreateDateTime"),
                            IsActive = row.Field<bool>("IsActive"),
                            DistributorDescription = row.Field<string>("DistributorDescription"),
                            NetworkCarrierCode = row.Field<short?>("NetworkCarrierCode")
                        })
                );
            }
            
            // Map XirgoRule table
            if (source.Tables.Contains("XirgoRule"))
            {
                target.XirgoRules.AddRange(
                    source.Tables["XirgoRule"].AsEnumerable()
                        .Select(row => new XirgoRule
                        {
                            Code = row.Field<int>("Code"),
                            VersionCode = row.Field<int>("VersionCode"),
                            FirmwareSetCode = row.Field<int>("FirmwareSetCode"),
                            AudioVolumeValue = row.Field<int>("AudioVolumeValue"),
                            IsActive = row.Field<bool>("IsActive"),
                            CreateDateTime = row.Field<DateTime>("CreateDateTime")
                        })
                );
            }
            
            // Map StateRateRevisionCode table
            if (source.Tables.Contains("StateRateRevisionCode"))
            {
                target.StateRateRevisionCodes.AddRange(
                    source.Tables["StateRateRevisionCode"].AsEnumerable()
                        .Select(row => new StateRateRevisionCode
                        {
                            State = row.Field<string>("State"),
                            RateRevisionCode = row.Field<string>("RateRevisionCode")
                        })
                );
            }
            
            // Map Restricted2GZipCode table
            if (source.Tables.Contains("Restricted2GZipCode"))
            {
                target.Restricted2GZipCodes.AddRange(
                    source.Tables["Restricted2GZipCode"].AsEnumerable()
                        .Select(row => new Restricted2GZipCode
                        {
                            State = row.Field<string>("State"),
                            ZipCode = row.Field<string>("ZipCode"),
                            IsActive = row.Field<bool>("IsActive"),
                            CreateDateTime = row.Field<DateTime>("CreateDateTime"),
                            NetworkCarrierCode = row.Field<short>("NetworkCarrierCode"),
                            Allow2GDevices = row.Field<bool>("Allow2GDevices")
                        })
                );
            }
        }

        #endregion  Methods

    }
}
