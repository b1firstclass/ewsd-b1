using System.ComponentModel.DataAnnotations;
using CMS.Domain.Attributes;

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
