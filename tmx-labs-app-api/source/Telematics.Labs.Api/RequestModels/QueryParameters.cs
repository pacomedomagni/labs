
using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Api.RequestModels
{
    public class QueryParameters
    {
        const int maxPageSize = 5000;
        private int pageSize = 0;

        public SortOrder SortOrder { get; set; } = SortOrder.Unspecified;

        public string SortField { get; set; }

        public string Filter { get; set; }

        public int Page { get; set; } = 0;

        public int PageSize
        {
            get
            {
                return pageSize;
            }
            set
            {
                pageSize = (value > maxPageSize) ? maxPageSize : value;
            }
        }

        public int PageCount { get; set; }
    }
}

