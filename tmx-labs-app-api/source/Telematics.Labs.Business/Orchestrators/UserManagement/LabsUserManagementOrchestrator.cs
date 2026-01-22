using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure.Core;
using Microsoft.EntityFrameworkCore.Metadata;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfUserManagementService;
using ResponseStatus = WcfUserManagementService.ResponseStatus;
using User = WcfUserManagementService.User;

namespace Progressive.Telematics.Labs.Business.Orchestrators.UserManagement;

[SingletonService]
public interface ILabsUserManagementOrchestrator
{
    Task<ContactDetailsModel> ValidateNewCustomer(ValidateNewCustomerBody customer);
}

public class LabsUserManagementOrchestrator(IUserManagementService userManagementService, IParticipantGroupService participantGroupService) : ILabsUserManagementOrchestrator
{

    public async Task<ContactDetailsModel> ValidateNewCustomer(ValidateNewCustomerBody customerBody)
    {
        var response = new ContactDetailsModel();
        var user = (await userManagementService.GetCustomersBySearchString(customerBody.EmailAddress)).FirstOrDefault();

        if (user == null)
        {
            return new ContactDetailsModel() { IsCustomer = false, IsAbleToEnroll = true };
        }
        var partGroupResponse = await participantGroupService.GetPartGroupByExtKey(user.UID);

        if (partGroupResponse.ResponseStatus == ParticipantGroupService.ResponseStatus.Success)
        {
            if (partGroupResponse.ParticipantGroup == null)
            {
                response = new ContactDetailsModel() { IsCustomer = false, IsAbleToEnroll = true };
                PopulateUserDetailsModel(user, response);
            }
            else
            {
                response = new ContactDetailsModel() { IsCustomer = true, IsAbleToEnroll = false, ParticipantGroupSeqID = partGroupResponse.ParticipantGroup.ParticipantGroupSeqID };
            }
        }

        return response;
    }

    private static void PopulateUserDetailsModel(LabsUser user, ContactDetailsModel model)
    {
        model.LastName = user.LastName;
        model.Address = user.Address == Constants.General.LdapDefault ? string.Empty : user.Address;
        model.City = user.City == Constants.General.LdapDefault ? string.Empty : user.City;
        model.FirstName = user.FirstName == Constants.General.LdapDefault ? string.Empty : user.FirstName;
        model.PhoneNumber = user.PhoneNumber == Constants.General.LdapDefault ? string.Empty : user.PhoneNumber;
        model.State = user.State == Constants.General.StateDefault ? string.Empty : user.State;
        model.Zip = user.Zip == Constants.General.ZipDefault ? string.Empty : user.Zip;
    }
}
