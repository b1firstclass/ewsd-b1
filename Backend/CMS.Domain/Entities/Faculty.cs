namespace CMS.Domain.Entities;

public partial class Faculty
{
    public string FacultyId { get; set; } = null!;

    public string FacultyName { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public string? ModifiedBy { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
