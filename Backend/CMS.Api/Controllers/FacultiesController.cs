using System;
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
    //[Authorize]
    public class FacultiesController : ControllerBase
    {
        private readonly ILogger<FacultiesController> _logger;
        private readonly IFacultiesService _facultyService;

        public FacultiesController(ILogger<FacultiesController> logger, IFacultiesService facultyService)
        {
            _logger = logger;
            _facultyService = facultyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFaculties([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var faculties = await _facultyService.GetAllFacultiesAsync(paginationRequest);

                return faculties.ToApiResponse("Faculties retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculties");
                return this.ToErrorResponse("An error occurred while retrieving faculties", 500);
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetFacultyById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("Faculty id is required", 400);
                }

                var faculty = await _facultyService.GetFacultyByIdAsync(id);
                if (faculty == null)
                {
                    return this.ToErrorResponse("Faculty not found", 404);
                }

                return faculty.ToApiResponse("Faculty retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty {FacultyId}", id);
                return this.ToErrorResponse("An error occurred while retrieving the faculty", 500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateFaculty(FacultyCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var createdFaculty = await _facultyService.CreateFacultyAsync(request);
                return createdFaculty.ToApiResponse("Faculty created successfully", 201);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating faculty");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating faculty");
                return this.ToErrorResponse("An error occurred while creating the faculty", 500);
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateFaculty(Guid id, FacultyUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("Faculty id is required", 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var updatedFaculty = await _facultyService.UpdateFacultyAsync(id, request);
                if (updatedFaculty == null)
                {
                    return this.ToErrorResponse("Faculty not found", 404);
                }

                return updatedFaculty.ToApiResponse("Faculty updated successfully");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating faculty {FacultyId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating faculty {FacultyId}", id);
                return this.ToErrorResponse("An error occurred while updating the faculty", 500);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteFaculty(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("Faculty id is required", 400);
                }

                var deleted = await _facultyService.DeleteFacultyAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse("Faculty not found", 404);
                }

                return this.ToSuccessResponse("Faculty deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting faculty {FacultyId}", id);
                return this.ToErrorResponse("An error occurred while deleting the faculty", 500);
            }
        }
    }
}
