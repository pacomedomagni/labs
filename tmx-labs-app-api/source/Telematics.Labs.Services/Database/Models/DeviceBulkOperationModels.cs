using System;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    /// <summary>
    /// Model for bulk device activity insert operations
    /// </summary>
    public class DeviceActivityBulkInsertModel
    {
        public int DeviceSeqID { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// Model for bulk device update operations during bench test verification
    /// </summary>
    public class XirgoDeviceBulkUpdateModel
    {
        public int DeviceSeqID { get; set; }
        public bool? IsCommunicationAllowed { get; set; }
        public byte? StatusCode { get; set; }
        public string ReportedVIN { get; set; }
        public string WTFStateInfo { get; set; }
        public int? ReportedProtocolCode { get; set; }
        public DateTime? LastRemoteResetDateTime { get; set; }
    }
}
