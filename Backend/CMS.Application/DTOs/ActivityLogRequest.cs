using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    public class ActivityLogRequest
    {
        [Required]
        public string Route { get; set; } = string.Empty;
    }
}
