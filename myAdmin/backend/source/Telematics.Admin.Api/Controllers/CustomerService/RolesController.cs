using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Wcf;

namespace Progressive.Telematics.Admin.Api.Controllers.CustomerService
{
    [ApiController]
    [Route("api/customerService/[controller]")]
    [Produces("application/json")]
    public class RolesController : ControllerBase
    {
        IUserManagementService _userService;
        IHttpContextAccessor _contextAccessor;

        public RolesController(IUserManagementService userService, IHttpContextAccessor contextAccessor)
        {
            _userService = userService;
            _contextAccessor = contextAccessor;
        }

        [HttpGet]
        public UserInfo GetUserRoles()
        {
            return new UserInfo
            {
                Name = _userService.GetUserFullName().Result,
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
                IsCommercialLineRole = isInRole(UserRoles.CommercialLineRole)
            };
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
