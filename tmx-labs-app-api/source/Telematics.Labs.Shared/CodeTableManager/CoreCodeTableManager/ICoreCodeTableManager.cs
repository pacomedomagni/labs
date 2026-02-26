using System.Data;

namespace Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;

	public interface ICoreCodeTableManager
	{ 
    DataSet CodeTables { get; }

		DataTable GetGlobalCodeTable(string tableName);
		DataTable GetCodeTable(string tableName);
		DataTable GetCodeTable(string tableName, bool excludeRetired);
		DataTable GetCodeTable(string tableName, string code);
		
		string GetCodeFromDescription(string tableName, string description);
		string GetCodeFromDescription(string tableName, string description, bool excludeRetired, string defaultCode);
		string GetDescriptionFromCode(string tableName, string code);
		string GetDescriptionFromCode(string tableName, string code, bool excludeRetired, string defaultDescription);

		string GetCategoryFromCode(string tableName, string code);
		string GetCategoryFromCode(string tableName, string code, bool excludeRetired, string defaultCategory);

    bool CodeTableValueExists(string tableName, string column, string value);
    int? GetIntegerValueFromCodeTable(string tableName, string keyColumnName, string keyColumnValue, string value, bool throwException);
    string GetValueFromCodeTable(string tableName, string keyColumnName, string keyColumnValue, string valueColumnName, bool throwException);
    int? GetIntegerValueFromCodeTableWithFilter(string tableName, string filter, string valueColumnName, bool throwException);
    string GetValueFromCodeTableWithFilter(string tableName, string filter, string valueColumnName, bool throwException);
    float? GetFloatValueFromCodeTableWithFilter(string tableName, string filter, string valueColumnName, bool throwException);

    void InsertBlankCodeRow( DataTable dataTable );
    void InsertBlankCodeRow( string codeColumnName, DataTable dataTable );
		void Retrieve();
		void Reset();
	}
