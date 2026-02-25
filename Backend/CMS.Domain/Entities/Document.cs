namespace CMS.Domain.Entities;

public partial class Document
{
    public Guid DocumentId { get; set; }

    public Guid ContributionId { get; set; }

    public string FileName { get; set; } = null!;

    public string Extension { get; set; } = null!;

    public int Size { get; set; }

    public byte[]? Data { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public Guid? ModifiedBy { get; set; }

    public virtual Contribution Contribution { get; set; } = null!;
}
