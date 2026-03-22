namespace CMS.Application.Interfaces.Services
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string? UserName { get; }
        IReadOnlyList<Guid> FacultyIds { get; }
    }
}
