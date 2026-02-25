namespace CMS.Application.Interfaces.Services
{
    public interface IPasswordHasherV2<T>
    {
        string HashPassword(T user, string password);
        PasswordVerificationResultV2 VerifyHashedPassword(T user, string hashedPassword, string providedPassword);
    }

    public enum PasswordVerificationResultV2
    {
        Failed,
        Success,
        SuccessRehashNeeded
    }
}
