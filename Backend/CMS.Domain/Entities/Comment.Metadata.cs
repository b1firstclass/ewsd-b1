using CMS.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace CMS.Domain.Entities;

[MetadataType(typeof(CommentMetadata))]
public partial class Comment
{
    private sealed class CommentMetadata
    {
        [Searchable]
        public string Comment1 { get; set; } = null!;
    }
}
