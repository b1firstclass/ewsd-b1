using System;
using System.Collections.Generic;
using System.Text;

namespace CMS.Application.Common
{
    public class PagedResponse<T>
    {
        public IReadOnlyList<T> Items { get; init; } = new List<T>();
        public int Count { get; init; }

        public PagedResponse(IReadOnlyList<T> items, int count)
        {
            Items = items;
            Count = count;
        }
    }
}
