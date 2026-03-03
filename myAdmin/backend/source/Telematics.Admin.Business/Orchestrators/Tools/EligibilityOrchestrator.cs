using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.Tools
{
    [SingletonService]
    public interface IEligibilityOrchestrator
    {
        Task<List<WcfEligibleZipCodesService.EligibleZipCode>> GetEligibleZipCodes(States? state = null, string zipCode = "");
        Task<PagedList<WcfIneligibleVehiclesService.IneligibleVehicle>> GetIneligibleVehicles(string year = "", string make = "", string model = "", int? page = null, int? pageSize = null);
    }

    public class EligibilityOrchestrator : IEligibilityOrchestrator
    {
        IEligibleZipCodesService _zipCodeService;
        IIneligibleVehiclesService _ineligibleVehiclesService;

        public EligibilityOrchestrator(IEligibleZipCodesService zipCodeService, IIneligibleVehiclesService ineligibleVehiclesService)
        {
            _zipCodeService = zipCodeService;
            _ineligibleVehiclesService = ineligibleVehiclesService;
        }

        public async Task<List<WcfEligibleZipCodesService.EligibleZipCode>> GetEligibleZipCodes(States? state = null, string zipCode = "")
        {
            var data = await _zipCodeService.GetEligibleZipCodes(state, zipCode);
            return data.EligibleZipCodes.ToList();
        }

        public async Task<PagedList<WcfIneligibleVehiclesService.IneligibleVehicle>> GetIneligibleVehicles(string year = "", string make = "", string model = "", int? page = null, int? pageSize = null)
        {
            var response = await _ineligibleVehiclesService.GetIneligibleVehicles(year, make, model);
            if (response.IneligibleVehicles == null)
                response.IneligibleVehicles = new WcfIneligibleVehiclesService.IneligibleVehicle[0];
            var filtered = response.IneligibleVehicles.GroupBy(x => x.YMM.ToUpper()).Select(x => x.First());
            var data = filtered.GetPage(page ?? 0, pageSize ?? response.IneligibleVehicles.Length);
            return data;
        }
    }
}
