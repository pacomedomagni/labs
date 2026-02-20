namespace Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;

	public interface IDataCache
	{ 
    
		object GetCache(string cacheKey);
		void SetCache(string cacheKey, object obj, int expireAfterSeconds);
		void RemoveCache(string cacheKey);



	}
