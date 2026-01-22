using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using BenchTestServices;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IBenchTestService
    {
        Task<AddBenchTestResponse> AddBenchTest(BenchTest benchTest);
        Task<StopBenchTestResponse> StopBenchTest(int boardId);
        Task<ClearBenchTestResponse> ClearBenchTest(int boardId);
        Task<StopIfCompleteBenchTestResponse> StopIfCompleteBenchTest(int boardId);
    }

    public class BenchTestService : WcfService<BenchTestServiceClient>, IBenchTestService
    {
        public BenchTestService(ILogger<BenchTestService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateBenchTestServiceClient) { }

        public async Task<AddBenchTestResponse> AddBenchTest(BenchTest benchTest)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.AddAsync(new AddBenchTestRequest
            {
                BenchTest = benchTest
            }), logger);
            return response;
        }

        public async Task<StopBenchTestResponse> StopBenchTest(int boardId)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.StopAsync(new StopBenchTestRequest
            {
                BoardID = boardId
            }), logger);
            return response;
        }

        public async Task<ClearBenchTestResponse> ClearBenchTest(int boardId)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.ClearAsync(new ClearBenchTestRequest
            {
                BoardID = boardId
            }), logger);
            return response;
        }

        public async Task<StopIfCompleteBenchTestResponse> StopIfCompleteBenchTest(int boardId)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.StopIfCompleteAsync(new StopIfCompleteBenchTestRequest
            {
                BoardID = boardId
            }), logger);
            return response;
        }
    }
}
