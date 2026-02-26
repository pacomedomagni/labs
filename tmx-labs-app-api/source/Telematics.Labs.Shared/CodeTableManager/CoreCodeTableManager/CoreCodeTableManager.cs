using System;
using System.Data;

namespace Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;

	[Serializable]
	public abstract class CoreCodeTableManager : ICoreCodeTableManager
{
    #region  Member Variables
    public abstract ICodeTableProvider Provider{get; }
    #endregion  Member Variables


    #region  Properties
    public virtual DataSet CodeTables
		{
			get
			{

            DataSet ds = DataCache.Instance.GetCache(Provider.Key) as DataSet;
				if (ds == null)
				{
					Retrieve();
                ds = DataCache.Instance.GetCache(Provider.Key) as DataSet;
				}
				return ds;
			}
    }
    #endregion  Properties

    #region  Methods

		public void Reset()
		{
			DataCache.Instance.RemoveCache(Provider.Key);
		}

    public void Retrieve()
		{
        int expireAfterSeconds = Provider.ExpirationSeconds;
        DataCache.Instance.SetCache(Provider.Key, Provider.CodeTableDataSet, expireAfterSeconds);
    }
    #endregion  Methods

    #region ICodeTablesManager Methods

    public DataTable GetGlobalCodeTable(string tableName)
		{
        if (tableName.Length > 0)
        {
            DataSet codeTables = CodeTables;
            DataTable dataTable;
            dataTable = codeTables.Tables[tableName];

            return dataTable != null ? dataTable.Copy() : null;
        }

			return null;
		}

		public DataTable GetCodeTable(string tableName)
		{
			return GetCodeTable(tableName, true);
		}

		public DataTable GetCodeTable(string tableName, bool excludeRetired)
		{
			DataTable dt = null;

        if (tableName.Length > 0)
        {
            DataSet codeTables = CodeTables;
            dt = codeTables.Tables[tableName];

            if (dt == null)
                return dt;

            DataTable dtClone = dt.Clone();
            DataRow[] dataRows = codeTables.Tables[tableName].Select("");
            if (excludeRetired)
            {
                if (codeTables.Tables[tableName].Columns.Contains("IsRetired"))
                {
                    dataRows = codeTables.Tables[tableName].Select("IsRetired = 'N'");
                }
            }
            foreach (DataRow dr in dataRows)
            {
                dtClone.ImportRow(dr);
            }
            dt = dtClone;
        }

			return dt;
		}

		public DataTable GetCodeTable(string tableName, string code)
		{
        DataTable dataTable = GetCodeTable(tableName, true);

        DataTable codeTable = dataTable.Clone();

        DataRow[] dataRows = dataTable.Select("code = '" + code + "'");

        foreach (DataRow dataRow in dataRows)
        {
            codeTable.ImportRow(dataRow);
        }

        return codeTable;
		}

		public string GetDescriptionFromCode(string tableName, string code)
		{
			return GetDescriptionFromCode(tableName, code, true, "Unknown");
		}

		public string GetDescriptionFromCode(string tableName, string code, bool excludeRetired, string defaultDescription)
		{
			string rtn = string.Empty;
        if (code.Length > 0)
        {
            DataTable localTable = GetCodeTable(tableName, excludeRetired);
            string filter = string.Format("{0} = '{1}'", "Code", code);
            DataRow[] rows = localTable.Select(filter);
            if (rows.Length > 0)
            {
                rtn = rows[0]["Description"].ToString();
            }
            else
            {
                rtn = defaultDescription;
            }
        }
        else
        {
            rtn = defaultDescription;
        }

			return rtn;
		}

		public string GetCodeFromDescription(string tableName, string description)
		{
			return GetCodeFromDescription(tableName, description, true, "Unknown");
		}

		public string GetCodeFromDescription(string tableName, string description, bool excludeRetired, string defaultCode)
		{
			string rtn = string.Empty;
        if (description.Length > 0)
        {
            DataTable localTable = GetCodeTable(tableName, excludeRetired);
            string filter = string.Format("{0} = '{1}'", "Description", description);
            DataRow[] rows = localTable.Select(filter);
            if (rows.Length > 0)
            {
                rtn = rows[0]["Code"].ToString();
            }
            else
            {
                rtn = defaultCode;
            }
        }

			return rtn;
		}

		public bool CodeTableValueExists(string tableName, string column, string value)
		{
        DataTable dataTable = GetCodeTable(tableName);

        if (dataTable == null)
        {
            throw new ApplicationException("Code table not found.");
        }

        DataRow[] dataRows = dataTable.Select(string.Format("{0} = '{1}'", column, value));
        if (dataRows.Length == 0)
        {
            return false;
        }

			return true;
		}

    public int? GetIntegerValueFromCodeTable(string tableName, string keyColumnName, string keyColumnValue, string valueColumnName, bool throwException)
    {
        int returnValue = -1;
       
        DataTable dataTable = GetCodeTable(tableName);

        if (dataTable == null)
        {
            if (throwException)
                throw new ApplicationException(string.Format("Code table {0} not found.", tableName));
            else
                return null;
        }

        DataRow[] dataRows = dataTable.Select(string.Format("{0} = '{1}'", keyColumnName, keyColumnValue));
        if (dataRows.Length == 0)
        {
            if (throwException)
                throw new ApplicationException(string.Format("Code table key column value {0} not found in column {1} in {2} code table.", keyColumnValue, keyColumnName, tableName));
            else
                return null;
        }

        if (!int.TryParse(dataRows[0][valueColumnName].ToString(), out returnValue))
        {
            if (throwException)
                throw new ApplicationException(string.Format("Value in column {0} in code table {2} can not be converted to integer.", valueColumnName, keyColumnName, tableName));
            else
                return null;
        }

        return returnValue;
    }

    public string GetValueFromCodeTable(string tableName, string keyColumnName, string keyColumnValue, string valueColumnName, bool throwException)
    {
        DataTable dataTable = GetCodeTable(tableName);

        if (dataTable == null)
        {
            if (throwException)
                throw new ApplicationException(string.Format("Code table {0} not found.", tableName));
            else
                return null;
        }

        DataRow[] dataRows = dataTable.Select(string.Format("{0} = '{1}'", keyColumnName, keyColumnValue));
        if (dataRows.Length == 0)
        {
            if (throwException)
                throw new ApplicationException(string.Format("Code table key column value {0} not found in column {1} in {2} code table.", keyColumnValue, keyColumnName, tableName));
            else
                return null;
        }

        return dataRows[0][valueColumnName].ToString();
    }

    public int? GetIntegerValueFromCodeTableWithFilter(string tableName, string filter, string valueColumnName, bool throwException)
    {
        int returnValue = -1;

        DataTable dataTable = GetCodeTable(tableName);

        if (dataTable == null)
        {
            if (throwException)
                throw new ApplicationException(string.Format("Code table {0} not found.", tableName));
            else
                return null;
        }

        DataRow[] dataRows = dataTable.Select(filter);
        if (dataRows.Length == 0)
        {
            if (throwException)
                throw new ApplicationException(string.Format("No results found using filter {0} in {1} code table.", filter, tableName));
            else
                return null;
        }

        if (!int.TryParse(dataRows[0][valueColumnName].ToString(), out returnValue))
        {
            if (throwException)
                throw new ApplicationException(string.Format("Value in column {0} in code table {1} can not be converted to integer.", valueColumnName, tableName));
            else
                return null;
        }

        return returnValue;
    }

    public float? GetFloatValueFromCodeTableWithFilter(string tableName, string filter, string valueColumnName, bool throwException)
    {
        float returnValue = -1;

        DataTable dataTable = GetCodeTable(tableName);

        if (dataTable == null)
        {
            if (throwException)
                throw new ApplicationException(string.Format("Code table {0} not found.", tableName));
            else
                return null;
        }

        DataRow[] dataRows = dataTable.Select(filter);
        if (dataRows.Length == 0)
        {
            if (throwException)
                throw new ApplicationException(string.Format("No results found using filter {0} in {1} code table.", filter, tableName));
            else
                return null;
        }

        if (!float.TryParse(dataRows[0][valueColumnName].ToString(), out returnValue))
        {
            if (throwException)
                throw new ApplicationException(string.Format("Value in column {0} in code table {1} can not be converted to integer.", valueColumnName, tableName));
            else
                return null;
        }

        return returnValue;
    }

    public string GetValueFromCodeTableWithFilter(string tableName, string filter, string valueColumnName, bool throwException)
    {
        DataTable dataTable = GetCodeTable(tableName);

        if (dataTable == null)
        {
            if (throwException)
                throw new ApplicationException(string.Format("Code table {0} not found.", tableName));
            else
                return null;
        }

        DataRow[] dataRows = dataTable.Select(filter);
        if (dataRows.Length == 0)
        {
            if (throwException)
                throw new ApplicationException(string.Format("No results found using filter {0} in {1} code table.", filter, tableName));
            else
                return null;
        }

        return dataRows[0][valueColumnName].ToString();
    }

		public string GetCategoryFromCode(string tableName, string code)
		{
			return GetCategoryFromCode(tableName, code, true, "Unknown");
		}

		public string GetCategoryFromCode(string tableName, string code, bool excludeRetired, string defaultCategory)
		{
			string rtn = string.Empty;
        if (code.Length > 0)
        {
            DataTable localTable = GetCodeTable(tableName, excludeRetired);
            string filter = string.Format("{0} = '{1}'", "Code", code);
            DataRow[] rows = localTable.Select(filter);
            if (rows.Length > 0)
            {
                rtn = rows[0]["Category"].ToString();
            }
            else
            {
                rtn = defaultCategory;
            }
        }
        else
        {
            rtn = defaultCategory;
        }
			return rtn;
		}

		public void InsertBlankCodeRow( DataTable dataTable )
		{
			InsertBlankCodeRow("Code", dataTable);
		}

		public void InsertBlankCodeRow( string codeColumnName, DataTable dataTable )
		{
        DataRow blankRow;

        blankRow = dataTable.NewRow();
        blankRow[codeColumnName] = string.Empty;
        dataTable.Rows.InsertAt(blankRow, 0);
		}

		#endregion
	}
