using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Progressive.FeatureFlags;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration.GetRegistrationResponse;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    [ApiController]
    [Route("api/customerService/[controller]")]
    [Produces("application/json")]
    public class RolesController : ControllerBase
    {
        IUserManagementService _userService;
        IHttpContextAccessor _contextAccessor;
        IRolloutHelper _rolloutHelper;
        IFlagManager _flagManager;
        ILogger<RolesController> _logger;

        public RolesController(IUserManagementService userService, IHttpContextAccessor contextAccessor, IRolloutHelper rolloutHelper, IFlagManager flagManager, ILogger<RolesController> logger)
        {
            _userService = userService;
            _contextAccessor = contextAccessor;
            _rolloutHelper = rolloutHelper;
            _flagManager = flagManager;
            _logger = logger;
        }

        [HttpGet]
        public async Task<UserInfo> GetUserRoles()
        {
            string name = _userService.GetUserFullName().Result;
            RolloutStatus rolloutStatus = RolloutStatus.Ready;

            try
            {
                string hashedName = HashWithSha256(name);

                HashedNameEntity flagrEntity = new HashedNameEntity(hashedName);
                IEvaluationContext entityContext = _flagManager.AddEntity(flagrEntity);
                entityContext.AddContext("hashedName", hashedName);

                rolloutStatus = await _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminDisplaySearchFeatureSwitchProduct>(flagrEntity);

                _logger.LogInformation(
                    LoggingEvents.RolloutStatusResult,
                    "Rollout status for CMDR_TmxAdminDisplaySearch_FeatureSwitch_Product is {RolloutStatus}",
                    rolloutStatus.ToString());
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error while evaluating rollout status for user {UserName}", name);
            }


            return new UserInfo
            {
                Name = name,
                LanId = _contextAccessor.HttpContext.User.Identity.Name,
                HasEligibilityAccess = isInRole(UserAccess.Eligibility),
                HasInsertInitialParticipationScoreInProcessAccess = isInRole(UserAccess.InsertInitialParticipationScoreInProcess),
                HasOptOutSuspensionAccess = isInRole(UserAccess.OptOutSuspension),
                HasPolicyMergeAccess = isInRole(UserAccess.PolicyMerge),
                HasResetEnrollmentAccess = isInRole(UserAccess.ResetEnrollment),
                HasStopShipmentAccess = isInRole(UserAccess.StopShipment),
                HasUpdatePProGuidAccess = isInRole(UserAccess.UpdatePProGuid),
                HasVehicleSupportAccess = isInRole(UserAccess.VehicleSupport),
                IsInMobileRegistrationAdminRole = isInRole(UserRoles.MobileRegistrationAdmin),
                IsInOpsAdminRole = isInRole(UserRoles.OpsAdmin),
                IsInOpsUserRole = isInRole(UserRoles.OpsUser),
                IsInSupportAdminRole = isInRole(UserRoles.SupportAdmin),
                IsInTheftRole = isInRole(UserRoles.Theft),
                IsInFeeReversalRole = isInRole(UserRoles.FeeReversal),
                IsInAppChangeRole = isInRole(UserRoles.ChangeAppAssignment),
                IsCommercialLineRole = isInRole(UserRoles.CommercialLineRole),
                IsInMobileRegSearchPilot = rolloutStatus == RolloutStatus.Ready ? false : true
            };
        }

        private static string HashWithSha256(string input)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input ?? string.Empty));
            return Convert.ToHexString(bytes);
        }

        bool isInRole(UserRoles role)
        {
            return isInRole(role.ToString());
        }

        bool isInRole(UserAccess role)
        {
            return isInRole(role.ToString());
        }

        bool isInRole(string role)
        {
            return HttpContext.User.IsInRole($"/role/{role}");
        }
    }
}
