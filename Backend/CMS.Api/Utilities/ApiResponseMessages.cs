namespace CMS.Api.Utilities
{
    public static class ApiResponseMessages
    {
        public const string ValidationFailed = "Validation failed";
        public const string Unauthorized = "Unauthorized";

        public static string Retrieved(string resource) => $"{resource} retrieved successfully";
        public static string Created(string resource) => $"{resource} created successfully";
        public static string Updated(string resource) => $"{resource} updated successfully";
        public static string Deleted(string resource) => $"{resource} deleted successfully";
        public static string Saved(string resource) => $"{resource} saved successfully";

        public static string NotFound(string resource) => $"{resource} not found";
        public static string IdRequired(string resource) => $"{resource} id is required";

        public static string ErrorRetrieving(string resource) => $"An error occurred while retrieving {resource}";
        public static string ErrorCreating(string resource) => $"An error occurred while creating {resource}";
        public static string ErrorUpdating(string resource) => $"An error occurred while updating {resource}";
        public static string ErrorDeleting(string resource) => $"An error occurred while deleting {resource}";
        public static string ErrorSaving(string resource) => $"An error occurred while saving {resource}";
    }
}
