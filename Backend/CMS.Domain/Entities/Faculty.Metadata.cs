using CMS.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace CMS.Domain.Entities;

[MetadataType(typeof(FacultyMetadata))]
public partial class Faculty
{
    private sealed class FacultyMetadata
    {
        [Searchable]
        public string FacultyName { get; set; } = null!;
    }
}
