using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class ContributionWindowsService : IContributionWindowsService
    {
        private readonly ILogger<ContributionWindowsService> _logger;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public ContributionWindowsService(
            ILogger<ContributionWindowsService> logger,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResponse<ContributionWindowInfo>> GetAllContributionWindowsAsync(PaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedWindows = await _unitOfWork.ContributionWindowsRepository.GetPagedAsync(skip, take, paginationRequest.SearchKeyword);
            var mapped = _mapper.Map<List<ContributionWindowInfo>>(pagedWindows.Items);
            return new PagedResponse<ContributionWindowInfo>(mapped, pagedWindows.TotalCount);
        }

        public async Task<ContributionWindowInfo?> GetContributionWindowByIdAsync(Guid contributionWindowId)
        {
            var contributionWindow = await _unitOfWork.ContributionWindowsRepository.GetByIdAsync(contributionWindowId);
            return contributionWindow == null ? null : _mapper.Map<ContributionWindowInfo>(contributionWindow);
        }

        public async Task<ContributionWindowStatusResponse> GetCurrentWindowStatusAsync()
        {
            var utcNow = DateTime.UtcNow;
            var window = await _unitOfWork.ContributionWindowsRepository.GetCurrentWindowAsync(utcNow);

            if (window == null)
            {
                return new ContributionWindowStatusResponse
                {
                    CurrentTimeUtc = utcNow,
                    IsInContributionWindow = false,
                    IsSubmissionAllowed = false,
                    Window = null
                };
            }

            var submissionAllowed = utcNow >= window.SubmissionOpenDate && utcNow <= window.SubmissionEndDate;

            return new ContributionWindowStatusResponse
            {
                CurrentTimeUtc = utcNow,
                IsInContributionWindow = utcNow >= window.SubmissionOpenDate && utcNow <= window.ClosureDate,
                IsSubmissionAllowed = submissionAllowed,
                Window = _mapper.Map<ContributionWindowInfo>(window)
            };
        }

        public async Task<ContributionWindowInfo> CreateContributionWindowAsync(ContributionWindowCreateRequest request)
        {
            ValidateWindowDates(request.SubmissionOpenDate, request.SubmissionEndDate, request.ClosureDate);
            ValidateAcademicYears(request.AcademicYearStart, request.AcademicYearEnd);

            var contributionWindow = _mapper.Map<ContributionWindow>(request);
            contributionWindow.SubmissionOpenDate = contributionWindow.SubmissionOpenDate.ToUniversalTime();
            contributionWindow.SubmissionEndDate = contributionWindow.SubmissionEndDate.ToUniversalTime();
            contributionWindow.ClosureDate = contributionWindow.ClosureDate.ToUniversalTime();
            contributionWindow.CreatedDate = DateTime.UtcNow;
            contributionWindow.CreatedBy = _currentUserService.UserId;
            contributionWindow.IsActive = true;

            await _unitOfWork.ContributionWindowsRepository.AddAsync(contributionWindow);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution window created: {ContributionWindowId}", contributionWindow.ContributionWindowId);

            return _mapper.Map<ContributionWindowInfo>(contributionWindow);
        }

        public async Task<ContributionWindowInfo?> UpdateContributionWindowAsync(Guid contributionWindowId, ContributionWindowUpdateRequest request)
        {
            var contributionWindow = await _unitOfWork.ContributionWindowsRepository.GetByIdAsync(contributionWindowId);
            if (contributionWindow == null)
            {
                _logger.LogWarning("Contribution window not found for update: {ContributionWindowId}", contributionWindowId);
                return null;
            }

            var updatedOpenDate = request.SubmissionOpenDate ?? contributionWindow.SubmissionOpenDate;
            var updatedEndDate = request.SubmissionEndDate ?? contributionWindow.SubmissionEndDate;
            var updatedClosureDate = request.ClosureDate ?? contributionWindow.ClosureDate;

            ValidateWindowDates(updatedOpenDate, updatedEndDate, updatedClosureDate);

            var updatedAcademicYearStart = request.AcademicYearStart ?? contributionWindow.AcademicYearStart;
            var updatedAcademicYearEnd = request.AcademicYearEnd ?? contributionWindow.AcademicYearEnd;
            ValidateAcademicYears(updatedAcademicYearStart, updatedAcademicYearEnd);

            if (request.SubmissionOpenDate.HasValue)
            {
                contributionWindow.SubmissionOpenDate = request.SubmissionOpenDate.Value.ToUniversalTime();
            }

            if (request.SubmissionEndDate.HasValue)
            {
                contributionWindow.SubmissionEndDate = request.SubmissionEndDate.Value.ToUniversalTime();
            }

            if (request.ClosureDate.HasValue)
            {
                contributionWindow.ClosureDate = request.ClosureDate.Value.ToUniversalTime();
            }

            if (request.AcademicYearStart.HasValue)
            {
                contributionWindow.AcademicYearStart = request.AcademicYearStart.Value;
            }

            if (request.AcademicYearEnd.HasValue)
            {
                contributionWindow.AcademicYearEnd = request.AcademicYearEnd.Value;
            }

            contributionWindow.ModifiedDate = DateTime.UtcNow;
            contributionWindow.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.ContributionWindowsRepository.Update(contributionWindow);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution window updated: {ContributionWindowId}", contributionWindow.ContributionWindowId);

            return _mapper.Map<ContributionWindowInfo>(contributionWindow);
        }

        public async Task<bool> DeleteContributionWindowAsync(Guid contributionWindowId)
        {
            var contributionWindow = await _unitOfWork.ContributionWindowsRepository.GetByIdAsync(contributionWindowId);
            if (contributionWindow == null)
            {
                _logger.LogWarning("Contribution window not found for delete: {ContributionWindowId}", contributionWindowId);
                return false;
            }

            contributionWindow.IsActive = false;
            contributionWindow.ModifiedDate = DateTime.UtcNow;
            contributionWindow.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.ContributionWindowsRepository.Update(contributionWindow);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution window soft deleted: {ContributionWindowId}", contributionWindow.ContributionWindowId);

            return true;
        }

        private static void ValidateWindowDates(DateTime? submissionOpenDate, DateTime? submissionEndDate, DateTime? closureDate)
        {
            if (submissionOpenDate.HasValue && submissionEndDate.HasValue && submissionOpenDate.Value > submissionEndDate.Value)
            {
                throw new InvalidOperationException("Submission end date must be after the submission open date.");
            }

            if (submissionEndDate.HasValue && closureDate.HasValue && submissionEndDate.Value > closureDate.Value)
            {
                throw new InvalidOperationException("Closure date must be after the submission end date.");
            }
        }

        private static void ValidateAcademicYears(int academicYearStart, int academicYearEnd)
        {
            if (academicYearEnd < academicYearStart)
            {
                throw new InvalidOperationException("AcademicYearEnd cannot be earlier than AcademicYearStart.");
            }
        }
    }
}
