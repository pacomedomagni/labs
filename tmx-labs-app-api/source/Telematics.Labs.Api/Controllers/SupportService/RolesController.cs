using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Shared;

namespace Progressive.Telematics.Labs.Api.Controllers.CustomerService
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
                LanId = _contextAccessor.HttpContext?.User?.Identity?.Name ?? "",
                IsLabsUser = IsInRole(Constants.Roles.MyScoreRole),
                IsLabsAdmin = IsInRole(Constants.Roles.LabsAdminRole),
                IsInOpsAdminRole = IsInRole(Constants.Roles.OpsAdmin),
                IsInOpsUserRole = IsInRole(Constants.Roles.OpsUser),
                IsInSupportAdminRole = IsInRole(Constants.Roles.SupportAdmin),
                IsCommercialLineRole = IsInRole(Constants.Roles.CommercialLineRole),
                HasEligibilityAccess = IsInRole(Constants.Roles.Eligibility),
                HasInsertInitialParticipationScoreInProcessAccess = IsInRole(Constants.Roles.InsertInitialParticipationScoreInProcess),
                HasOptOutSuspensionAccess = IsInRole(Constants.Roles.OptOutSuspension),
                HasPolicyMergeAccess = IsInRole(Constants.Roles.PolicyMerge),
                HasResetEnrollmentAccess = IsInRole(Constants.Roles.ResetEnrollment),
                HasStopShipmentAccess = IsInRole(Constants.Roles.StopShipment),
                HasUpdatePProGuidAccess = IsInRole(Constants.Roles.UpdatePProGuid),
                HasVehicleSupportAccess = IsInRole(Constants.Roles.VehicleSupport),
                IsInMobileRegistrationAdminRole = IsInRole(Constants.Roles.MobileRegistrationAdmin),
                IsInTheftOnlyRole = IsInRole(Constants.Roles.TheftOnly),
                IsInTheftRole = IsInRole(Constants.Roles.Theft),
                IsInFeeReversalOnlyRole = IsInRole(Constants.Roles.FeeReversalOnly),
                IsInFeeReversalRole = IsInRole(Constants.Roles.FeeReversal),
                IsInAppChangeRole = IsInRole(Constants.Roles.ChangeAppAssignment)
            };
        }

        private bool IsInRole(string role)
        {
            return HttpContext.User.IsInRole($"/role/{role}");
        }
    }
}

