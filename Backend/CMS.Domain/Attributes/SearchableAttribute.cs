namespace CMS.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
    public sealed class SearchableAttribute : Attribute
    {
    }
}
