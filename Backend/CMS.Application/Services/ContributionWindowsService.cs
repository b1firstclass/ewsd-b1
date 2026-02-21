using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Application.Utilities;
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

            var pagedWindows = await _unitOfWork.ContributionWindowsRepository.GetPagedAsync(
                skip,
                take,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive);
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
            var submissionOpenDate = DateTimeHelper.NormalizeToUtc(request.SubmissionOpenDate);
            var submissionEndDate = DateTimeHelper.NormalizeToUtc(request.SubmissionEndDate);
            var closureDate = DateTimeHelper.NormalizeToUtc(request.ClosureDate);

            ContributionWindowValidator.ValidateWindowDates(submissionOpenDate, submissionEndDate, closureDate);
            ContributionWindowValidator.ValidateAcademicYears(request.AcademicYearStart, request.AcademicYearEnd);

            var contributionWindow = _mapper.Map<ContributionWindow>(request);
            contributionWindow.SubmissionOpenDate = submissionOpenDate;
            contributionWindow.SubmissionEndDate = submissionEndDate;
            contributionWindow.ClosureDate = closureDate;
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

            var updatedOpenDate = request.SubmissionOpenDate.HasValue
                ? DateTimeHelper.NormalizeToUtc(request.SubmissionOpenDate.Value)
                : contributionWindow.SubmissionOpenDate;
            var updatedEndDate = request.SubmissionEndDate.HasValue
                ? DateTimeHelper.NormalizeToUtc(request.SubmissionEndDate.Value)
                : contributionWindow.SubmissionEndDate;
            var updatedClosureDate = request.ClosureDate.HasValue
                ? DateTimeHelper.NormalizeToUtc(request.ClosureDate.Value)
                : contributionWindow.ClosureDate;

            ContributionWindowValidator.ValidateWindowDates(updatedOpenDate, updatedEndDate, updatedClosureDate);

            var updatedAcademicYearStart = request.AcademicYearStart ?? contributionWindow.AcademicYearStart;
            var updatedAcademicYearEnd = request.AcademicYearEnd ?? contributionWindow.AcademicYearEnd;
            ContributionWindowValidator.ValidateAcademicYears(updatedAcademicYearStart, updatedAcademicYearEnd);

            if (request.SubmissionOpenDate.HasValue)
            {
                contributionWindow.SubmissionOpenDate = updatedOpenDate;
            }

            if (request.SubmissionEndDate.HasValue)
            {
                contributionWindow.SubmissionEndDate = updatedEndDate;
            }

            if (request.ClosureDate.HasValue)
            {
                contributionWindow.ClosureDate = updatedClosureDate;
            }

            if (request.AcademicYearStart.HasValue)
            {
                contributionWindow.AcademicYearStart = request.AcademicYearStart.Value;
            }

            if (request.AcademicYearEnd.HasValue)
            {
                contributionWindow.AcademicYearEnd = request.AcademicYearEnd.Value;
            }

            if (request.IsActive.HasValue)
            {
                contributionWindow.IsActive = request.IsActive.Value;
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

            _unitOfWork.Repository<ContributionWindow>().Remove(contributionWindow);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution window deleted: {ContributionWindowId}", contributionWindow.ContributionWindowId);

            return true;
        }

        
    }
}
