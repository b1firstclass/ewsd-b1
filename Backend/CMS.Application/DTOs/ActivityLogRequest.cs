using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    public class ActivityLogRequest
    {
        [Required(ErrorMessage = "Route is required")]
        [MaxLength(500, ErrorMessage = "Route must not exceed 500 characters")]
        public string Route { get; set; } = string.Empty;
    }
}
