using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database
{
    [SingletonService]
    public interface ILabelPrinterDAL
    {
        Task<IEnumerable<LabelPrinter>> GetLabelPrinters();
        
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
    }
}
