using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Progressive.Telematics.Labs.Business.Resources;

namespace Progressive.Telematics.Labs.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public abstract class TelematicsController<T> : ControllerBase
    {
        private T orchestrator;

        protected T Orchestrator => orchestrator ?? (orchestrator = HttpContext.RequestServices.GetService<T>());

        protected void AddPaginationHeader<T2>(PagedList<T2> data)
        {
            var paginationMetadata = new
            {
                totalCount = data.TotalCount,
                queryCount = data.Count,
                pageSize = data.PageSize,
                currentPage = data.CurrentPage,
                totalPages = data.TotalPages,
                hasNext = data.HasNext,
                hasPrevious = data.HasPrevious
            };
            Response.Headers.Append("x-pagination", JsonSerializer.Serialize(paginationMetadata));
        }
    }
}

