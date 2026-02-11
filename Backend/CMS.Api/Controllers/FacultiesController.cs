using CMS.Api.Utilities;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
        public async Task<IActionResult> GetAllFaculties()
        {
            try
            {
                var faculties = await _facultyService.GetAllFacultiesAsync();
                return Ok(faculties);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculties");
                return this.ToErrorResponse("An error occurred while retrieving faculties", 500);
            }
        }
    }
}
