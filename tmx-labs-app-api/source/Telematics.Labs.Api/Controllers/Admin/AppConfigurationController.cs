using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.Configuration;
using Progressive.Telematics.Labs.Business.Resources.Resources.Configuration;

namespace Progressive.Telematics.Labs.Api.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AppConfigurationController : ControllerBase
{
    private readonly IAppConfigurationOrchestrator _orchestrator;

    public AppConfigurationController(IAppConfigurationOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    /// <summary>
    /// Gets application configuration by server name, application code, and slot name
    /// </summary>
    /// <param name="serverName">The server name</param>
    /// <param name="applicationCode">The application code</param>
    /// <param name="slotName">The slot name (e.g., "Production", "QA", "Development")</param>
    /// <returns>Application configuration settings</returns>
    [HttpGet("ByCode")]
    public async Task<ActionResult<AppConfigurationModel>> GetAppConfigByCode(
        [FromQuery] string serverName,
        [FromQuery] int applicationCode,
        [FromQuery] string slotName)
    {
        if (string.IsNullOrWhiteSpace(serverName))
            return BadRequest("Server name is required");

        if (string.IsNullOrWhiteSpace(slotName))
            return BadRequest("Slot name is required");

        var result = await _orchestrator.GetAppConfiguration(serverName, applicationCode, slotName);
        return Ok(result);
    }

    /// <summary>
    /// Gets application configuration by server name, application name, and slot name
    /// </summary>
    /// <param name="serverName">The server name</param>
    /// <param name="applicationName">The application name</param>
    /// <param name="slotName">The slot name (e.g., "Production", "QA", "Development")</param>
    /// <returns>Application configuration settings</returns>
    [HttpGet("ByName")]
    public async Task<ActionResult<AppConfigurationModel>> GetAppConfigByName(
        [FromQuery] string serverName,
        [FromQuery] string applicationName,
        [FromQuery] string slotName)
    {
        if (string.IsNullOrWhiteSpace(serverName))
            return BadRequest("Server name is required");

        if (string.IsNullOrWhiteSpace(applicationName))
            return BadRequest("Application name is required");

        if (string.IsNullOrWhiteSpace(slotName))
            return BadRequest("Slot name is required");

        var result = await _orchestrator.GetAppConfigurationByName(serverName, applicationName, slotName);
        return Ok(result);
    }
}
