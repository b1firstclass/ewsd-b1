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
        public async Task<ContributionInfo?> SubmitContributionAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUser = await GetAuthenticatedUserAsync();
            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for submit: {ContributionId}", contributionId);
                return null;
            }

            await _authorizationService.ValidateStudentCanSubmitContributionAsync(contribution, currentUser);

            _statusService.UpdateContributionStatus(contribution, ContributionConstants.StatusSubmitted, currentUser.UserId);

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            var facultyCoordintors = await _unitOfWork.UsersRepository.GetUsersByFacultyIdAsync(new List<Guid> { contribution.FacultyId }, RoleNames.Coordinator);
            foreach (var coordinator in facultyCoordintors)
            {
                var body = _emailService.GenerateEmailBody(
                    "Contribution Submitted",
                    coordinator.FullName,
                    "A contribution has been submitted and is ready for review in your faculty.");

                await _emailService.SendEmailAsync(coordinator.Email, "Contribution Submitted", body);
            }

            _logger.LogInformation("Contribution submitted: {ContributionId}", contributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }
        public async Task<ContributionInfo?> ReviewedContributionAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for submit: {ContributionId}", contributionId);
                return null;
            }

            if (!_statusService.IsStatusSubmitted(contribution.Status))
            {
                throw new InvalidOperationException("Only submitted contributions can be reviewed.");
            }

            _statusService.UpdateContributionStatus(contribution, ContributionConstants.StatusUnderReview, _currentUserService.UserId);

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution submitted: {ContributionId}", contributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }
        public async Task<ContributionInfo?> ApprovedContributionAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for submit: {ContributionId}", contributionId);
                return null;
            }

            if (!_statusService.IsStatusUnderReview(contribution.Status))
            {
                throw new InvalidOperationException("Only submitted contributions can be approved.");
            }

            _statusService.UpdateContributionStatus(contribution, ContributionConstants.StatusApproved, _currentUserService.UserId);

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution approved: {ContributionId}", contributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }
        public async Task<ContributionInfo?> SelectedContributionAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for selection: {ContributionId}", contributionId);
                return null;
            }

            if (!string.Equals(contribution.Status, ContributionConstants.StatusApproved, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only approved contributions can be selected.");
            }

            _statusService.UpdateContributionStatus(contribution, ContributionConstants.StatusSelected, _currentUserService.UserId);

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution selected: {ContributionId}", contributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }
        public async Task<IReadOnlyList<ContributionInfo>> SelectedContributionsAsync(IReadOnlyCollection<Guid> contributionIds)
        {
            if (contributionIds == null || contributionIds.Count == 0)
            {
                throw new ArgumentException("At least one contribution id is required.");
            }

            var distinctIds = contributionIds
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            if (distinctIds.Count == 0)
            {
                throw new ArgumentException("At least one valid contribution id is required.");
            }

            var selectedContributions = new List<Contribution>(distinctIds.Count);

            foreach (var contributionId in distinctIds)
            {
                var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
                if (contribution == null)
                {
                    throw new KeyNotFoundException($"Contribution '{contributionId}' not found.");
                }

                if (!string.Equals(contribution.Status, ContributionConstants.StatusApproved, StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException($"Contribution '{contributionId}' is not approved and cannot be selected.");
                }

                _statusService.UpdateContributionStatus(contribution, ContributionConstants.StatusSelected, _currentUserService.UserId);
                _unitOfWork.ContributionsRepository.Update(contribution);
                selectedContributions.Add(contribution);
            }

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Bulk contribution selection completed for {Count} contribution(s)", selectedContributions.Count);

            return _mapper.Map<List<ContributionInfo>>(selectedContributions);
        }
        public async Task<ContributionInfo?> RejectedContributionAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for submit: {ContributionId}", contributionId);
                return null;
            }

            if (!_statusService.IsStatusUnderReview(contribution.Status))
            {
                throw new InvalidOperationException("Only submitted contributions can be rejected.");
            }

            _statusService.UpdateContributionStatus(contribution, ContributionConstants.StatusRejected, _currentUserService.UserId);

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution rejected: {ContributionId}", contributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }
        public async Task<ContributionInfo?> RequestRevisionContributionAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for request revision: {ContributionId}", contributionId);
                return null;
            }

            if (!_statusService.IsStatusUnderReview(contribution.Status))
            {
                throw new InvalidOperationException("Only submitted contributions can be requested to revision.");
            }

            _statusService.UpdateContributionStatus(contribution, ContributionConstants.StatusRevisionRequired, _currentUserService.UserId);

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution requested to revision: {ContributionId}", contributionId);

            return _mapper.Map<ContributionInfo>(contribution);
        }
        public async Task<ContributionInfo?> UpdateContributionAsync(Guid contributionId, ContributionUpdateRequest request)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUser = await GetAuthenticatedUserAsync();
            var currentUserId = currentUser.UserId;

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

            if (!_statusService.IsStatusDraft(contribution.Status) &&
                !_statusService.IsRevisionRequired(contribution.Status))
            {
                throw new InvalidOperationException("Only draft or revision required contributions can be updated.");
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
        public async Task<PagedResponse<ContributionInfo>> GetMyContributionsAsync(PaginationRequest paginationRequest, string? status = null)
        {
            var currentUser = await GetAuthenticatedUserAsync();
            var currentWindow = await _unitOfWork.ContributionWindowsRepository.GetCurrentWindowAsync(DateTime.UtcNow);

            if (currentWindow == null)
            {
                return new PagedResponse<ContributionInfo>(Array.Empty<ContributionInfo>(), 0);
            }

            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;
            var normalizedStatus = string.IsNullOrWhiteSpace(status)
                ? null
                : _statusService.NormalizeStatus(status);

            PagedResult<Contribution> pagedContributions;

            if (string.Equals(currentUser.Role.Name, RoleNames.Coordinator, StringComparison.OrdinalIgnoreCase))
            {
                var facultyIds = currentUser.Faculties
                    .Select(faculty => faculty.FacultyId)
                    .Distinct()
                    .ToList();

                pagedContributions = await _unitOfWork.ContributionsRepository.GetPagedByFacultiesAsync(
                    currentUser.UserId,
                    facultyIds,
                    skip,
                    take,
                    currentWindow.ContributionWindowId,
                    normalizedStatus,
                    paginationRequest.SearchKeyword,
                    paginationRequest.IsActive);
            }
            else
            {
                pagedContributions = await _unitOfWork.ContributionsRepository.GetPagedByUserAsync(
                    currentUser.UserId,
                    skip,
                    take,
                    currentWindow.ContributionWindowId,
                    normalizedStatus,
                    paginationRequest.SearchKeyword,
                    paginationRequest.IsActive);
            }

            var mappedContributions = _mapper.Map<List<ContributionInfo>>(pagedContributions.Items);

            return new PagedResponse<ContributionInfo>(mappedContributions, pagedContributions.TotalCount);
        }
        public async Task<PagedResponse<ContributionInfo>> GetSelectedContributionsForFacultyViewerAsync(PaginationRequest paginationRequest, Guid? contributionWindowId = null)
        {
            var currentUser = await GetAuthenticatedUserAsync();

            if (!string.Equals(currentUser.Role.Name, RoleNames.Manager, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(currentUser.Role.Name, RoleNames.Guest, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            var facultyIds = currentUser.Faculties
                .Select(faculty => faculty.FacultyId)
                .Distinct()
                .ToList();

            var pagedContributions = await _unitOfWork.ContributionsRepository.GetPagedSelectedByFacultiesAsync(
                facultyIds,
                paginationRequest.GetSkipCount(),
                paginationRequest.PageSize,
                contributionWindowId,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive);

            var mappedContributions = _mapper.Map<List<ContributionInfo>>(pagedContributions.Items);

            return new PagedResponse<ContributionInfo>(mappedContributions, pagedContributions.TotalCount);
        }
        public async Task<ContributionDetailInfo?> GetContributionByIdAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            _ = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdWithDetailsAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found: {ContributionId}", contributionId);
                return null;
            }

            return new ContributionDetailInfo
            {
                Id = contribution.ContributionId,
                ContributionWindowId = contribution.ContributionWindowId,
                Subject = contribution.Subject,
                Description = contribution.Description,
                Status = contribution.Status,
                CreatedDate = DateTimeHelper.NormalizeToUtc(contribution.CreatedDate),
                ModifiedDate = DateTimeHelper.NormalizeToUtc(contribution.ModifiedDate),
                Documents = _mapper.Map<List<ContributionDocumentInfo>>(contribution.Documents
                    .Where(document => document.IsActive)
                    .OrderByDescending(document => document.CreatedDate)),
                Comments = _mapper.Map<List<CommentInfo>>(contribution.Comments
                    .Where(comment => comment.IsActive)
                    .OrderByDescending(comment => comment.CreatedDate))
            };
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
            var faculty = await _unitOfWork.FacultiesRepository.GetActiveFacultyByIdAsync(facultyId);
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

        public async Task<ContributionFileDownload?> DownloadDocumentByIdAsync(Guid documentId)
        {
            if (documentId == Guid.Empty)
            {
                return null;
            }

            _ = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var document = await _unitOfWork.Repository<Document>().GetByIdAsync(documentId);
            if (document == null || !document.IsActive || document.Data == null || document.Data.Length == 0)
            {
                _logger.LogWarning("Document not found for download: {DocumentId}", documentId);
                return null;
            }

            return new ContributionFileDownload
            {
                Data = document.Data,
                FileName = document.FileName,
                ContentType = GetDocumentContentType(document.Extension)
            };
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

        private static string GetDocumentContentType(string? extension)
        {
            return extension?.ToLowerInvariant() switch
            {
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "application/octet-stream"
            };
        }

        public async Task<ContributionFilesDownload?> DownloadSelectedContributionFilesForManagerAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUser = await GetAuthenticatedUserAsync();
            if (!string.Equals(currentUser.Role.Name, RoleNames.Manager, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdWithDocumentsAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Selected contribution not found for manager download: {ContributionId}", contributionId);
                return null;
            }

            var managerFacultyIds = currentUser.Faculties
                .Select(faculty => faculty.FacultyId)
                .ToHashSet();

            if (!managerFacultyIds.Contains(contribution.FacultyId))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (!string.Equals(contribution.Status, ContributionConstants.StatusSelected, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only selected contributions can be downloaded by manager.");
            }

            var download = _fileService.CreateZipArchiveForSingleContribution(contribution);
            if (download == null)
            {
                _logger.LogWarning("No active files found for selected contribution {ContributionId}", contributionId);
            }

            return download;
        }

        public async Task<ContributionFilesDownload?> DownloadSelectedContributionsFilesForManagerAsync(IReadOnlyCollection<Guid> contributionIds)
        {
            if (contributionIds == null || contributionIds.Count == 0)
            {
                throw new ArgumentException("At least one contribution id is required.");
            }

            var currentUser = await GetAuthenticatedUserAsync();
            if (!string.Equals(currentUser.Role.Name, RoleNames.Manager, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            var distinctIds = contributionIds
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            if (distinctIds.Count == 0)
            {
                throw new ArgumentException("At least one valid contribution id is required.");
            }

            var managerFacultyIds = currentUser.Faculties
                .Select(faculty => faculty.FacultyId)
                .ToHashSet();

            var contributions = new List<Contribution>(distinctIds.Count);
            foreach (var contributionId in distinctIds)
            {
                var contribution = await _unitOfWork.ContributionsRepository.GetByIdWithDocumentsAsync(contributionId);
                if (contribution == null)
                {
                    throw new KeyNotFoundException($"Contribution '{contributionId}' not found.");
                }

                if (!managerFacultyIds.Contains(contribution.FacultyId))
                {
                    throw new UnauthorizedAccessException("Forbidden");
                }

                if (!string.Equals(contribution.Status, ContributionConstants.StatusSelected, StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException($"Contribution '{contributionId}' is not selected and cannot be downloaded.");
                }

                contributions.Add(contribution);
            }

            var download = _fileService.CreateZipArchive(contributions);
            if (download == null)
            {
                _logger.LogWarning("No active files found for selected contributions download request");
            }

            return download;
        }

        public async Task<ContributionInfo?> UpdateContributionStatusAsync(Guid contributionId, string status)
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

            var targetStatus = _statusService.NormalizeStatus(status);

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
