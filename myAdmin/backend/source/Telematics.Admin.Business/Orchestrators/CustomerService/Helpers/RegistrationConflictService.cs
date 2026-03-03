using System.Linq;
using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Helpers;

[SingletonService]
public interface IRegistrationConflictService
{
    Task<GetRegistrationConflictsResponse> GetConflictingRegistrations(string registrationCode);
}

public class RegistrationConflictService : IRegistrationConflictService
{
    private readonly IDeviceApi _deviceApi;

    public RegistrationConflictService(IDeviceApi deviceApi)
    {
        _deviceApi = deviceApi;
    }

    public async Task<GetRegistrationConflictsResponse> GetConflictingRegistrations(string registrationCode)
    {
        var registrations = await _deviceApi.GetUnfilteredRegistrations(registrationCode);
        var conflicts = registrations
                            .Where(x =>
                            x.ProgramCode != ProgramCode.Snapshot &&
                            x.MobileRegistrationStatusCode != MobileRegistrationStatus.Inactive &&
                            x.MobileRegistrationStatusCode != MobileRegistrationStatus.PendingResolution)
                            .ToList();
        return new GetRegistrationConflictsResponse.Success { ConflictingRegistrations = conflicts };
    }
}
