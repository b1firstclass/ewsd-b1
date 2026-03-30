using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface ICategoryService
    {
        Task<PagedResponse<CategoryInfo>> GetAllCategoriesAsync(PaginationRequest paginationRequest);
        Task<List<CategoryInfo>> GetAllActiveCategoriesAsync();
        Task<CategoryInfo?> GetCategoryByIdAsync(Guid categoryId);
        Task<CategoryInfo> CreateCategoryAsync(CategoryCreateRequest request);
        Task<CategoryInfo?> UpdateCategoryAsync(Guid categoryId, CategoryUpdateRequest request);
        Task<bool> DeleteCategoryAsync(Guid categoryId);
    }
}
