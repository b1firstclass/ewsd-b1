using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CMS.Application.Services
{
    public class UsersService : IUsersService
    {
        private readonly ILogger<UsersService> _logger;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly AppSettings _appSettings;
        private readonly IUnitOfWork _unitOfWork;
        public UsersService(ILogger<UsersService> logger, IMapper mapper, IPasswordHasher<User> passwordHasher,
            IOptions<AppSettings> appSettings, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _appSettings = appSettings.Value;
            _unitOfWork = unitOfWork;
        }

        public bool IsLoginIdExists(string loginId)
        {             
            return _unitOfWork.UsersRepository.IsLoginIdExists(loginId);
        }

        public async Task<User> RegisterUserAsync(UserRegisterRequest request)
        {
            var userEntity = _mapper.Map<User>(request);
            userEntity.Password = _passwordHasher.HashPassword(userEntity, request.Password);
            await _unitOfWork.Repository<User>().AddAsync(userEntity);
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("User created: {UserId} - {LoginId}", userEntity.UserId, userEntity.LoginId);
            return userEntity;
        }
    }
}
