using AutoMapper;
using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using ewsd_backend.Application.Interfaces.Common;
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
    }
}
