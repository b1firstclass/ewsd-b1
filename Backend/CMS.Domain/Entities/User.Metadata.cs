using System.ComponentModel.DataAnnotations;
using CMS.Domain.Attributes;

namespace CMS.Domain.Entities;

[MetadataType(typeof(UserMetadata))]
public partial class User
{
    private sealed class UserMetadata
    {
        [Searchable]
        public string LoginId { get; set; } = null!;

        [Searchable]
        public string Email { get; set; } = null!;

        [Searchable]
        public string FullName { get; set; } = null!;
    }
}
