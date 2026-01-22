namespace Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest
{
    public class BenchTestBoardResponse : Resource
    {
        public BenchTestBoard Board { get; set; }
    }

    public class BenchTestBoardCollectionResponse : Resource
    {
        public BenchTestBoard[] Boards { get; set; }
        public int ResultCount { get; set; }
    }
}
