using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment.Constants;

/// <summary>
/// Constants used in shipping label generation
/// </summary>
public static class ShippingConstants
{
    public const string DefaultDeviceIdType = "Snapshot";
    public const int DefaultBoxCapacity = 2;
    public const int LargeBoxCapacity = 4;
    public const int BoxCapacityThreshold = 3;

    /// <summary>
    /// Error messages returned to users
    /// </summary>
    public static class ErrorMessages
    {
        public const string LabelError = "Label Error";
        public const string TryAgainLater = "Error: Try again later.";
        public const string NoVehiclesFound = "No vehicles found in order details";
        public const string EmptyTrackingNumbers = "USPS API returned empty tracking numbers. Please try again.";
        public const string InvalidOrderFormat = "Invalid order number format";
    }

    /// <summary>
    /// Address error patterns from USPS API
    /// </summary>
    public static readonly string[] AddressErrorPatterns =
    {
        "Primary Address Number invalid",
        "Address not found",
        "Invalid address",
        "Address validation failed",
        "Invalid Street Address",
        "Address standardization failed",
        "The address you entered was found but more information is needed",
        "Multiple addresses were found",
        "No default exists"
    };

    /// <summary>
    /// Zebra escape character mappings for ZPL generation
    /// </summary>
    public static readonly Dictionary<string, string> ZebraEscapeMap = new()
    {
        ["_"] = "_5F",
        ["<"] = "_3C",
        ["#"] = "_23",
        [")"] = "_29",
        ["("] = "_28",
        ["%"] = "_25",
        ["&"] = "_26",
        [@"\"] = "/",
        ["}"] = "_7D",
        ["^"] = "_5E"
    };
}
