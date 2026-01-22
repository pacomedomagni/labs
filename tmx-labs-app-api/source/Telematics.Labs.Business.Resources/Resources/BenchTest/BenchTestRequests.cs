
namespace Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest
{
    public class BenchTestBoard
    {
        public int? BoardID { get; set; }
        public string Name { get; set; }
        public int? LocationCode { get; set; }
        public int? StatusCode { get; set; }
        public string UserID { get; set; }
        public System.DateTime? StartDateTime { get; set; }
        public System.DateTime? EndDateTime { get; set; }
    }

    public class AddBenchTestBoardRequest
    {
        public BenchTestBoard Board { get; set; }
    }

    public class UpdateBenchTestBoardRequest
    {
        public BenchTestBoard Board { get; set; }
    }

    public class DeleteBenchTestBoardRequest
    {
        public int BoardId { get; set; }
    }

    public class GetBenchTestBoardRequest
    {
        public int BoardId { get; set; }
    }

    public class GetAllBoardsByLocationRequest
    {
        public int LocationCode { get; set; }
    }
}
