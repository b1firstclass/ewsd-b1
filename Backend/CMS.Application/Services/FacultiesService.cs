using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using ewsd_backend.Application.Interfaces.Common;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CMS.Application.Services
{
    public class FacultiesService : IFacultiesService
    {
        private readonly ILogger<FacultiesService> _logger;
        private readonly IMapper _mapper;
        private readonly AppSettings _appSettings;
        private readonly IUnitOfWork _unitOfWork;
        public FacultiesService(ILogger<FacultiesService> logger, IMapper mapper, IOptions<AppSettings> appSettings,
            IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _mapper = mapper;
            _appSettings = appSettings.Value;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<FaculityInfo>> GetAllFacultiesAsync()
        {
            var faculties = await _unitOfWork.Repository<Faculty>().GetAllAsync();
            return _mapper.Map<List<FaculityInfo>>(faculties);
        }
    }
}
