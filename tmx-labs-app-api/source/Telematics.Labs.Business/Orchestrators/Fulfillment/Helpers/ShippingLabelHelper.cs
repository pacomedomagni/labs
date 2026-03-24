using System;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment.Constants;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment.Helpers;

/// <summary>
/// Helper methods for shipping label operations
/// </summary>
public static class ShippingLabelHelper
{
    /// <summary>
    /// Removes all whitespace from a string
    /// </summary>
    public static string RemoveWhiteSpace(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        return new string(input.Where(c => !char.IsWhiteSpace(c)).ToArray());
    }

    /// <summary>
    /// Adds spacing every 4 characters for readable tracking numbers
    /// </summary>
    public static string AddSpacingForReadableTrackingNumber(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        var output = new StringBuilder();
        for (int i = 0; i < input.Length; i++)
        {
            output.Append(input[i]);
            if ((i + 1) % 4 == 0 && i < input.Length - 1)
                output.Append(' ');
        }
        return output.ToString();
    }

    /// <summary>
    /// Applies Zebra escape characters to a string for ZPL generation
    /// </summary>
    public static string ApplyEscapes(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return ShippingConstants.ZebraEscapeMap.Aggregate(input, 
            (current, kvp) => current.Replace(kvp.Key, kvp.Value));
    }

    /// <summary>
    /// Applies escape characters to all address fields in a shipping label model
    /// </summary>
    public static void ApplyEscapeCharacters(ShippingLabelInfo model)
    {
        if (model == null)
            return;

        model.CustomerName = ApplyEscapes(model.CustomerName);
        model.Address1 = ApplyEscapes(model.Address1);
        model.Address2 = ApplyEscapes(model.Address2);
        model.City = ApplyEscapes(model.City);
    }

    /// <summary>
    /// Extracts IMPB code from ZPL string
    /// </summary>
    public static string ExtractImpbCodeFromZpl(string zplCode)
    {
        if (string.IsNullOrEmpty(zplCode))
            return string.Empty;

        var pattern = @"\^FD_(\d+_\d+)\^FS";
        var match = Regex.Match(zplCode, pattern);
        return match.Success ? match.Groups[1].Value : string.Empty;
    }

    /// <summary>
    /// Extracts raw tracking number from ZPL string
    /// </summary>
    public static string ExtractRawTrackingNumberCodeFromZpl(string zplCode)
    {
        if (string.IsNullOrEmpty(zplCode))
            return string.Empty;

        var pattern = @"\^FO\d+,\d+\^BCN,\d+,N\^FD>;>8([0-9]+>[0-9]+)\^FS";
        var match = Regex.Match(zplCode, pattern, RegexOptions.Singleline);
        return match.Success ? match.Groups[1].Value : string.Empty;
    }

    /// <summary>
    /// Parses order number to extract sequence ID
    /// Supports formats: "12345" or "ORD-12345"
    /// </summary>
    public static int ParseOrderSeqId(string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            throw new ArgumentException("Order number cannot be null or empty", nameof(orderNumber));

        // If it's already a number, return it
        if (int.TryParse(orderNumber, out int seqId))
            return seqId;

        // If it's in format "ORD-12345", parse the second part
        var parts = orderNumber.Split('-');
        if (parts.Length == 2 && int.TryParse(parts[1], out seqId))
            return seqId;

        throw new ArgumentException($"Invalid order number format: {orderNumber}. Expected format: '12345' or 'ORD-12345'", nameof(orderNumber));
    }

    /// <summary>
    /// Parses a company name into first and last name components
    /// </summary>
    public static (string firstName, string lastName) ParseCompanyName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return ("Company", "Name");

        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return parts.Length switch
        {
            0 => ("Company", "Name"),
            1 => ("Company", parts[0]),
            _ => (string.Join(" ", parts[..^1]), parts[^1])
        };
    }
}
