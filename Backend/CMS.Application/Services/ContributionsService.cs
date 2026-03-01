using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class ContributionsService : IContributionsService
    {
        private readonly ILogger<ContributionsService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IContributionAuthorizationService _authorizationService;
        private readonly IContributionFileService _fileService;
        private readonly IContributionStatusService _statusService;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public ContributionsService(
            ILogger<ContributionsService> logger,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IContributionAuthorizationService authorizationService,
            IContributionFileService fileService,
            IContributionStatusService statusService,
            IMapper mapper,
            IEmailService emailService)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _authorizationService = authorizationService;
            _fileService = fileService;
            _statusService = statusService;
            _mapper = mapper;
            _emailService = emailService;
        }

        public async Task<ContributionInfo> CreateContributionAsync(ContributionCreateRequest request)
        {
            var currentUser = await GetAuthenticatedUserAsync();
            await _authorizationService.ValidateStudentCanCreateContributionAsync(currentUser);

            await ValidateContributionWindowExistsAsync(request.ContributionWindowId);
            await ValidateFacultyExistsAsync(request.FacultyId);

            _fileService.ValidateDocumentFile(request.DocumentFile);
            _fileService.ValidateImageFile(request.ImageFile);

            var contribution = CreateNewContribution(request, currentUser.UserId);
            AddDocumentsToContribution(contribution, request, currentUser.UserId);

            await _unitOfWork.ContributionsRepository.AddAsync(contribution);
            await _unitOfWork.SaveChangesAsync();

            var facultyCoordintors = await _unitOfWork.UsersRepository.GetUsersByFacultyIdAsync(new List<Guid> { request.FacultyId }, RoleNames.Coordinator);

            foreach (var coordinator in facultyCoordintors)
            {
                var body = _emailService.GenerateEmailBody("New Contribution Created", coordinator.FullName, "A new contribution is submitted under your faculty.");
                await _emailService.SendEmailAsync(coordinator.Email, "New Contribution Created", body);
            }

            _logger.LogInformation("Contribution created: {ContributionId}", contribution.ContributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }

        private async Task<User> GetAuthenticatedUserAsync()
        {
            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");
            var currentUser = await _unitOfWork.UsersRepository.GetByUserIdAsync(currentUserId);

            if (currentUser == null)
            {
                throw new UnauthorizedAccessException("Unauthorized");
            }

            return currentUser;
        }

        private async Task ValidateContributionWindowExistsAsync(Guid contributionWindowId)
        {
            var contributionWindow = await _unitOfWork.ContributionWindowsRepository.GetByIdAsync(contributionWindowId);
            if (contributionWindow == null)
            {
                throw new InvalidOperationException("Contribution window not found");
            }
        }

        private async Task ValidateFacultyExistsAsync(Guid facultyId)
        {
            var faculty = await _unitOfWork.FacultiesRepository.GetByIdAsync(facultyId);
            if (faculty == null)
            {
                throw new InvalidOperationException("Faculty not found");
            }
        }

        private static Contribution CreateNewContribution(ContributionCreateRequest request, Guid currentUserId)
        {
            var now = DateTime.UtcNow;
            return new Contribution
            {
                ContributionId = Guid.NewGuid(),
                ContributionWindowId = request.ContributionWindowId,
                FacultyId = request.FacultyId,
                UserId = currentUserId,
                Subject = request.Subject.Trim(),
                Description = request.Description.Trim(),
                Rating = 0,
                Status = ContributionConstants.StatusDraft,
                IsActive = true,
                CreatedDate = now,
                CreatedBy = currentUserId
            };
        }

        private void AddDocumentsToContribution(Contribution contribution, ContributionCreateRequest request, Guid currentUserId)
        {
            contribution.Documents.Add(_fileService.CreateDocument(request.DocumentFile, contribution.ContributionId, currentUserId));

            if (request.ImageFile != null)
            {
                contribution.Documents.Add(_fileService.CreateDocument(request.ImageFile, contribution.ContributionId, currentUserId));
            }
        }

        public async Task<ContributionFilesDownload?> DownloadAllContributionFilesAsync()
        {
            _ = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var contributions = await _unitOfWork.ContributionsRepository.GetAllWithDocumentsAsync();
            if (contributions.Count == 0)
            {
                _logger.LogWarning("No contributions found for file download");
                return null;
            }

            var download = _fileService.CreateZipArchive(contributions);
            if (download == null)
            {
                _logger.LogWarning("No active contribution files found for download");
            }

            return download;
        }

        public async Task<ContributionFilesDownload?> DownloadContributionFilesAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");
            var contribution = await _unitOfWork.ContributionsRepository.GetByIdWithDocumentsAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for file download: {ContributionId}", contributionId);
                return null;
            }

            await _authorizationService.ValidateUserOwnsContributionAsync(contribution, currentUserId);

            if (!_statusService.IsStatusDraft(contribution.Status))
            {
                throw new InvalidOperationException("Only draft contributions can be updated.");
            }

            var download = _fileService.CreateZipArchiveForSingleContribution(contribution);
            if (download == null)
            {
                _logger.LogWarning("No active files found for contribution {ContributionId}", contributionId);
            }

            return download;
        }

        public async Task<ContributionInfo?> UpdateContributionAsync(Guid contributionId, ContributionUpdateRequest request)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdWithDocumentsAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for update: {ContributionId}", contributionId);
                return null;
            }

            if (contribution.CreatedBy != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (!string.IsNullOrWhiteSpace(request.Subject))
            {
                contribution.Subject = request.Subject.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                contribution.Description = request.Description.Trim();
            }

            if (request.DocumentFile != null)
            {
                _fileService.ValidateDocumentFile(request.DocumentFile);
                _fileService.DisableDocumentsOfType(contribution, ContributionConstants.AllowedDocumentExtensions, currentUserId);
                contribution.Documents.Add(_fileService.CreateDocument(request.DocumentFile, contribution.ContributionId, currentUserId));
            }

            if (request.ImageFile != null)
            {
                _fileService.ValidateImageFile(request.ImageFile);
                _fileService.DisableDocumentsOfType(contribution, ContributionConstants.AllowedImageExtensions, currentUserId);
                contribution.Documents.Add(_fileService.CreateDocument(request.ImageFile, contribution.ContributionId, currentUserId));
            }

            contribution.ModifiedDate = DateTime.UtcNow;
            contribution.ModifiedBy = currentUserId;

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution updated: {ContributionId}", contribution.ContributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }

        public async Task<ContributionInfo?> UpdateContributionStatusAsync(Guid contributionId, ContributionStatusUpdateRequest request)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUser = await GetAuthenticatedUserAsync();
            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for status update: {ContributionId}", contributionId);
                return null;
            }

            var targetStatus = _statusService.NormalizeStatus(request.Status);

            if (_statusService.IsStatusSubmitted(targetStatus))
            {
                await _authorizationService.ValidateStudentCanSubmitContributionAsync(contribution, currentUser);
            }
            else
            {
                await _authorizationService.ValidateCoordinatorCanReviewContributionAsync(contribution, currentUser, targetStatus);
            }

            _statusService.UpdateContributionStatus(contribution, targetStatus, currentUser.UserId);

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution status updated: {ContributionId} -> {Status}", contributionId, targetStatus);

            return _mapper.Map<ContributionInfo>(contribution);
        }
    }
}
