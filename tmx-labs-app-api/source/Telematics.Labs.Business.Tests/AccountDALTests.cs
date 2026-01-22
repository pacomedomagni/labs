using System;
using System.Data;
using System.Reflection;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests;

public class AccountDALTests
{
    [Fact]
    public void MapRow_ResolvesColumnsCaseInsensitively()
    {
        var table = new DataTable();
        table.Columns.Add("ParticipantSeqID", typeof(int));
        table.Columns.Add("ParticipantGroupSeqID", typeof(int));
        table.Columns.Add("DeviceSeqID", typeof(int));
        table.Columns.Add("vin", typeof(string));
        table.Columns.Add("reportedvin", typeof(string));
        table.Columns.Add("devicereturnreasoncode", typeof(int));
        table.Columns.Add("devicereceiveddatetime", typeof(DateTime));
        table.Columns.Add("deviceabandoneddatetime", typeof(DateTime));
        table.Columns.Add("lastupdatedatetime", typeof(DateTime));

        var row = table.NewRow();
        row["ParticipantSeqID"] = 100;
        row["ParticipantGroupSeqID"] = 200;
        row["DeviceSeqID"] = 300;
        row["vin"] = "VIN-ABC";
        row["reportedvin"] = "VIN-REPORTED";
        row["devicereturnreasoncode"] = 9;
        var received = new DateTime(2024, 3, 1, 8, 45, 0, DateTimeKind.Utc);
        var abandoned = new DateTime(2024, 3, 5, 9, 0, 0, DateTimeKind.Utc);
        var lastUpdate = new DateTime(2024, 2, 28, 7, 15, 0, DateTimeKind.Utc);
        row["devicereceiveddatetime"] = received;
        row["deviceabandoneddatetime"] = abandoned;
        row["lastupdatedatetime"] = lastUpdate;
        table.Rows.Add(row);

        var mapRowMethod = typeof(AccountDAL)
            .GetMethod("MapRow", BindingFlags.Static | BindingFlags.NonPublic);
        Assert.NotNull(mapRowMethod);

        var account = (AccountDataModel)mapRowMethod.Invoke(null, new object[] { row, table });

        Assert.Equal("VIN-ABC", account.VIN);
        Assert.Equal(9, account.DeviceReturnReasonCode);
        Assert.Equal(received, account.DeviceReceivedDateTime);
        Assert.Equal(abandoned, account.DeviceAbandonedDateTime);
        Assert.Equal(lastUpdate, account.LastUpdateDateTime);
    }
}
