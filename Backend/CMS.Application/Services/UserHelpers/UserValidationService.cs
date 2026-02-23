using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;

namespace CMS.Application.Services.UserHelpers
{
    public interface IUserValidationService
    {
        Task ValidateLoginIdAvailabilityAsync(string loginId, Guid? excludeUserId = null);
        Task ValidateEmailAvailabilityAsync(string? email, Guid? excludeUserId = null);
    }

    public class UserValidationService : IUserValidationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserValidationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task ValidateLoginIdAvailabilityAsync(string loginId, Guid? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(loginId))
            {
                return;
            }

            var exists = await LoginIdExistsAsync(loginId, excludeUserId);
            if (exists)
            {
                throw new InvalidOperationException($"Login ID '{loginId}' is already taken");
            }
        }

        public async Task ValidateEmailAvailabilityAsync(string? email, Guid? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return;
            }

            var exists = await EmailExistsAsync(email, excludeUserId);
            if (exists)
            {
                throw new InvalidOperationException($"Email '{email}' is already taken");
            }
        }

        private async Task<bool> LoginIdExistsAsync(string loginId, Guid? excludeUserId)
        {
            var existingUser = await _unitOfWork.UsersRepository.GetByLoginIdAsync(loginId);
            if (existingUser == null)
            {
                return false;
            }

            return !excludeUserId.HasValue || existingUser.UserId != excludeUserId.Value;
        }

        private async Task<bool> EmailExistsAsync(string email, Guid? excludeUserId)
        {
            var existingUser = await _unitOfWork.UsersRepository.GetByEmailAsync(email);
            if (existingUser == null)
            {
                return false;
            }

            return !excludeUserId.HasValue || existingUser.UserId != excludeUserId.Value;
        }
    }
}
