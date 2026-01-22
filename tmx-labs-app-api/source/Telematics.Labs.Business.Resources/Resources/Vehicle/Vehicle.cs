using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Vehicle;
public class Vehicle
{
    public Vehicle()
    {
    }

    public Vehicle(DataRow row)
    {
        Year = (Int16)row["Year"];
        Make = (string)row["Make"];
        Model = (string)row["Model"];
        if (row.Table.Columns["CreateDateTime"] != null)
        {
            CreateDateTime = (DateTime)row["CreateDateTime"];
        }
        //if an SP needs to return more than one CreateDateTime, it was prefixed with the table name
        else if (row.Table.Columns["VehicleCreateDateTime"] != null)
        {
            CreateDateTime = (DateTime)row["VehicleCreateDateTime"];
        }
        VehicleSeqID = (int)row["VehicleSeqID"];
        if (row["VIN"] is DBNull)
        { }
        else
        {
            VIN = (string)row["VIN"];
        }

        if (row.Table.Columns["VehicleExternalId"] != null)
        {
            if (!DBNull.Value.Equals(row["VehicleExternalId"]))
            {
                VehicleExternalId = row["VehicleExternalId"].ToString();
            }
        }
    }

    [DataMember(IsRequired = true)]
    public Int16 Year { get; set; }

    [DataMember(IsRequired = true)]
    public string Make { get; set; }

    [DataMember(IsRequired = true)]
    public string Model { get; set; }

    [DataMember(IsRequired = true)]
    public DateTime CreateDateTime { get; set; }

    [DataMember(IsRequired = true)]
    public int VehicleSeqID { get; set; }

    [DataMember(IsRequired = false, EmitDefaultValue = true)]
    public string VIN = null;

    [DataMember(IsRequired = false, EmitDefaultValue = true)]
    public string VehicleExternalId { get; set; }

}
