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
    public class FacultiesController : ControllerBase
    {
        private readonly ILogger<FacultiesController> _logger;
        private readonly IFacultiesService _facultyService;

        public FacultiesController(ILogger<FacultiesController> logger, IFacultiesService facultyService)
        {
            _logger = logger;
            _facultyService = facultyService;
        }


        [HasPermission(PermissionNames.FacultyRead)]
        [HttpGet]
        public async Task<IActionResult> GetAllFaculties([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var faculties = await _facultyService.GetAllFacultiesAsync(paginationRequest);

                return faculties.ToApiResponse(ApiResponseMessages.Retrieved("Faculties"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculties");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("faculties"), 500);
            }
        }

        [HasPermission(PermissionNames.FacultyRead)]
        [HttpGet("ActiveFaculties")]
        public async Task<IActionResult> GetAllActiveFaculties()
        {
            try
            {
                var faculties = await _facultyService.GetAllActiveFacultiesAsync();

                return faculties.ToApiResponse(ApiResponseMessages.Retrieved("Faculties"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculties");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("faculties"), 500);
            }
        }

        [HasPermission(PermissionNames.FacultyRead)]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetFacultyById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Faculty"), 400);
                }

                var faculty = await _facultyService.GetFacultyByIdAsync(id);
                if (faculty == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Faculty"), 404);
                }

                return faculty.ToApiResponse(ApiResponseMessages.Retrieved("Faculty"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty {FacultyId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("faculty"), 500);
            }
        }

        [HasPermission(PermissionNames.FacultyCreate)]
        [HttpPost]
        public async Task<IActionResult> CreateFaculty(FacultyCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var createdFaculty = await _facultyService.CreateFacultyAsync(request);
                return createdFaculty.ToApiResponse(ApiResponseMessages.Created("Faculty"), 201);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Faculty validation failed while creating faculty");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating faculty");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating faculty");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("faculty"), 500);
            }
        }

        [HasPermission(PermissionNames.FacultyUpdate)]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateFaculty(Guid id, FacultyUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Faculty"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updatedFaculty = await _facultyService.UpdateFacultyAsync(id, request);
                if (updatedFaculty == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Faculty"), 404);
                }

                return updatedFaculty.ToApiResponse(ApiResponseMessages.Updated("Faculty"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Faculty validation failed while updating faculty {FacultyId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating faculty {FacultyId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating faculty {FacultyId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("faculty"), 500);
            }
        }

        [HasPermission(PermissionNames.FacultyDelete)]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteFaculty(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Faculty"), 400);
                }

                var deleted = await _facultyService.DeleteFacultyAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Faculty"), 404);
                }

                return this.ToSuccessResponse(ApiResponseMessages.Deleted("Faculty"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting faculty {FacultyId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorDeleting("faculty"), 500);
            }
        }
    }
}
