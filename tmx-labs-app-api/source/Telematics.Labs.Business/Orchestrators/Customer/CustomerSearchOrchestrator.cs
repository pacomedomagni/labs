using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfXirgoService;

namespace Progressive.Telematics.Labs.Business.Orchestrators.CustomerSearch;

[SingletonService]
public interface ICustomerSearchOrchestrator
{
    Task<CustomerSearchResponse> GetCustomersBySearch(string searchString);
    Task<GetCustsByDevSearchResponse> GetCustomersByDeviceSearch(string deviceId);
}

public class CustomerSearchOrchestrator : ICustomerSearchOrchestrator
{
    private readonly ICustomerInfoDAL _customerDAL;
    private readonly IUserManagementService _userManagementService;
    private readonly IXirgoDeviceService _xirgoDeviceService;

    public CustomerSearchOrchestrator(ICustomerInfoDAL customerDAL, IUserManagementService userManagementService, IXirgoDeviceService xirgoDeviceService)
    {
        _customerDAL = customerDAL;
        _userManagementService = userManagementService;
        _xirgoDeviceService = xirgoDeviceService;
    }

    public async Task<CustomerSearchResponse> GetCustomersBySearch(string searchString)
    {
        var users = await _userManagementService.GetCustomersBySearchString(searchString);
        var tempList = new List<CustomerInfo>();
        foreach (var user in users)
        {
            if (user == null) continue;

            var participantGroupExternalKey = user.UID;
            var partGrp = await _customerDAL.GetParticipantGroupByExternalKey(participantGroupExternalKey);

            if (partGrp != null )
            {
                var cust = new CustomerInfo()
                {
                    User = user,
                    ParticipantGroup = partGrp
                };

                tempList.Add(cust);
            }
        }

        var response = new CustomerSearchResponse
        {
            Customers = tempList
                .OrderBy(t => t.User.LastName)
                .ThenBy(t => t.User.FirstName)
                .ToArray(),
            RecordCount = tempList.Count
        };
        return response;
    }

    public async Task<GetCustsByDevSearchResponse> GetCustomersByDeviceSearch(string deviceId)
    {
        int deviceSeqID = 0;
        var response = new GetCustsByDevSearchResponse();

        GetDeviceBySerialNumberRequest request = new GetDeviceBySerialNumberRequest()
        {
            SerialNumber = deviceId
        };

        var devResp = await _xirgoDeviceService.GetDeviceBySerialNumber(request);
        if (!devResp.ResponseStatus.ToString().Equals("Success"))
        {
            response.AddMessage(MessageCode.Error, devResp.ResponseErrors);
            return response;
        }

        if (devResp.Device != null)
        {
            deviceSeqID = devResp.Device.DeviceSeqID.Value;
        }
        else
        {
            GetDeviceBySimRequest simRequest = new GetDeviceBySimRequest()
            {
                SIM = deviceId
            };

            var simResponse = await _xirgoDeviceService.GetDeviceBySim(simRequest);

            if (!simResponse.ResponseStatus.ToString().Equals("Success"))
            {
                response.AddMessage(MessageCode.Error, simResponse.ResponseErrors);
                return response;
            }

            if (simResponse.Device != null)
            {
                deviceSeqID = simResponse.Device.DeviceSeqID.Value;
            }
        }

        //we may not have found the desired device but we didn't fail
        if (deviceSeqID == 0)
        {
            return response;
        }

        var ds = await _customerDAL.GetCustsByDevSearch(deviceSeqID);
        if (ds == null)
        {
            response.AddMessage(MessageCode.Error, $"No users found for device id {deviceId}");
            return response;
        }

        var resultRows = ds.Rows;
        var tempList = new List<CustAndDevSearchResult>();
        foreach (DataRow row in resultRows)
        {
            var partGroup = new ParticipantGroup(row);
            var userResult = await _userManagementService.GetUserByUID(partGroup.ParticipantGroupExternalKey);
            if (!userResult.ResponseStatus.ToString().Equals("Success"))
            {
                //if we fail to get the user, don't include in search results
                continue;
            }

            LabsUser user;
            if (userResult.User == null)
            {
                //This shouldn't happen but I never trust data to stay valid
                user = new LabsUser()
                {
                    UID = partGroup.ParticipantGroupExternalKey,
                    FirstName = "Unknown",
                    LastName = "User"
                };
            }
            else
            {
                user = MapUserData(userResult.User);
            }

            var cust = new CustomerInfo()
            {
                User = user,
                ParticipantGroup = partGroup
            };

            tempList.Add(new CustAndDevSearchResult()
            {
                Customer = cust,
                Participant = new ParticipantInfo(row)
            });
        }

        if (tempList.Count > 0)
        {
            response.Device = await _xirgoDeviceService.GetDeviceBySerialNumber(deviceId);
        }

        response.SearchResults = tempList
            .OrderBy(t => t.Customer.User.LastName)
            .ThenBy(t => t.Customer.User.FirstName)
            .ToArray();
        response.RecordCount = tempList.Count;

        return response;
    }

    private static LabsUser MapUserData(WcfUserManagementService.User user)
    {
        if (user == null) return null;
        return new LabsUser()
        {
            AccessType = (AccessType)user.AccessType,
            Address = user.Address,
            City = user.City,
            Company = user.Company,
            Email = user.Email,
            FirstName = user.FirstName,
            FullName = user.FullName,
            LastName = user.LastName,
            Password = user.Password,
            PasswordAnswer = user.PasswordAnswer,
            PasswordQuestion = user.PasswordQuestion,
            PasswordResetDate = user.PasswordResetDate,
            PhoneNumber = user.PhoneNumber,
            Roles = user.Roles,
            State = user.State,
            UID = user.UID,
            UserName = user.UserName,
            Zip = user.Zip
        };
    }
}
