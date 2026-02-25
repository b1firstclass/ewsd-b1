using CMS.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace CMS.Domain.Entities;

[MetadataType(typeof(PermissionMetadata))]
public partial class Permission
{
    private sealed class PermissionMetadata
    {
        [Searchable]
        public string Name { get; set; } = null!;

        [Searchable]
        public string Module { get; set; } = null!;

        [Searchable]
        public string? Description { get; set; }
    }
}
