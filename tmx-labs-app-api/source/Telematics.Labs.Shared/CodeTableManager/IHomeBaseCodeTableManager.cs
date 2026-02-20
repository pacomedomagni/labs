using System.Data;

namespace Progressive.Telematics.Labs.Shared.CodeTableManager;

public interface IHomeBaseCodeTableManager
{
    DataSet TypedDataSet { get; }
}
