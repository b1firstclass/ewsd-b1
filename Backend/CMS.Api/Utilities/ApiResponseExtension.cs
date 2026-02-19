using CMS.Application.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CMS.Api.Utilities
{
    public static class ApiResponseExtension
    {
        public static IActionResult ToApiResponse<T>(this T data, string? message = null, int statusCode = 200)
        {
            var response = ApiResponse<T>.SuccessResponse(data, message);
            return new ObjectResult(response) { StatusCode = statusCode };
        }

        public static IActionResult ToSuccessResponse(this ControllerBase controller, string? message = null, int statusCode = 200)
        {
            var response = ApiResponse.SuccessResult(message);
            return new ObjectResult(response) { StatusCode = statusCode };
        }

        public static IActionResult ToErrorResponse(this ControllerBase controller, string message, int statusCode = 400)
        {
            var response = ApiResponse.ErrorResponse(message);
            return new ObjectResult(response) { StatusCode = statusCode };
        }

        public static IActionResult ToErrorResponse(this ControllerBase controller, string message, int statusCode, ModelStateDictionary modelState)
        {
            var errors = new Dictionary<string, string[]>();
            foreach (var key in modelState.Keys)
            {
                var state = modelState[key];
                if (state != null && state.Errors.Count > 0)
                {
                    errors[key] = state.Errors.Select(e => e.ErrorMessage).ToArray();
                }
            }

            var response = ApiResponse.ErrorResponse(message, errors);
            return new ObjectResult(response) { StatusCode = statusCode };
        }
    }
}
