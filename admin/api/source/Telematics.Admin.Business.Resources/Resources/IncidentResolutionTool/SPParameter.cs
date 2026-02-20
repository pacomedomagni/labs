using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;


namespace Progressive.Telematics.Admin.Business.Resources;


public class SPParameter
{

    public string DataType { get; set; }

    public System.Nullable<int> Length { get; set; }

    public string Name { get; set; }

    public string Value { get; set; }
}

public class SPParameterDb
{
    public string DataType { get; set; }

    public System.Nullable<int> ParameterLength { get; set; }

    public string ParameterName { get; set; }

    public string Value { get; set; }
}
