using CMS.Application.DTOs;

namespace CMS.Application.Utilities
{
    public static class ContributionFileValidator
    {
        public static void ValidateFile(ContributionFileRequest file, HashSet<string> allowedExtensions, long maxSizeBytes, string label)
        {
            if (file.Data.Length <= 0 || file.Size <= 0)
            {
                throw new ArgumentException($"{label} file is empty");
            }

            if (file.Size > maxSizeBytes)
            {
                var maxSizeMb = maxSizeBytes / (1024 * 1024);
                throw new ArgumentException($"{label} file exceeds the maximum size of {maxSizeMb} MB");
            }

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(extension) || !allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"{label} file extension is not allowed");
            }
        }
    }
}
