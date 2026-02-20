using System.Data;

namespace Progressive.Telematics.Labs.Shared.CodeTableManager;

	public interface IMyScoreCodeTableManager
	{
		DataSet TypedDataSet { get; }
	}
