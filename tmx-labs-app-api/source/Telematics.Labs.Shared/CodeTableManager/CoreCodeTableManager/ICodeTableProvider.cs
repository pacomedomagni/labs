using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;

namespace Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;

public interface ICodeTableProvider
{
    string Key{get;}
    int ExpirationSeconds{get;}
    DataSet CodeTableDataSet { get; }
}
