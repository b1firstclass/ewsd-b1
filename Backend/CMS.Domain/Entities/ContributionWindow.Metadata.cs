using System.ComponentModel.DataAnnotations;
using CMS.Domain.Attributes;

namespace CMS.Domain.Entities;

[MetadataType(typeof(ContributionWindowMetadata))]
public partial class ContributionWindow
{
    private sealed class ContributionWindowMetadata
    {
        [Searchable]
        public string? CreatedBy { get; set; }

        [Searchable]
        public string? ModifiedBy { get; set; }
    }
}
