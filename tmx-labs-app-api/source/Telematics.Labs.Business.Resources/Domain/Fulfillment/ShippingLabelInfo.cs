using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

namespace Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

public class ShippingLabelInfo
{
    public ShippingLabelInfo()
    {
        Vehicles = new List<OrderVehicle>();
        Labels = new List<ShippingLabelInfo>();
    }

    public string CustomerName { get; set; }
    public string Address1 { get; set; }
    public string Address2 { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string Zip { get; set; }
    public string ZipLet { get; set; }
    public string PackageID { get; set; }
    public string OrderID { get; set; }
    public string TrackingNumberRaw { get; set; }
    public string TrackingNumberReadable { get; set; }
    public string ReturnTrackingNumberRaw { get; set; }
    public string ReturnTrackingNumberReadable { get; set; }
    public string DataMatrixRaw { get; set; }
    public string ReturnDataMatrixRaw { get; set; }
    public bool IsPreview { get; set; }
    public bool IsCommercialLines { get; set; }
    public string DeviceIdType { get; set; }
    public List<OrderVehicle> Vehicles { get; set; }
    public List<ShippingLabelInfo> Labels { get; set; }
    public bool NeedsHazmatLabel { get; set; } = false;
}

public class MailInnovationsDataMatrix
{
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           18
    /// Sample Value:   "812345607150000001"
    /// Required:       Yes
    /// Comments:       See "Mail Manifest ID Table" for structure
    /// </summary>
    public MailManifestId MailManifestId { get; private set; }

    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           22
    /// Sample Value:   "9274890111494601443836"
    /// Required:       Conditional
    /// Comments:       Field is blank if mail piece has an international destination or is categorized as a flat.  
    /// </summary>
    public UspsIntelligentMailPackageBarcode_ConstructC03 UspsTrackingNumber { get; private set; }

    private string messageVersionNumber;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           1
    /// Sample Value:   "3"
    /// Required:       Yes
    /// Comments:       Indicates data table layout version (use "3" for this version)
    /// </summary>
    public string MessageVersionNumber
    {
        get
        {
            return messageVersionNumber;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 1 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(MessageVersionNumber)}");
            }
            messageVersionNumber = value;
        }
    }

    private string mailInnovationsAccountNumber;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           6
    /// Sample Value:   "123456"
    /// Required:       Yes
    /// Comments:       UPS Mail Innovations™ Account Number
    /// </summary>
    public string MailInnovationsAccountNumber
    {
        get
        {
            return mailInnovationsAccountNumber;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 6 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(MailInnovationsAccountNumber)}");
            }
            mailInnovationsAccountNumber = value;
        }
    }

    private string customerCostCenter;
    /// <summary>
    /// A/N:            Alphanumeric
    /// F/V:            Variable Size
    /// Size:           30
    /// Sample Value:   "854NB093NHYF"
    /// Required:       No
    /// Comments:       Optional customer related data
    /// </summary>
    public string CustomerCostCenter
    {
        get
        {
            return customerCostCenter;
        }
        private set
        {
            if (!string.IsNullOrEmpty(value) && (value.Length > 30 || !value.All(char.IsLetterOrDigit)))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(CustomerCostCenter)}");
            }
            customerCostCenter = value;
        }
    }

    private string destinationAddressLine1;
    /// <summary>
    /// A/N:            Alphanumeric
    /// F/V:            Variable Size
    /// Size:           35
    /// Sample Value:   "123 MAIN STREET"
    /// Required:       Yes
    /// Comments:       Street Address Line (not intended for contact name or company name)
    ///                 Spaces allowed
    ///                 All address text must be in uppercase
    ///                 No punctuation allowed
    /// </summary>
    public string DestinationAddressLine1
    {
        get
        {
            return destinationAddressLine1;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length > 35 || !value.All(c => char.IsUpper(c) && char.IsLetter(c) || char.IsDigit(c) || c == ' '))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DestinationAddressLine1)}");
            }
            destinationAddressLine1 = value;
        }
    }

    private string destinationAddressLine2;
    /// <summary>
    /// A/N:            Alphanumeric
    /// F/V:            Variable Size
    /// Size:           35
    /// Sample Value:   "SUITE 310"
    /// Required:       Conditional
    /// Comments:       Field is populated when address includes an extended address line (such as a suite)
    ///                 Spaces allowed
    ///                 All address text must be in uppercase
    ///                 No punctuation allowed
    /// </summary>
    public string DestinationAddressLine2
    {
        get
        {
            return destinationAddressLine2;
        }
        private set
        {
            if (!string.IsNullOrEmpty(value) && (value.Length > 35 || !value.All(c => char.IsUpper(c) && char.IsLetter(c) || char.IsDigit(c) || c == ' ')))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DestinationAddressLine2)}");
            }
            destinationAddressLine2 = value;
        }
    }

    private string destinationCity;
    /// <summary>
    /// A/N:            Alphanumeric
    /// F/V:            Variable Size
    /// Size:           30
    /// Sample Value:   "ALPHARETTA"
    /// Required:       Yes
    /// Comments:       Spaces allowed
    ///                 All address text must be in uppercase
    ///                 No punctuation allowed
    /// </summary>
    public string DestinationCity
    {
        get
        {
            return destinationCity;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length > 30 || !value.All(c => char.IsUpper(c) && char.IsLetter(c) || char.IsDigit(c) || c == ' '))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DestinationCity)}");
            }
            destinationCity = value;
        }
    }

    private string destinationStateOrProvince;
    /// <summary>
    /// A/N:            Alphanumeric
    /// F/V:            Fixed Size
    /// Size:           2
    /// Sample Value:   "GA"
    /// Required:       Conditional
    /// Comments:       Field is populated for U.S. and Canada destinations only.
    ///                 All address text must be in uppercase
    /// </summary>
    public string DestinationStateOrProvince
    {
        get
        {
            return destinationStateOrProvince;
        }
        private set
        {
            if (!string.IsNullOrEmpty(value) && (value.Length != 2 || !value.All(c => char.IsUpper(c) && char.IsLetter(c) || char.IsDigit(c))))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DestinationStateOrProvince)}");
            }
            destinationStateOrProvince = value;
        }
    }

    private string destinationPostalCode;
    /// <summary>
    /// A/N:            Alphanumeric
    /// F/V:            Variable Size
    /// Size:           9
    /// Sample Value:   "30343", "A9V6M1"
    /// Required:       Yes
    /// Comments:       No spaces or dashes allowed
    ///                 All address text must be in uppercase
    /// </summary>
    public string DestinationPostalCode
    {
        get
        {
            return destinationPostalCode;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length > 9 || !value.All(c => char.IsUpper(c) && char.IsLetter(c) || char.IsDigit(c)))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DestinationPostalCode)}");
            }
            destinationPostalCode = value;
        }
    }

    private string destinationCountryCode;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           3
    /// Sample Value:   "840"
    /// Required:       Yes
    /// Comments:       Use ISO country code
    /// </summary>
    public string DestinationCountryCode
    {
        get
        {
            return destinationCountryCode;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 3 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DestinationCountryCode)}");
            }
            destinationCountryCode = value;
        }
    }

    private string packageId;
    /// <summary>
    /// A/N:            Alphanumeric
    /// F/V:            Variable Size
    /// Size:           30
    /// Sample Value:   "000123ABC"
    /// Required:       Yes
    /// Comments:       Minimum of one character
    /// </summary>
    public string PackageId
    {
        get
        {
            return packageId;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length > 30 || !value.All(char.IsLetterOrDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(PackageId)}");
            }
            packageId = value;
        }
    }

    private decimal uspsWeight;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Variable Size
    /// Size:           2,4
    /// Sample Value:   "5.5000", "65.0125"
    /// Required:       Yes
    /// Comments:       Weight in pounds (four decimals are required)
    /// </summary>
    public decimal UspsWeight
    {
        get
        {
            return uspsWeight;
        }
        private set
        {
            if (value < 0.0M)
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(UspsWeight)}");
            }
            uspsWeight = value;
        }
    }

    private string processingCategoryCode;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Variable Size
    /// Size:           2,2
    /// Sample Value:   "7,13"
    /// Required:       Conditional
    /// Comments:       See "Processing Category Table". 
    ///                 Field is blank if mail piece has an international destination or is categorized as a flat.             
    ///                 Processing Category Code field only allows a comma as punctuation.
    /// </summary>
    public string ProcessingCategoryCode
    {
        get
        {
            return processingCategoryCode;
        }
        private set
        {
            if (!string.IsNullOrEmpty(value) && !Regex.IsMatch(value, @"^\d{1,2},\d{1,2}$"))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(ProcessingCategoryCode)}");
            }
            processingCategoryCode = value;
        }
    }

    public MailInnovationsDataMatrix(MailManifestId mailManifestId, UspsIntelligentMailPackageBarcode_ConstructC03 uspsTrackingNumber,
        string messageVersionNumber, string mailInnovationsAccountNumber, string customerCostCenter,
        string destinationAddressLine1, string destinationAddressLine2, string destinationCity, string destinationStateOrProvince,
        string destinationPostalCode, string destinationCountryCode, string packageId, decimal uspsWeight, string processingCategoryCode)
    {
        MailManifestId = mailManifestId ?? throw new ArgumentNullException($"{nameof(mailManifestId)}");
        UspsTrackingNumber = uspsTrackingNumber ?? throw new ArgumentNullException($"{nameof(uspsTrackingNumber)}");
        MessageVersionNumber = messageVersionNumber;
        MailInnovationsAccountNumber = mailInnovationsAccountNumber;
        CustomerCostCenter = string.IsNullOrEmpty(customerCostCenter) ? string.Empty : customerCostCenter;
        DestinationAddressLine1 = SanitizeAddress(destinationAddressLine1);
        DestinationAddressLine2 = SanitizeAddress(destinationAddressLine2);
        DestinationCity = string.IsNullOrEmpty(destinationCity) ? string.Empty : RemoveAllNonAlphanumericCharactersExceptSpaces(destinationCity).ToUpper();
        DestinationStateOrProvince = string.IsNullOrEmpty(destinationStateOrProvince) ? string.Empty : destinationStateOrProvince.ToUpper();
        DestinationPostalCode = string.IsNullOrEmpty(destinationPostalCode) ? string.Empty : destinationPostalCode.ToUpper();
        DestinationCountryCode = destinationCountryCode;
        PackageId = packageId;
        UspsWeight = uspsWeight;
        ProcessingCategoryCode = processingCategoryCode;
    }

    /// <summary>
    /// Data Matrix Barcode:
    /// 1)  Each field is delimited with a tab. A tab is required even if a field is left blank (conditional fields). 
    ///     Therefore, the barcode will always include 13 tabs.
    ///     
    /// 2)  Spaces are allowed only in the Address Line 1, Address Line 2 and City fields.
    /// 
    /// 3)  Punctuation is only allowed in the USPS weight and Processing Category Code fields.The USPS Weight only 
    ///     allows '.' or decimal point as punctuation. Processing Category Code field only allows a comma as punctuation. 
    ///     No other punctuations allowed in the Data Matrix Barcode.
    /// </summary>
    public string GetZebraFormattedBarcodeString() => string.Join("_09", // "_" is the zebra escape character and "09" is the hex representation of a tab
            MessageVersionNumber,
            MailManifestId.GetBarcodeString(),
            MailInnovationsAccountNumber,
            CustomerCostCenter,
            DestinationAddressLine1,
            DestinationAddressLine2,
            DestinationCity,
            DestinationStateOrProvince,
            DestinationPostalCode,
            DestinationCountryCode,
            PackageId,
            GetFormattedUspsWeight(),
            ProcessingCategoryCode,
            UspsTrackingNumber.GetIntelligentMailPackageBarcode());

    public override string ToString() => GetZebraFormattedBarcodeString();

    public static string RemoveAllNonAlphanumericCharactersExceptSpaces(string input) => Regex.Replace(input, "[^A-Za-z0-9 ]", string.Empty);

    public string GetFormattedUspsWeight() => UspsWeight.ToString("0.0000", CultureInfo.InvariantCulture);

    private string SanitizeAddress(string address)
    {
        address = string.IsNullOrEmpty(address) ? string.Empty : RemoveAllNonAlphanumericCharactersExceptSpaces(address).ToUpper().Trim();

        // UPS address1 and address2 can only be 35 characters max, but a small percentage of addresses stored in our VARCHAR(50) columns exceed 35 characters
        // UPS confirmed on 2019-03-15 that it's OK to truncate these
        return address.Length > 35 ? address.Substring(0, 35).Trim() : address;
    }
}

public class MailManifestId
{
    private string shippingApplicationId;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           1
    /// Sample Value:   "8"
    /// Required:       Yes
    /// Comments:       All shipping applications will use a value of "8"
    /// </summary>
    public string ShippingApplicationId
    {
        get
        {
            return shippingApplicationId;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 1 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(ShippingApplicationId)}");
            }
            shippingApplicationId = value;
        }
    }

    private string mailInnovationsAccountNumber;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           6
    /// Sample Value:   "123456"
    /// Required:       Yes
    /// Comments:       UPS Mail Innovations™ Account Number
    /// </summary>
    public string MailInnovationsAccountNumber
    {
        get
        {
            return mailInnovationsAccountNumber;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 6 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(MailInnovationsAccountNumber)}");
            }
            mailInnovationsAccountNumber = value;
        }
    }

    private DateTimeOffset dayOfPickup;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           3
    /// Sample Value:   "365"
    /// Required:       Yes
    /// Comments:       The day of the year the shipment is picked up or processed
    ///                 001 - 365 for normal years
    ///                 001 - 366 for leap years
    /// </summary>
    public DateTimeOffset DayOfPickup
    {
        get
        {
            return dayOfPickup;
        }
        private set
        {
            if (value == default(DateTimeOffset))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DayOfPickup)}");
            }
            dayOfPickup = value;
        }
    }

    private string uniqueSequenceNumber;
    /// <summary>
    /// A/N:            Numeric
    /// F/V:            Fixed Size
    /// Size:           7
    /// Sample Value:   "0000001"
    /// Required:       Yes
    /// Comments:       Sequence number is determined by the shipper or shipping system and must be carefully 
    ///                 controlled to ensure each package is unique
    /// </summary>
    public string UniqueSequenceNumber
    {
        get
        {
            return uniqueSequenceNumber;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 7 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(UniqueSequenceNumber)}");
            }
            uniqueSequenceNumber = value;
        }
    }

    public MailManifestId(string shippingApplicationId, string mailInnovationsAccountNumber, DateTimeOffset dayOfPickup,
        string uniqueSequenceNumber)
    {
        ShippingApplicationId = shippingApplicationId;
        MailInnovationsAccountNumber = mailInnovationsAccountNumber;
        DayOfPickup = dayOfPickup;
        UniqueSequenceNumber = uniqueSequenceNumber;
    }

    /// <summary>
    /// Spaces are not encoded in the bar code. For Example: "812345603000000017"
    /// All alpha characters must be uppercase
    /// Alpha characters may only appear in the account number
    /// Sequence number is determined by the shipper or shipping system and must be carefully controlled to ensure
    /// each package is unique
    /// The entire 18 digit tracking number must remain unique for one year
    /// </summary>
    public string GetBarcodeString() => string.Concat(ShippingApplicationId,
        MailInnovationsAccountNumber,
        GetFormattedDayOfYearOfPickup(),
        UniqueSequenceNumber,
        GetModifiedMod10CheckDigit());

    /// <summary>
    /// The human readable text below the barcode must be formatted as: "n nnnnnn nnn nnnnnnn n"
    /// </summary>
    public string GetHumanReadableString() => string.Join(" ",
        ShippingApplicationId,
        MailInnovationsAccountNumber,
        GetFormattedDayOfYearOfPickup(),
        UniqueSequenceNumber,
        GetModifiedMod10CheckDigit());

    public override string ToString() => GetBarcodeString();

    /// <summary>
    /// Check digit calculation defined by UPS for Mail Manifest ID (Modified Mod 10)
    /// Note: The USPS tracking number uses a different Mod 10 calculation.
    /// </summary>
    /// <returns></returns>
    public static string GetModifiedMod10CheckDigit(string input)
    {
        if (string.IsNullOrEmpty(input) || !input.All(char.IsDigit))
        {
            throw new ArgumentException($"{nameof(input)}");
        }

        int oddSum = 0;
        int evenSum = 0;
        char[] digits = input.ToCharArray();
        for (int i = 0; i < digits.Length; i++)
        {
            int digit = int.Parse(digits[i].ToString());
            if ((i + 1) % 2 == 0)
            {
                evenSum += digit;
            }
            else
            {
                oddSum += digit;
            }
        }

        int checkDigit = (10 - ((oddSum + evenSum * 2) % 10)) % 10;
        return checkDigit.ToString();
    }

    private string GetModifiedMod10CheckDigit()
    {
        string digits = string.Concat(ShippingApplicationId,
            MailInnovationsAccountNumber,
            GetFormattedDayOfYearOfPickup(),
            UniqueSequenceNumber);
        return GetModifiedMod10CheckDigit(digits);
    }

    private string GetFormattedDayOfYearOfPickup() => DayOfPickup.DayOfYear.ToString("000");
}

public class UspsIntelligentMailPackageBarcode_ConstructC03
{
    private string postalCodeApplicationIdentifier;
    /// <summary>
    /// The Postal Code Application Identifier (AI) is a specific 3-digit GS1 application identifier that
    /// is used to designate the presence of a delivery Postal Code within the barcode. This field will
    /// always be “420” and, must precede the destination ZIP Code if such routing information is
    /// provided.
    /// 
    /// Source: Always “420.”
    /// </summary>
    public string PostalCodeApplicationIdentifier
    {
        get
        {
            return postalCodeApplicationIdentifier;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 3 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(PostalCodeApplicationIdentifier)}");
            }
            postalCodeApplicationIdentifier = value;
        }
    }

    private string destinationZipCode;
    /// <summary>
    /// This field should contain the destination ZIP Code associated with the mailpiece being
    /// labeled.This field may be 5 or 9 digits in length depending on the use of a ZIP Code or
    /// ZIP+4. For Construct C03, the ZIP length is 5.
    /// 
    /// Source: Specific to the mailpiece.
    /// </summary>
    public string DestinationZipCode
    {
        get
        {
            return destinationZipCode;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 5 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(DestinationZipCode)}");
            }
            destinationZipCode = value;
        }
    }

    private string channelApplicationIdentifier;
    /// <summary>
    /// The Channel Application Identifier (AI) is a specific 2-digit application identifier used to
    /// identify both the business induction channel from which the mailpiece originated and to
    /// indicate where USPS may locate a payment record for the mailpiece.Valid IMpb Channel
    /// Application Identifiers are “92”, “93”, “94”, and “95.” AI “92” and AI “93” are for use by
    /// commercial mailers. AI “94” is for USPS online channel mailings and AI “95” is reserved for
    /// the USPS retail environment.
    /// 
    /// Source: For the commercial mailer, always a “92” when used with a 9-digit Mailer ID or “93”
    /// when used with a 6-digit Mailer ID.
    /// </summary>
    public string ChannelApplicationIdentifier
    {
        get
        {
            return channelApplicationIdentifier;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 2 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(ChannelApplicationIdentifier)}");
            }
            channelApplicationIdentifier = value;
        }
    }

    private string serviceTypeCode;
    /// <summary>
    /// The 3-digit Service Type Code (STC) field identifies the mail class of the parcel and the
    /// presence of any extra services.The service type code also identifies if the mailpiece belongs
    /// to a special USPS program such as Open and Distribute or Merchandise Return Service.
    /// 
    /// Source: Specific to the mailpiece being identified.A complete list of service type codes can
    /// be found in Publication 199, Implementation Guide to Intelligent Mail Package Barcode, or
    /// Publication 205, eVS Business and Technical Guide.
    /// </summary>
    public string ServiceTypeCode
    {
        get
        {
            return serviceTypeCode;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 3 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(ServiceTypeCode)}");
            }
            serviceTypeCode = value;
        }
    }

    private string mailerIdentifier;
    /// <summary>
    /// The Mailer ID (MID) field may be 6 or 9 digits in length. Most mailers will be assigned a
    /// 9-digit MID which is used in conjunction with AI “92.” On an individual basis, some mailers or
    /// consolidators may be assigned a 6-digit MID and would then use AI “93.”
    /// 
    /// Source: Each mailer should obtain a unique MID from USPS.
    /// </summary>
    public string MailerIdentifier
    {
        get
        {
            return mailerIdentifier;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 9 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(MailerIdentifier)}");
            }
            mailerIdentifier = value;
        }
    }

    private string serialNumber;
    /// <summary>
    /// Every barcode must contain a serial number which uniquely identifies the mailpiece
    /// associated with the mailer ID.Commercial mailers, depending upon the length of their mailer
    /// ID, may use a 7, 10, 11, or 14-digit serial number as defined in Table 2, IMpb Barcode
    /// Constructs. For Construct C03, the serial number length is 7.
    /// 
    /// Source: Defined by the mailer uniquely for each mailpiece. Use of a sequential number is
    /// recommended.
    /// </summary>
    public string SerialNumber
    {
        get
        {
            return serialNumber;
        }
        private set
        {
            if (string.IsNullOrEmpty(value) || value.Length != 7 || !value.All(char.IsDigit))
            {
                throw new ArgumentException($"Value failed validation.", $"{nameof(SerialNumber)}");
            }
            serialNumber = value;
        }
    }

    public UspsIntelligentMailPackageBarcode_ConstructC03(string postalCodeApplicationIdentifier, string destinationZipCode,
        string channelApplicationIdentifier, string serviceTypeCode, string mailerIdentifier,
        string serialNumber)
    {
        PostalCodeApplicationIdentifier = postalCodeApplicationIdentifier;
        DestinationZipCode = destinationZipCode;
        ChannelApplicationIdentifier = channelApplicationIdentifier;
        ServiceTypeCode = serviceTypeCode;
        MailerIdentifier = mailerIdentifier;
        SerialNumber = serialNumber;
    }

    public string GetRoutingData() => string.Concat(PostalCodeApplicationIdentifier,
        DestinationZipCode);

    public string GetPackageIdentifierCode() => string.Concat(ChannelApplicationIdentifier,
        ServiceTypeCode,
        MailerIdentifier,
        SerialNumber,
        GetMod10CheckDigit());

    /// <summary>
    /// IMpb
    /// </summary>
    public string GetIntelligentMailPackageBarcode() => string.Concat(GetRoutingData(),
        GetPackageIdentifierCode());

    public override string ToString() => GetIntelligentMailPackageBarcode();

    /// <summary>
    /// Standard Mod 10 check digit calculation for USPS Intelligent Mail Package Barcode.
    /// Note: This is different from the Modified Mod 10 used for Mail Manifest ID.
    /// </summary>
    /// <param name="dataString">The numeric string to calculate the check digit for</param>
    /// <returns>The check digit as a string</returns>
    public static string GetMod10CheckDigit(string dataString)
    {
        int check = 0;

        int odd = 0;
        int even = 0;

        for (int i = dataString.Length - 1; i >= 0; i -= 2)
        {
            odd += Int32.Parse(dataString.Substring(i, 1));
        }
        for (int i = dataString.Length - 2; i >= 0; i -= 2)
        {
            even += Int32.Parse(dataString.Substring(i, 1));
        }

        check = (10 - ((odd * 3) + even) % 10) % 10;

        return check.ToString().Trim();
    }

    /// <summary>
    /// A MOD 10 check digit is used as the final digit in the Intelligent Mail package barcode .The
    /// check digit calculation is based only upon the digits that make up the PIC, specifically the
    /// Application Identifier, Service Type Code, Mailer ID, and Serial Number. It does not include
    /// the Postal Routing Code Application Identifier or the Postal Routing Code(when present).
    /// Source: https://ribbs.usps.gov/barcode_cert/documents/tech_guides/
    /// </summary>
    private string GetMod10CheckDigit()
    {
        string digits = string.Concat(ChannelApplicationIdentifier,
            ServiceTypeCode,
            MailerIdentifier,
            SerialNumber);
        return GetMod10CheckDigit(digits);
    }
}
