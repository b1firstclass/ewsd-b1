namespace CMS.Domain.Entities;

public partial class Faculty
{
    public Guid FacultyId { get; set; }

    public string FacultyName { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public Guid? ModifiedBy { get; set; }

    public virtual ICollection<Contribution> Contributions { get; set; } = new List<Contribution>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
