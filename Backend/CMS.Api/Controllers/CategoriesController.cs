using CMS.Api.Security;
using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ILogger<CategoriesController> _logger;
        private readonly ICategoryService _categoryService;

        public CategoriesController(ILogger<CategoriesController> logger, ICategoryService categoryService)
        {
            _logger = logger;
            _categoryService = categoryService;
        }

        [HasPermission(PermissionNames.CategoryRead)]
        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var categories = await _categoryService.GetAllCategoriesAsync(paginationRequest);

                return categories.ToApiResponse(ApiResponseMessages.Retrieved("Categories"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("categories"), 500);
            }
        }

        [HasPermission(PermissionNames.CategoryRead)]
        [HttpGet("ActiveCategories")]
        public async Task<IActionResult> GetAllActiveCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllActiveCategoriesAsync();

                return categories.ToApiResponse(ApiResponseMessages.Retrieved("Categories"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("categories"), 500);
            }
        }

        [HasPermission(PermissionNames.CategoryRead)]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCategoryById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Category"), 400);
                }

                var category = await _categoryService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Category"), 404);
                }

                return category.ToApiResponse(ApiResponseMessages.Retrieved("Category"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category {CategoryId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("category"), 500);
            }
        }

        [HasPermission(PermissionNames.CategoryCreate)]
        [HttpPost]
        public async Task<IActionResult> CreateCategory(CategoryCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var createdCategory = await _categoryService.CreateCategoryAsync(request);
                return createdCategory.ToApiResponse(ApiResponseMessages.Created("Category"), 201);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Category validation failed while creating category");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating category");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("category"), 500);
            }
        }

        [HasPermission(PermissionNames.CategoryUpdate)]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateCategory(Guid id, CategoryUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Category"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updatedCategory = await _categoryService.UpdateCategoryAsync(id, request);
                if (updatedCategory == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Category"), 404);
                }

                return updatedCategory.ToApiResponse(ApiResponseMessages.Updated("Category"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Category validation failed while updating category {CategoryId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating category {CategoryId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {CategoryId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("category"), 500);
            }
        }

        [HasPermission(PermissionNames.CategoryDelete)]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Category"), 400);
                }

                var deleted = await _categoryService.DeleteCategoryAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Category"), 404);
                }

                return this.ToSuccessResponse(ApiResponseMessages.Deleted("Category"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {CategoryId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorDeleting("category"), 500);
            }
        }
    }
}
