using System;
using Microsoft.Extensions.Caching.Memory;

namespace Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;

	public sealed class DataCache : IDataCache
{
	#region  Member Variables
	private static IDataCache mInstance;
		private IMemoryCache mCache;
	#endregion  Member Variables

	#region CONSTRUCTORS

	public DataCache(IMemoryCache memoryCache)
		{
			mCache = memoryCache;
		}

		#endregion CONSTRUCTORS

    #region Properties

    public static IDataCache Instance
    {
        get { return mInstance; }
        set { mInstance = value; }
    }

    #endregion Properties


    #region METHODS

	public object GetCache( string cacheKey )
		{
			return mCache.Get(cacheKey);
		}

		public void SetCache( string cacheKey, object obj, int expireAfterSeconds )
		{
			var cacheEntryOptions = new MemoryCacheEntryOptions
			{
				AbsoluteExpiration = DateTimeOffset.Now.AddSeconds(expireAfterSeconds)
			};
			mCache.Set(cacheKey, obj, cacheEntryOptions);
		}

		public void RemoveCache( string cacheKey )
		{
			mCache.Remove( cacheKey );
		}

		#endregion METHODS
	}
