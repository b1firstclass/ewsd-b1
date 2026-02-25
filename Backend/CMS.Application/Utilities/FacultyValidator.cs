namespace CMS.Application.Utilities
{
    public static class FacultyValidator
    {
        public static void EnsureFacultyNameAvailable(string facultyName, bool exists)
        {
            if (exists)
            {
                throw new InvalidOperationException($"Faculty with name '{facultyName}' already exists");
            }
        }
    }
}
