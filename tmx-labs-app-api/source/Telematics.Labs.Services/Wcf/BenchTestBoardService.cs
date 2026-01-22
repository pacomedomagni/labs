using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using BenchTestBoardService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IBenchTestBoardService
    {
        Task<AddBenchTestBoardResponse> AddBenchTestBoard(BenchTestBoard board);
        Task<DeleteBenchTestBoardResponse> DeleteBenchTestBoard(int boardId);
        Task<GetBenchTestBoardResponse> GetBenchTestBoard(int boardId);
        Task<UpdateBenchTestBoardResponse> UpdateBenchTestBoard(BenchTestBoard board);
        Task<GetAllBoardsByLocationResponse> GetAllBoardsByLocation(int locationCode);
    }

    public class BenchTestBoardService : WcfService<BenchTestBoardServiceClient>, IBenchTestBoardService
    {
        public BenchTestBoardService(ILogger<BenchTestBoardService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateBenchTestBoardServiceClient) { }

        public async Task<AddBenchTestBoardResponse> AddBenchTestBoard(BenchTestBoard board)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.AddAsync(new AddBenchTestBoardRequest
            {
                BenchTestBoard = board
            }), logger);
            return response;
        }

        public async Task<DeleteBenchTestBoardResponse> DeleteBenchTestBoard(int boardId)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.DeleteAsync(new DeleteBenchTestBoardRequest
            {
                BoardID = boardId
            }), logger);
            return response;
        }

        public async Task<GetBenchTestBoardResponse> GetBenchTestBoard(int boardId)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetAsync(new GetBenchTestBoardRequest
            {
                BoardID = boardId
            }), logger);
            return response;
        }

        public async Task<UpdateBenchTestBoardResponse> UpdateBenchTestBoard(BenchTestBoard board)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.UpdateAsync(new UpdateBenchTestBoardRequest
            {
                BenchTestBoard = board
            }), logger);
            return response;
        }

        public async Task<GetAllBoardsByLocationResponse> GetAllBoardsByLocation(int locationCode)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetAllBoardsByLocationAsync(new GetAllBoardsByLocationRequest
            {
                LocationCode = locationCode
            }), logger);
            return response;
        }
    }
}
