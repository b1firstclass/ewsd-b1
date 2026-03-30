using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ILogger<CategoryService> _logger;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public CategoryService(ILogger<CategoryService> logger, IMapper mapper,
            IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResponse<CategoryInfo>> GetAllCategoriesAsync(PaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedCategories = await _unitOfWork.CategoryRepository.GetPagedAsync(
                skip,
                take,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive);

            var mappedCategories = _mapper.Map<List<CategoryInfo>>(pagedCategories.Items);
            return new PagedResponse<CategoryInfo>(mappedCategories, pagedCategories.TotalCount);
        }

        public async Task<List<CategoryInfo>> GetAllActiveCategoriesAsync()
        {
            var categories = await _unitOfWork.CategoryRepository.GetAllActiveCategoriesAsync();
            return _mapper.Map<List<CategoryInfo>>(categories);
        }

        public async Task<CategoryInfo?> GetCategoryByIdAsync(Guid categoryId)
        {
            if (categoryId == Guid.Empty)
            {
                return null;
            }

            var category = await _unitOfWork.Repository<Category>().GetByIdAsync(categoryId);
            return category == null ? null : _mapper.Map<CategoryInfo>(category);
        }

        public async Task<CategoryInfo> CreateCategoryAsync(CategoryCreateRequest request)
        {
            await EnsureCategoryNameAvailableAsync(request.Name);

            var categoryEntity = _mapper.Map<Category>(request);
            categoryEntity.CreatedDate = DateTime.UtcNow;
            categoryEntity.CreatedBy = _currentUserService.UserId;

            await _unitOfWork.Repository<Category>().AddAsync(categoryEntity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Category created: {CategoryId} - {CategoryName}", categoryEntity.CategoryId, categoryEntity.Name);

            return _mapper.Map<CategoryInfo>(categoryEntity);
        }

        public async Task<CategoryInfo?> UpdateCategoryAsync(Guid categoryId, CategoryUpdateRequest request)
        {
            if (categoryId == Guid.Empty)
            {
                return null;
            }

            var category = await _unitOfWork.Repository<Category>().GetByIdAsync(categoryId);
            if (category == null)
            {
                _logger.LogWarning("Category not found for update: {CategoryId}", categoryId);
                return null;
            }

            await EnsureCategoryNameAvailableAsync(request.Name, categoryId);

            category.Name = request.Name;
            category.Description = request.Description;

            if (request.IsActive.HasValue)
            {
                category.IsActive = request.IsActive.Value;
            }

            category.ModifiedDate = DateTime.UtcNow;
            category.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.Repository<Category>().Update(category);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Category updated: {CategoryId}", category.CategoryId);

            return _mapper.Map<CategoryInfo>(category);
        }

        public async Task<bool> DeleteCategoryAsync(Guid categoryId)
        {
            if (categoryId == Guid.Empty)
            {
                return false;
            }

            var category = await _unitOfWork.Repository<Category>().GetByIdAsync(categoryId);
            if (category == null)
            {
                _logger.LogWarning("Category not found for deletion: {CategoryId}", categoryId);
                return false;
            }

            _unitOfWork.Repository<Category>().Remove(category);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Category deleted: {CategoryId}", category.CategoryId);
            return true;
        }

        private async Task EnsureCategoryNameAvailableAsync(string name, Guid? excludeCategoryId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return;
            }

            var categories = await _unitOfWork.Repository<Category>().GetAllAsync();
            var exists = categories.Any(c =>
                string.Equals(c.Name, name, StringComparison.OrdinalIgnoreCase) &&
                (!excludeCategoryId.HasValue || c.CategoryId != excludeCategoryId.Value));

            if (exists)
            {
                throw new InvalidOperationException($"Category with name '{name}' already exists");
            }
        }
    }
}
