using Microsoft.Extensions.Caching.Memory;
using Progressive.Telematics.Admin.Business.Resources.Resources.Shared;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Shared.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
	public interface IScoringAlgorithmsOrchestrator
	{
        Task<ScoringAlgorithmData> GetScoringAlgorithmByCodeAsync(int scoringAlorithmCode);

    }

	public class ScoringAlgorithmsOrchestrator : IScoringAlgorithmsOrchestrator
	{
		private readonly IScoringAlgorithmDAL _scoringAlgorithmDAL;
		private readonly IMemoryCache _memoryCache;

		public ScoringAlgorithmsOrchestrator(IScoringAlgorithmDAL scoringAlgorithmDAL, IMemoryCache memoryCache)
		{
			_scoringAlgorithmDAL = scoringAlgorithmDAL ?? throw new ArgumentNullException(nameof(scoringAlgorithmDAL));
			_memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
		}

		public async Task<ScoringAlgorithmData> GetScoringAlgorithmByCodeAsync(int scoringAlorithmCode)
		{
            Dictionary<int, ScoringAlgorithmData> cachedScoringData = await _memoryCache.GetOrCreateAsync("scoringAlgorithms", async cacheEntry =>
			{
				cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(90);
				IEnumerable<ScoringAlgorithmData> scoringAlgorithms = await _scoringAlgorithmDAL.GetScoringAlgorithmsAsync();
                return scoringAlgorithms.ToDictionary(k => k.Code);
			}).ConfigureAwait(false);
			return cachedScoringData[scoringAlorithmCode];
		}
	}
}
