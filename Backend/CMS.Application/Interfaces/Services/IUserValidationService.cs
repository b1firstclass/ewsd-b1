namespace CMS.Application.Interfaces.Services
{
    public interface IUserValidationService
    {
        Task ValidateLoginIdAvailabilityAsync(string loginId, Guid? excludeUserId = null);
        Task ValidateEmailAvailabilityAsync(string? email, Guid? excludeUserId = null);
    }
}
