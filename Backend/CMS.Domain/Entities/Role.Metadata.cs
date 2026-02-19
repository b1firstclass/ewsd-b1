using System.ComponentModel.DataAnnotations;
using CMS.Domain.Attributes;

namespace CMS.Domain.Entities;

[MetadataType(typeof(RoleMetadata))]
public partial class Role
{
    private sealed class RoleMetadata
    {
        [Searchable]
        public string Name { get; set; } = null!;

        [Searchable]
        public string? Description { get; set; }
    }
}
