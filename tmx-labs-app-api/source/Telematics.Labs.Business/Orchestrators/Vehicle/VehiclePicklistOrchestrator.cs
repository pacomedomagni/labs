using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Vehicle;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Vehicle;

[SingletonService]
public interface IVehiclePicklistOrchestrator
{
    Task<VehicleModelYearsResponse> GetModelYears();
    Task<ScoringAlgorithmResponse> GetOBDScoringAlgorithms();
    Task<VehicleMakesResponse> GetVehicleMakes(string year);
    Task<VehicleModelsResponse> GetVehicleModels(string year, string make);
}

public class VehiclePicklistOrchestrator : IVehiclePicklistOrchestrator
{
    // OBD port became standard in 1996
    private const int MIN_MODEL_YEAR_INCLUSIVE = 1996;

    private readonly IVinPicklistService _vinPicklistService;
    private readonly IScoringAlgorithmDAL _scoringAlgorithmDAL;
    private readonly ILogger<VehiclePicklistOrchestrator> _logger;
    public VehiclePicklistOrchestrator(IVinPicklistService vinPicklistService, IScoringAlgorithmDAL scoringAlgorithmDAL, ILogger<VehiclePicklistOrchestrator> logger)
    {
        _vinPicklistService = vinPicklistService;
        _scoringAlgorithmDAL = scoringAlgorithmDAL;
        _logger = logger;
    }

    public async Task<VehicleModelYearsResponse> GetModelYears()
    {
        try
        {
            var yearsResponse = await _vinPicklistService.GetVehicleYears();

            var filteredYears = (yearsResponse?.ModelYear ?? Array.Empty<string>())
                .Select(y =>
                {
                    bool parsed = int.TryParse(y, out int yearInt);
                    return (parsed, yearInt, y);
                })
                .Where(t => t.parsed && t.yearInt >= MIN_MODEL_YEAR_INCLUSIVE)
                .Select(t => t.y)
                .ToArray();

            return new VehicleModelYearsResponse
            {
                ModelYear = filteredYears
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.VehiclePicklistOrchestrator_GetModelYears_Error, ex,
                "Failed to get vehicle model years");
            throw;
        }
    }

    public async Task<VehicleMakesResponse> GetVehicleMakes(string year)
    {
        try
        {
            var makesResponse = await _vinPicklistService.GetVehicleMakes(year);

            return new VehicleMakesResponse
            {
                Makes = makesResponse?.Makes ?? Array.Empty<string>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.VehiclePicklistOrchestrator_GetVehicleMakes_Error, ex,
                "Failed to get vehicle makes for year {Year}", year);
            throw;
        }
    }

    public async Task<VehicleModelsResponse> GetVehicleModels(string year, string make)
    {
        try
        {
            var modelsResponse = await _vinPicklistService.GetVehicleModels(year, make);

            return new VehicleModelsResponse
            {
                Models = modelsResponse?.Models ?? Array.Empty<string>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.VehiclePicklistOrchestrator_GetVehicleModels_Error, ex,
                "Failed to get vehicle models for year {Year} and make {Make}", year, make);
            throw;
        }
    }

    public async Task<ScoringAlgorithmResponse> GetOBDScoringAlgorithms()
    {
        try
        {
            var algos = (await _scoringAlgorithmDAL.GetScoringAlgorithms())
                .Select(t => new ScoringAlgorithm()
                {
                    Description = t.Description.Split('/').FirstOrDefault()?.Trim(),
                    Code = t.Code
                })
                .Where(t => !string.IsNullOrEmpty(t.Description))
                .DistinctBy(t => t.Description)
                .OrderBy(t => t.Description)
                .ToArray();

            return new ScoringAlgorithmResponse
            {
                ScoringAlgorithms = algos
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.VehiclePicklistOrchestrator_GetOBDScoringAlgorithms_Error, ex,
                "Failed to get OBD scoring algorithms.");
            throw;
        }
    }
}
