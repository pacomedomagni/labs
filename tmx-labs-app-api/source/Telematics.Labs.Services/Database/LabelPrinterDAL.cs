using Azure.Core;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ILabelPrinterDAL
    {
        Task<IEnumerable<LabelPrinter>> GetLabelPrinters();
        Task<LabelPrinter> GetLabelPrinterConfigurationByName(string printerName);
    }
    public class LabelPrinterDAL : DbContext, ILabelPrinterDAL
    {
        public LabelPrinterDAL(
            ILogger<LabelPrinterDAL> logger,
            IOptions<ConnectionStringsConfig> connectionStrings,
            IOptions<EnvironmentPrefixes> envConfig)
            : base(logger, envConfig.Value.SQL, connectionStrings.Value.Configuration)
        {
        }
        public async Task<IEnumerable<LabelPrinter>> GetLabelPrinters()
        {
            const string storedProc = "dbo.usp_LablePrinter_GetActiveLabelPrinters";

            return await ExecuteStoredProcedureAsync<LabelPrinter>(storedProc, null);
        }

        public async Task<LabelPrinter> GetLabelPrinterConfigurationByName(string printerName)
        {
            const string storedProc = "dbo.usp_LablePrinter_GetLabelPrinterConfiguration";
            var parameters = new DynamicParameters();
            parameters.Add("@Parm_PrinterName", printerName, DbType.String);

            var result = await ExecuteStoredProcedureAsync<LabelPrinter>(storedProc, parameters);
            return result.FirstOrDefault();
        }
    }
}
