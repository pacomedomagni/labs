using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Shared;

namespace Progressive.Telematics.Admin.Services.Database
{
    public abstract class DbContext
    {
        protected readonly ILogger logger;

        private readonly string connectionString;

        protected DbContext(ILogger logger, string environment, string connectionString)
        {
            this.connectionString = connectionString.InsertEnvironmentType(environment);
            this.logger = logger;
        }

        private SqlConnection CreateSqlConnection()
        {
            return new SqlConnection(connectionString);
        }

        public async Task<List<DataTable>> ExecuteDataFillAsync(string spName, object parms)
        {
			var data = new List<DataTable>();
            using var sql = CreateSqlConnection();
            using var cmd = sql.CreateCommand();
            cmd.Connection = sql;
            cmd.CommandType = CommandType.StoredProcedure;
        	sql.Open();
            var result = await sql.ExecuteReaderAsync(spName, parms);
            while (!result.IsClosed)
            {
                var table = new DataTable();
                table.Load(result);
	            data.Add(table);
            }
			sql.Close();
            return data;
        }

		public async Task<IEnumerable<T>> ExecuteStoredProcedureAsync<T>(string spName, object parms, bool shouldThrowException = false)
        {
            return await executeQueryAsync<T>(spName, parms, CommandType.StoredProcedure, shouldThrowException);
        }

        public async Task<IEnumerable<T>> ExecuteQueryAsync<T>(string query, object parms, bool shouldThrowException = false)
        {
            return await executeQueryAsync<T>(query, parms, CommandType.Text, shouldThrowException);
        }

        async Task<IEnumerable<T>> executeQueryAsync<T>(string query, object parms, CommandType commandType, bool shouldThrowException = false)
        {
            using var sql = CreateSqlConnection();
            sql.Open();
            using var tran = sql.BeginTransaction();
			
            try
			{
                var result = await sql.QueryAsync<T>(query, parms, commandType: commandType, transaction: tran);
                tran.Commit();
                return result;
            }
            catch (Exception ex)
            {
                tran.Rollback();
                logger.LogError(LoggingEvents.SqlException, ex, $"Exception processing SQL {commandType.ToString()} transaction");

                if (shouldThrowException)
                {
                    throw;
                }

                return null;
            }
        }

		public async Task<int?> ExecuteNonQueryAsync(string command, object parms)
		{
			using var sql = CreateSqlConnection();
			sql.Open();
			using var tran = sql.BeginTransaction();

			try
			{
				var result = await sql.ExecuteAsync(command, parms, transaction: tran);
				tran.Commit();
				return result;
			}
			catch (Exception ex)
			{
				tran.Rollback();
				logger.LogError(LoggingEvents.SqlException, ex, "Exception processing SQL NonQuery transaction");
				throw;
			}
		}

		public async Task<T> ExecuteScalarAsync<T>(string query, object parms)
        {
            using var sql = CreateSqlConnection();
            sql.Open();
            using var tran = sql.BeginTransaction();

            try
            {
                var result = await sql.ExecuteScalarAsync<T>(query, parms, transaction: tran);
                tran.Commit();
                return result;
            }
            catch (Exception ex)
            {
                tran.Rollback();
                logger.LogError(LoggingEvents.SqlException, ex, "Exception processing SQL Scalar transaction");
                return default(T);
            }
        }
    }

    public static class DapperExtensions
    {
        public static DynamicParameters Parameter(this DynamicParameters parms, string name, object? value = null, DbType? dbType = null, int? size = null, ParameterDirection? direction = null)
        {
            parms.Add(name, value, dbType, direction, size);
            return parms;
        }
    }
}
