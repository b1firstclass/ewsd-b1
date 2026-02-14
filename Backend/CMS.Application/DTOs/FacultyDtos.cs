using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CMS.Application.DTOs
{
    #region request
    public class FacultyCreateRequest
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters")]
        public required string Name { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class FacultyUpdateRequest
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters")]
        public required string Name { get; set; }

        public bool? IsActive { get; set; }
    }
    #endregion

    #region response
    public class FaculityInfo
    {
        public required string Id { get; set;  }
        public required string Name { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
    
    #endregion
}
