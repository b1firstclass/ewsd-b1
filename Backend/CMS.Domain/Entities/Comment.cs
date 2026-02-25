namespace CMS.Domain.Entities;

public partial class Comment
{
    public Guid CommentId { get; set; }

    public Guid ContributionId { get; set; }

    public string Comment1 { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public Guid? ModifiedBy { get; set; }

    public virtual Contribution Contribution { get; set; } = null!;
}
