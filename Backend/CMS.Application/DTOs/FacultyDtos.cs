using System;
using System.Collections.Generic;
using System.Text;

namespace CMS.Application.DTOs
{
    #region request
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
