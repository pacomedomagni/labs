using System;
using System.Data;

namespace Progressive.Telematics.Labs.Business.Resources;
public class TMXServer
{
    //public TMXServer(DataRow row)
    //{
    //    Code = Int32.Parse(row["Code"].ToString());
    //    Description = row["Description"].ToString();
    //    IsActive = Convert.ToBoolean(row["IsActive"].ToString());
    //    CreateDateTime = Convert.ToDateTime(row["CreateDateTime"].ToString());
    //}

    public int UbiServerSeqId { get; set; }

    public string ServerName { get; set; }

    public int ServerTypeCode { get; set; }

    public DateTime CreateDateTime { get; set; }
}

