using System;
using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources;

public class PagedList<T> : List<T>
{
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public bool HasPrevious => CurrentPage > 0;
    public bool HasNext => CurrentPage < TotalPages - 1;

    public PagedList(IEnumerable<T> items, int count, int pageNumber, int pageSize)
    {
        TotalCount = count;
        PageSize = pageSize;
        CurrentPage = pageNumber;
        TotalPages = pageSize == 0 ? 1 : (int)Math.Ceiling(count / (double)pageSize);
        AddRange(items);
    }
}

