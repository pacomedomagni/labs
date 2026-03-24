using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Configuration;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment.Constants;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment.Helpers;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFAddressService;
using WCFReturnLabelService;
using WCFShippingLabelService;
using WCFTrackingNumberService;
using ReturnInsuranceType = WCFReturnLabelService.InsuranceType;
using ShippingInsuranceType = WCFShippingLabelService.InsuranceType;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment.Services;

[SingletonService]

public interface IShippingLabelDataService
{
    Task<ShippingLabelInfo> GetShippingLabelData(DeviceOrderInfo order);
    Task<string> GetLabelOrderNumber(ShippingLabelInfo ShippingLabelInfo, string orderNumber);
}

public class ShippingLabelDataService : IShippingLabelDataService
{
    private readonly IDeviceFulfillmentOrchestrator _deviceFulfillmentOrchestrator;
    private readonly IWCFTrackingNumberService _trackingNumberService;
    private readonly IWCFReturnLabelService _returnLabelService;
    private readonly IWCFShippingLabelService _shippingLabelService;
    private readonly IXirgoDeviceService _homeBaseXirgoService;
    private readonly ICustomerInfoDAL _customerDAL;
    private readonly IWCFAddressService _addressService;
    private readonly IUserManagementService _userManagementService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ShippingLabelDataService> _logger;
    private readonly LabelPrintingOptions _options;

    public ShippingLabelDataService(
        IDeviceFulfillmentOrchestrator deviceFulfillmentOrchestrator,
        IWCFTrackingNumberService trackingNumberService,
        IWCFReturnLabelService returnLabelService,
        IWCFShippingLabelService shippingLabelService,
        IXirgoDeviceService homeBaseXirgoService,
        ICustomerInfoDAL customerDAL,
        IWCFAddressService addressService,
        IUserManagementService userManagementService,
        IConfiguration configuration,
        ILogger<ShippingLabelDataService> logger,
        IOptions<LabelPrintingOptions> options)
    {
        _deviceFulfillmentOrchestrator = deviceFulfillmentOrchestrator;
        _trackingNumberService = trackingNumberService;
        _addressService = addressService;
        _returnLabelService = returnLabelService;
        _shippingLabelService = shippingLabelService;
        _customerDAL = customerDAL;
        _homeBaseXirgoService = homeBaseXirgoService;
        _userManagementService = userManagementService;
        _configuration = configuration;
        _logger = logger;
        _options = options?.Value;
    }

    public async Task<ShippingLabelInfo> GetShippingLabelData(DeviceOrderInfo order)
    {
        try
        {
            int boxCapacity = GetBoxCapacity();
            return await ExecuteForPolicyAsync(boxCapacity, _options.IsUspsEnabled, order);

        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError("Failed to generate shipping label for order {OrderID}", order.OrderNumber);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError("Unexpected error generating shipping label for order {OrderID}", order.OrderNumber);

            throw new InvalidOperationException(
                $"Failed to generate shipping label for order {order.OrderNumber}. Please try again or contact support.",
                ex);
        }
    }

    public async Task<string> GetLabelOrderNumber(ShippingLabelInfo ShippingLabelInfo, string orderNumber)
    {
        try
        {
            var orderSeqId = ShippingLabelHelper.ParseOrderSeqId(orderNumber);

            var request = new AddTrackingNumberRequest
            {
                ProgramCode = _options.ProgramCode,
                OrderSeqId = orderSeqId,
                UspsReturnTrackingNumber = ShippingLabelHelper.RemoveWhiteSpace(ShippingLabelInfo.ReturnTrackingNumberReadable ?? string.Empty),
                UspsShipTrackingNumber = ShippingLabelHelper.RemoveWhiteSpace(ShippingLabelInfo.TrackingNumberReadable ?? string.Empty)
            };

            var response = await _trackingNumberService.Add(request);

            if (response.ResponseStatus != WCFTrackingNumberService.ResponseStatus.Success)
            {
                _logger.LogWarning("Failed to add tracking number for order {OrderNumber}. Status: {Status}",
                    orderNumber, response.ResponseStatus);
                return string.Empty;
            }

            return response.TrackingNumberSeqIDFormatted ?? string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding tracking number for order {OrderNumber}", orderNumber);
            throw;
        }
    }

    private async Task<ShippingLabelInfo> ExecuteForPolicyAsync(int boxCapacity, bool isUspsEnabled, DeviceOrderInfo order)
    {
        if (order.Vehicles == null || !order.Vehicles.Any())
        {
            throw new InvalidOperationException(ShippingConstants.ErrorMessages.NoVehiclesFound);
        }

        var ShippingLabelInfo = new ShippingLabelInfo
        {
            OrderID = order.OrderNumber
        };

        var addressLabel = await GetAddressAsync(order.AddressLine1, order.City, order.State, order.ZipCode);
        ValidateAddressResponse(addressLabel, order);

        int deviceCount = order.DeviceCount;
        int boxCount = (int)Math.Ceiling((decimal)deviceCount / boxCapacity);

        for (int box = 0; box < boxCount; box++)
        {
            var label = await CreateLabelForBox(box, boxCapacity, order, addressLabel, isUspsEnabled, deviceCount);
            ShippingLabelInfo.Labels.Add(label);
        }

        return ShippingLabelInfo;
    }

    private async Task<ShippingLabelInfo> CreateLabelForBox(
        int boxIndex,
        int boxCapacity,
        DeviceOrderInfo order,
        GetStandardAddressResponse addressLabel,
        bool isUspsEnabled,
        int deviceCount)
    {
        int startIndex = boxCapacity * boxIndex;
        int endIndex = startIndex + boxCapacity;

        var label = new ShippingLabelInfo
        {
            DeviceIdType = ShippingConstants.DefaultDeviceIdType,
            CustomerName = $"{order.FirstName} {order.LastName}".ToUpper(),
            Address1 = addressLabel.AddressInfo.AddressLine1?.ToUpper(),
            Address2 = addressLabel.AddressInfo.AddressLine2?.ToUpper(),
            City = addressLabel.AddressInfo.City?.ToUpper(),
            State = addressLabel.AddressInfo.State?.ToUpper(),
            Zip = addressLabel.AddressInfo.Zip,
            ZipLet = string.IsNullOrWhiteSpace(addressLabel.AddressInfo.ZipLet) ? null : addressLabel.AddressInfo.ZipLet,
            OrderID = order.OrderNumber,
            PackageID = order.DeviceSerialNumbers[startIndex],
            IsPreview = false,
            IsCommercialLines = false
        };

        var shippingAddress = new Address
        {
            AddressLine1 = label.Address1,
            AddressLine2 = label.Address2,
            City = label.City,
            State = label.State,
            Zip = label.Zip,
            ZipLet = label.ZipLet
        };

        await ProcessShippingCarrierAsync(label, shippingAddress, order, isUspsEnabled, ShippingInsuranceType.PersonalLines);

        label.Vehicles = order.Vehicles;

        ShippingLabelHelper.ApplyEscapeCharacters(label);

        return label;
    }

    private async Task ProcessShippingCarrierAsync(
        ShippingLabelInfo label,
        Address address,
        DeviceOrderInfo order,
        bool isUspsEnabled,
        ShippingInsuranceType insuranceType)
    {
        if (isUspsEnabled)
        {
            await AttemptUspsLabelCreationAsync(order, label, address, insuranceType);
        }
    }

    private int GetBoxCapacity()
    {
        int capacity = _options.BoxCapacity;

        // Legacy logic: if capacity < 3, use 2, else use 4
        if (capacity < ShippingConstants.BoxCapacityThreshold)
            return ShippingConstants.DefaultBoxCapacity;

        return ShippingConstants.LargeBoxCapacity;
    }

    private async Task<LabsUser> GetUserInfo(int deviceSeqId)
    {
        try
        {
            var ds = await _customerDAL.GetCustsByDevSearch(deviceSeqId);
            if (ds == null || ds.Rows.Count == 0)
            {
                _logger.LogWarning("No customer data found for device {DeviceSeqId}", deviceSeqId);
                return null;
            }

            foreach (DataRow row in ds.Rows)
            {
                var partGroup = new ParticipantGroup(row);
                var userResult = await _userManagementService.GetUserByUID(partGroup.ParticipantGroupExternalKey);

                if (!userResult.ResponseStatus.ToString().Equals("Success", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (userResult.User != null)
                {
                    return MapUserData(userResult.User);
                }
            }

            _logger.LogWarning("No valid user found for device {DeviceSeqId}", deviceSeqId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error retrieving user info for device {DeviceSeqId}", deviceSeqId);
            throw;
        }
    }

    private static LabsUser MapUserData(WcfUserManagementService.User user)
    {
        if (user == null) return null;

        return new LabsUser
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

    private async Task<GetStandardAddressResponse> GetAddressAsync(string address1, string city, string state, string zip)
    {
        string cleanedAddress1 = CleanAddressLine1(address1, city, state, zip);

        GetStandardAddressRequest request = new GetStandardAddressRequest
        {
            Address = new Address
            {
                AddressLine1 = cleanedAddress1,
                City = city,
                State = state,
                Zip = zip
            }
        };

        return await _addressService.GetUspsStandardAddress(request);
    }

    private static string CleanAddressLine1(string address1, string city, string state, string zip)
    {
        if (string.IsNullOrWhiteSpace(address1))
            return address1;

        string cleaned = address1;
        bool zipIsPartOfAddress = IsZipPartOfAddress(cleaned, zip);

        cleaned = RemoveCityStateZipFromEnd(cleaned, city, state, zip);
        cleaned = RemoveStateZipFromEnd(cleaned, state, zip);
        cleaned = RemoveCityFromEnd(cleaned, city);

        if (!zipIsPartOfAddress)
        {
            cleaned = RemoveZipFromEnd(cleaned, zip);
        }

        return string.IsNullOrWhiteSpace(cleaned) ? address1 : cleaned;
    }

    private static bool IsZipPartOfAddress(string address, string zip)
    {
        if (string.IsNullOrWhiteSpace(zip))
            return false;

        var pattern = $@"(PO\s*BOX|P\.O\.\s*BOX|BOX|APT|APARTMENT|SUITE|STE|UNIT|#)\s*{Regex.Escape(zip)}\b";
        return Regex.IsMatch(address, pattern, RegexOptions.IgnoreCase);
    }

    private static string RemoveCityStateZipFromEnd(string address, string city, string state, string zip)
    {
        if (string.IsNullOrWhiteSpace(city) || string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(zip))
            return address;

        var pattern = $@"\s+{Regex.Escape(city)}\s+{Regex.Escape(state)}\s+{Regex.Escape(zip)}\s*$";
        return Regex.Replace(address, pattern, string.Empty, RegexOptions.IgnoreCase).Trim();
    }

    private static string RemoveStateZipFromEnd(string address, string state, string zip)
    {
        if (string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(zip))
            return address;

        var pattern = $@"\s+{Regex.Escape(state)}\s+{Regex.Escape(zip)}\s*$";
        return Regex.Replace(address, pattern, string.Empty, RegexOptions.IgnoreCase).Trim();
    }

    private static string RemoveCityFromEnd(string address, string city)
    {
        if (string.IsNullOrWhiteSpace(city))
            return address;

        var pattern = $@"\s+{Regex.Escape(city)}\s*$";
        return Regex.Replace(address, pattern, string.Empty, RegexOptions.IgnoreCase).Trim();
    }

    private static string RemoveZipFromEnd(string address, string zip)
    {
        if (string.IsNullOrWhiteSpace(zip))
            return address;

        var pattern = $@"\s+{Regex.Escape(zip)}\s*$";
        return Regex.Replace(address, pattern, string.Empty, RegexOptions.IgnoreCase).Trim();
    }

    private static void ValidateAddressResponse(GetStandardAddressResponse addressResponse, DeviceOrderInfo order)
    {
        if (addressResponse == null)
        {
            throw new InvalidOperationException($"Address validation failed for order {order.OrderNumber}. No response from address service.");
        }

        if (addressResponse.ResponseType == WCFAddressService.AVSResponseType.Bad)
        {
            throw new InvalidOperationException(
                $"Invalid address for order {order.OrderNumber}. " +
                $"Address: {order.AddressLine1}, {order.City}, {order.State} {order.ZipCode}. " +
                "Please verify the shipping address.");
        }

        if (addressResponse.ResponseType == WCFAddressService.AVSResponseType.Unknown)
        {
            throw new InvalidOperationException(
                $"Unable to validate address for order {order.OrderNumber}. " +
                $"Address: {order.AddressLine1}, {order.City}, {order.State} {order.ZipCode}. " +
                "Please verify the shipping address.");
        }

        if (addressResponse.AddressInfo == null)
        {
            throw new InvalidOperationException(
                $"Address validation returned no address information for order {order.OrderNumber}. " +
                "Please verify the shipping address.");
        }
    }

    private async Task AttemptUspsLabelCreationAsync(
        DeviceOrderInfo order,
        ShippingLabelInfo label,
        Address address,
        ShippingInsuranceType insuranceType)
    {
        _logger.LogDebug("Starting USPS label creation for package {PackageID}", label.PackageID);

        try
        {
            var request = BuildShippingLabelRequest(address, insuranceType);
            PopulateNameDetails(request.ToAddressDto, order.FirstName, order.LastName, insuranceType, order);

            label.NeedsHazmatLabel = await DetermineIfHazmatLabelNeeded(label.PackageID);

            var (returnLabel, shippingLabel) = await GetUspsLabelsAsync(request, insuranceType, label.NeedsHazmatLabel);

            ValidateUspsResponse(returnLabel, shippingLabel, request.ToAddressDto.IgnoreBadAddress);

            PopulateLabelData(label, returnLabel, shippingLabel);

            await GetLabelOrderNumber(label, label.OrderID);

            _logger.LogDebug("Successfully created USPS label for package {PackageID}", label.PackageID);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create USPS label for package {PackageID}", label.PackageID);
            throw;
        }
    }

    private GetShippingLabelRequest BuildShippingLabelRequest(Address address, ShippingInsuranceType insuranceType)
    {
        var request = new GetShippingLabelRequest
        {
            ToAddressDto = new WCFShippingLabelService.AddressDto
            {
                StreetAddress = address.AddressLine1,
                SecondaryAddress = address.AddressLine2,
                City = address.City,
                State = address.State,
                ZIPCode = address.Zip,
                ZIPPlus4 = string.IsNullOrWhiteSpace(address.ZipLet) ? null : address.ZipLet,
                IgnoreBadAddress = _options.IgnoreBadAddress
            },
            InsuranceType = insuranceType
        };

        return request;
    }

    private static void PopulateNameDetails(
        WCFShippingLabelService.AddressDto addressDto,
        string firstName,
        string lastName,
        ShippingInsuranceType insuranceType,
        DeviceOrderInfo order)
    {
        if (insuranceType == ShippingInsuranceType.CommercialLines)
        {
            string fullName = $"{firstName} {lastName}".Trim();
            var (first, last) = ShippingLabelHelper.ParseCompanyName(fullName);
            addressDto.FirstName = first;
            addressDto.LastName = last;
        }
        else
        {
            addressDto.FirstName = firstName;
            addressDto.LastName = lastName;
        }
    }

    private async Task<(GetReturnLabelResponse returnLabel, GetShippingLabelResponse shippingLabel)> GetUspsLabelsAsync(
        GetShippingLabelRequest request,
        ShippingInsuranceType insuranceType,
        bool isHazmat)
    {
        var returnRequest = new GetReturnLabelRequest
        {
            InsuranceType = MapToReturnLabelServiceWCFInsuranceType(insuranceType)
        };

        GetReturnLabelResponse returnLabel;
        GetShippingLabelResponse shippingLabel;

        if (isHazmat)
        {
            returnLabel = await _returnLabelService.GetUspsHazmatDistributorReturnLabel(returnRequest);
            shippingLabel = await _shippingLabelService.GetHazmatShippingLabel(request);
        }
        else
        {
            returnLabel = await _returnLabelService.GetUspsDistributorReturnLabel(returnRequest);
            shippingLabel = await _shippingLabelService.GetShippingLabel(request);
        }

        return (returnLabel, shippingLabel);
    }

    private void ValidateUspsResponse(
        GetReturnLabelResponse returnLabel,
        GetShippingLabelResponse shippingLabel,
        bool ignoreBadAddress)
    {
        ValidateApiResponse(returnLabel.ResponseErrors, "USPS Return Label API returned errors", false);
        ValidateApiResponse(shippingLabel.ResponseErrors, "USPS Shipping Label API returned errors", ignoreBadAddress);

        if (string.IsNullOrEmpty(shippingLabel.ShippingLabelData?.TrackingNumber) ||
            string.IsNullOrEmpty(returnLabel.ReturnLabelData?.TrackingNumber))
        {
            throw new InvalidOperationException(ShippingConstants.ErrorMessages.EmptyTrackingNumbers);
        }
    }

    private static void PopulateLabelData(
        ShippingLabelInfo label,
        GetReturnLabelResponse returnLabel,
        GetShippingLabelResponse shippingLabel)
    {
        label.TrackingNumberReadable = ShippingLabelHelper.AddSpacingForReadableTrackingNumber(
            shippingLabel.ShippingLabelData.TrackingNumber);
        label.TrackingNumberRaw = ShippingLabelHelper.ExtractRawTrackingNumberCodeFromZpl(
            Encoding.ASCII.GetString(shippingLabel.ShippingLabelData.Label));

        label.DataMatrixRaw = ShippingLabelHelper.ExtractImpbCodeFromZpl(
            Encoding.ASCII.GetString(shippingLabel.ShippingLabelData.Label));
        label.ReturnDataMatrixRaw = ShippingLabelHelper.ExtractImpbCodeFromZpl(
            Encoding.ASCII.GetString(returnLabel.ReturnLabelData.Label));

        label.ReturnTrackingNumberReadable = ShippingLabelHelper.AddSpacingForReadableTrackingNumber(
            returnLabel.ReturnLabelData.TrackingNumber);
        label.ReturnTrackingNumberRaw = ShippingLabelHelper.ExtractRawTrackingNumberCodeFromZpl(
            Encoding.ASCII.GetString(returnLabel.ReturnLabelData.Label));
    }

    public static ReturnInsuranceType MapToReturnLabelServiceWCFInsuranceType(ShippingInsuranceType shipInsuranceType)
    {
        return shipInsuranceType switch
        {
            ShippingInsuranceType.PersonalLines => ReturnInsuranceType.PersonalLines,
            ShippingInsuranceType.CommercialLines => ReturnInsuranceType.CommercialLines,
            ShippingInsuranceType.SpecialLines => ReturnInsuranceType.SpecialLines,
            ShippingInsuranceType.None => ReturnInsuranceType.None,
            _ => throw new ArgumentOutOfRangeException(nameof(shipInsuranceType), shipInsuranceType, null)
        };
    }

    private async Task<bool> DetermineIfHazmatLabelNeeded(string packageId)
    {
        if (string.IsNullOrWhiteSpace(packageId))
        {
            _logger.LogWarning("PackageID is null or empty. Defaulting to non-hazmat");
            return false;
        }

        try
        {
            var response = await _homeBaseXirgoService.DeviceFeatures(packageId);

            if (response?.ResponseStatus != WcfXirgoService.ResponseStatus.Success)
            {
                _logger.LogWarning("Device features request failed for package {PackageID}. Status: {Status}. Defaulting to non-hazmat",
                    packageId, response?.ResponseStatus);
                return false;
            }

            bool isHazmat = response.Features?.Any(f => f.Description == "Lithium Battery" && f.IsActive) == true;

            _logger.LogDebug("Package {PackageID} hazmat status determined: {IsHazmat}", packageId, isHazmat);

            return isHazmat;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to determine hazmat status for package {PackageID}. Defaulting to non-hazmat",
                packageId);
            return false;
        }
    }

    private void ValidateApiResponse(IEnumerable<dynamic> responseErrors, string errorMessagePrefix, bool ignoreBadAddress = true)
    {
        if (responseErrors == null || !responseErrors.Any())
            return;

        string errorMessages = string.Join("; ", responseErrors.Select(e => $"{e.ErrorCode}: {e.Message}"));

        bool isAddressRelated = ShippingConstants.AddressErrorPatterns.Any(pattern =>
            errorMessages.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0);

        _logger.LogWarning("{ErrorPrefix}: {ErrorMessages}", errorMessagePrefix, errorMessages);

        if (!ignoreBadAddress || !isAddressRelated)
        {
            string errorPrefix = isAddressRelated ? "Address Error - Please verify address" : "USPS API Error";
            throw new InvalidOperationException($"{errorPrefix}: {errorMessages}");
        }
    }

    // ALL CODE BELOW IS KEPT FOR REFERENCE IN CASE WE NEED TO REVERT BACK TO UPS MAIL INNOVATIONS,
    // BUT IS CURRENTLY COMMENTED OUT AS WE'VE SWITCHED TO USPS FOR ALL LABELS

    //private void ProcessUpsMailInnovationsLabel(ShippingLabelInfo sm, Address address, dynamic o, string customerCostCenter, string orderNumber = null)
    //{
    //    string returnTrackingNumberRaw = string.Empty;
    //    string returnTrackingNumberReadable = string.Empty;
    //    string readableTrackingNumber = "";
    //    string rawTrackingNumber = "";

    //    if (!GetReturnTrackingNumber(ref returnTrackingNumberRaw, ref returnTrackingNumberReadable))
    //    {
    //        _ShippingLabelInfo.TrackingNumberRaw = string.Empty;
    //        _ShippingLabelInfo.ReturnTrackingNumberRaw = string.Empty;
    //        _ShippingLabelInfo.ReturnTrackingNumberReadable = sm.IsPreview ? "Label Error" : "Error: Try again later.";
    //        _ShippingLabelInfo.TrackingNumberReadable = sm.IsPreview ? "Label Error" : "Error: Try again later.";
    //        return; // Exit early on error
    //    }

    //    sm.ReturnTrackingNumberRaw = returnTrackingNumberRaw;
    //    sm.ReturnTrackingNumberReadable = returnTrackingNumberReadable;

    //    // Use provided orderNumber or fall back to sm.OrderID
    //    string trackingOrderNumber = orderNumber ?? sm.OrderID;
    //    string trackingNumber = GetLabelOrderNumber(sm, trackingOrderNumber);

    //    BuildTrackingNumbers(address.Zip, trackingNumber, ref readableTrackingNumber, ref rawTrackingNumber);
    //    sm.TrackingNumberReadable = readableTrackingNumber;
    //    sm.TrackingNumberRaw = rawTrackingNumber;

    //    sm.DataMatrixRaw = GetZebraFormattedDataMatrixString(trackingNumber,
    //        sm.Address1, sm.Address2,
    //        sm.City, sm.State, sm.Zip,
    //        sm.PackageID,
    //        customerCostCenter ?? "");
    //}

    //private bool GetReturnTrackingNumber(ref string returnRawTrackingNumber, ref string returnReadableTrackingNumber)
    //{
    //    try
    //    {
    //        WCFReturnLabelService.GetReturnLabelResponse resp = _returnLabelService.GetDistributorReturnLabel();
    //        if (resp.ResponseStatus == WCFReturnLabelService.ResponseStatus.Success)
    //        {
    //            returnReadableTrackingNumber = AddSpacingForReadableTrackingNumber(resp.ReturnLabelData.TrackingNumber);
    //            returnRawTrackingNumber = string.Concat(resp.ReturnLabelData.PostalRouting, GetFNC1Character(), resp.ReturnLabelData.TrackingNumber);
    //        }
    //        else
    //        {
    //            returnRawTrackingNumber = string.Empty;
    //            returnReadableTrackingNumber = string.Empty;
    //            return false;
    //        }
    //    }
    //    catch (Exception ex)
    //    {
    //        LoggerUtility.LogError(nameof(GetShippingLabelDataCommand),
    //            $"Cannot generate return tracking number for order number: {_ShippingLabelInfo.OrderID}", ex);
    //        return false;
    //    }
    //    return true;
    //}

    //public string GetLabelOrderNumber(ShippingLabelInfo sm, string orderNumber)
    //{
    //    string trackingNumber = string.Empty;
    //    WCFTrackingNumberService.AddTrackingNumberRequest req = new TrackingNumberServiceWCF.AddTrackingNumberRequest();

    //    if (sm.IsPreview)
    //    {
    //        req.ProgramCode = 2;
    //        req.OrderSeqId = Convert.ToInt32(orderNumber);
    //    }
    //    else if (sm.IsCommercialLines)
    //    {
    //        req.ProgramCode = 4;
    //        req.OrderSeqId = Convert.ToInt32(orderNumber);
    //    }
    //    else
    //    {
    //        req.ProgramCode = 1;
    //        string[] orderParts = orderNumber.Split(new char[] { '-' });
    //        if (orderParts.Length != 2)
    //            throw new ApplicationException("Discount Order Number '" + orderNumber + "' not in correct format");
    //        else
    //            req.OrderSeqId = Convert.ToInt32(orderParts[1].ToString());
    //    }

    //}
    //private void BuildTrackingNumbers(string zipCode, string orderNumber, ref string readableTrackingNumber, ref string rawTrackingNumber)
    //{
    //    try
    //    {
    //        //declare field limits
    //        const int zipCodeMax = 5;
    //        const int labelOrderNumberMax = 11;

    //        //validate data parms passed in
    //        if (zipCode == null)
    //        {
    //            throw new ApplicationException("BuildTrackingNumbers exception: Zip code is null");
    //        }

    //        if (orderNumber == null)
    //        {
    //            throw new ApplicationException("BuildTrackingNumbers exception: Order number is null");
    //        }

    //        if (zipCode.Length > zipCodeMax)
    //        {
    //            throw new ApplicationException("Length of input field 'zipCode' exceeds maximum length of " + zipCodeMax + " characters");
    //        }

    //        if (orderNumber.Length > labelOrderNumberMax)
    //        {
    //            throw new ApplicationException("Length of input field 'orderNumber' exceeds maximum length of " + labelOrderNumberMax + " characters");
    //        }

    //        //assemble text to encode
    //        string routingCode = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "RoutingCode");
    //        string appIdentifierCode = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "ApplicationIdentifierCode");
    //        string mailerId = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "MailerID");
    //        int mailerIdInt = Convert.ToInt32(mailerId);
    //        string serviceTypeCode = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "ServiceTypeCode");

    //        StringBuilder raw = new StringBuilder();
    //        StringBuilder readableA = new StringBuilder();
    //        StringBuilder readableB = new StringBuilder();

    //        //generate data string without formating to generate correct check digits
    //        readableA.Append(routingCode);
    //        readableA.Append(zipCode);
    //        string t1 = readableA.ToString();

    //        readableB.Append(appIdentifierCode);
    //        readableB.Append(serviceTypeCode);
    //        readableB.Append(mailerIdInt.ToString("D9"));
    //        readableB.Append(orderNumber);
    //        string t2 = readableB.ToString();
    //        readableB.Append(GetMod10CheckDigit(t2));

    //        //generate data string to be encoded by printer
    //        //printer will automatically prepend FNC1 and Start Code C characters to string when barcode is printed in UCC/EAN mode.
    //        raw.Append(WrapAICode(routingCode));
    //        raw.Append(zipCode);

    //        //send FNC1 before next app identifier
    //        raw.Append(GetFNC1Character());
    //        raw.Append(WrapAICode(appIdentifierCode));
    //        raw.Append(serviceTypeCode);
    //        raw.Append(mailerIdInt.ToString("D9"));
    //        raw.Append(orderNumber);
    //        raw.Append(GetMod10CheckDigit(t2));


    //        string input = readableB.ToString();
    //        readableTrackingNumber = AddSpacingForReadableTrackingNumber(input);
    //        rawTrackingNumber = raw.ToString();
    //    }
    //    catch (Exception ex)
    //    {
    //        LoggerUtility.LogError(nameof(GetShippingLabelDataCommand),
    //            $"Cannot generate tracking number for order number {orderNumber}", ex);
    //        throw;
    //    }
    //}
    //private string WrapAICode(string value)
    //{
    //    return "(" + value + ")";
    //}

    //private string GetFNC1Character()
    //{
    //    return ">8";
    //}

    //private string GetZebraFormattedDataMatrixString(string trackingNumberSeqId,
    //       string address1, string address2,
    //       string city, string state, string zip,
    //       string packageId,
    //       string customerCostCenter = "")
    //{
    //    string messageVersionNumber = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "MessageVersionNumber");
    //    string mailInnovationsAccountNumber = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "MailInnovationsAccountNumber");
    //    string countryCode = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "CountryCode");
    //    decimal uspsWeight = decimal.Parse(UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "UspsWeight"));
    //    string processingCategoryCode = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "ProcessingCategoryCode");
    //    string shippingApplicationId = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "ShippingApplicationId");
    //    string channelApplicationIdentifier = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "ApplicationIdentifierCode");
    //    string postalCodeApplicationIdentifier = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "RoutingCode");
    //    string serviceTypeCode = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "ServiceTypeCode");
    //    string mailerIdentifier = UBIConfigurationManager.Instance.GetUBIConfigurationValue("BarcodeConstants", "MailerID");

    //    string trackingNumberTrailingSeven = trackingNumberSeqId.Substring(Math.Max(0, trackingNumberSeqId.Length - 7));
    //    int trackingNumberInt = int.Parse(trackingNumberTrailingSeven);
    //    string uniqueSequenceNumberString = trackingNumberInt.ToString("D7");
    //    DateTimeOffset dayOfPickup = DateTimeOffset.Now;

    //    var mailManifestId = new MailManifestId(shippingApplicationId, mailInnovationsAccountNumber, dayOfPickup, uniqueSequenceNumberString);
    //    var uspsTrackingNumber = new UspsIntelligentMailPackageBarcode_ConstructC03(postalCodeApplicationIdentifier, zip, channelApplicationIdentifier, serviceTypeCode, mailerIdentifier, uniqueSequenceNumberString);
    //    var dataMatrix = new MailInnovationsDataMatrix(mailManifestId, uspsTrackingNumber,
    //        messageVersionNumber, mailInnovationsAccountNumber, customerCostCenter,
    //        address1, address2, city, state,
    //        zip, countryCode, packageId, uspsWeight, processingCategoryCode);
    //    return dataMatrix.GetZebraFormattedBarcodeString();
    //}
}

