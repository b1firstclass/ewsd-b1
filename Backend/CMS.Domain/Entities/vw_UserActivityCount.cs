namespace CMS.Domain.Entities;

public partial class vw_UserActivityCount
{
    public string? FullName { get; set; }

    public Guid? UserId { get; set; }

    public long? count { get; set; }
}
