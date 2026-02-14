using System.ComponentModel.DataAnnotations;

namespace CMS.Application.Common
{
    public class PaginationRequest
    {
        private const int DefaultPageNumber = 1;
        private const int DefaultPageSize = 20;
        private const int MaxPageSize = 100;

        [Range(1, int.MaxValue)]
        public int PageNumber { get; set; } = DefaultPageNumber;

        [Range(1, MaxPageSize)]
        public int PageSize { get; set; } = DefaultPageSize;

        public int GetSkipCount()
        {
            return (PageNumber - 1) * PageSize;
        }
    }
}
