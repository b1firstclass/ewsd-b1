using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace CMS.Application.Common
{
    public class ApiResponse<T>
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Message { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public T? Data { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Dictionary<string, string[]>? Errors { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> SuccessResponse(T data, string? message = null)
        {
            return new ApiResponse<T>
            {
                Message = message,
                Data = data,
                Timestamp = DateTime.UtcNow
            };
        }

        public static ApiResponse<T> ErrorResponse(string message, Dictionary<string, string[]>? errors = null)
        {
            return new ApiResponse<T>
            {
                Message = message,
                Errors = errors,
                Timestamp = DateTime.UtcNow
            };
        }
    }

    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse SuccessResult(string? message = null)
        {
            return new ApiResponse
            {
                Message = message,
                Timestamp = DateTime.UtcNow
            };
        }

        public static new ApiResponse ErrorResponse(string message, Dictionary<string, string[]>? errors = null)
        {
            return new ApiResponse
            {
                Message = message,
                Errors = errors,
                Timestamp = DateTime.UtcNow
            };
        }
    }

}
