using CMS.Domain.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using System.Reflection;

namespace CMS.Infrastructure.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> ApplySearch<T>(this IQueryable<T> query, string? keyword)
        {
            if (query == null)
            {
                throw new ArgumentNullException(nameof(query));
            }

            if (string.IsNullOrWhiteSpace(keyword))
            {
                return query;
            }

            var trimmedKeyword = keyword.Trim().ToLowerInvariant();

            var metadataType = typeof(T).GetCustomAttribute<MetadataTypeAttribute>();
            Dictionary<string, bool>? metadataSearchableProps = null;
            if (metadataType != null)
            {
                metadataSearchableProps = metadataType.MetadataClassType
                    .GetProperties()
                    .Where(p => p.PropertyType == typeof(string) && Attribute.IsDefined(p, typeof(SearchableAttribute)))
                    .ToDictionary(p => p.Name, _ => true, StringComparer.OrdinalIgnoreCase);
            }

            var searchableProperties = typeof(T)
                .GetProperties()
                .Where(p => p.PropertyType == typeof(string) &&
                            (Attribute.IsDefined(p, typeof(SearchableAttribute)) ||
                            (metadataSearchableProps != null && metadataSearchableProps.ContainsKey(p.Name))))
                .ToArray();

            if (searchableProperties.Length == 0)
            {
                return query;
            }

            var parameter = Expression.Parameter(typeof(T), "x");
            Expression? predicate = null;
            var toLowerMethod = typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes);
            var containsMethod = typeof(string).GetMethod(nameof(string.Contains), new[] { typeof(string) });
            var keywordConstant = Expression.Constant(trimmedKeyword);

            foreach (var property in searchableProperties)
            {
                var propertyAccess = Expression.Property(parameter, property);
                var notNull = Expression.NotEqual(propertyAccess, Expression.Constant(null, typeof(string)));
                var toLowerCall = Expression.Call(propertyAccess, toLowerMethod!);
                var containsCall = Expression.Call(toLowerCall, containsMethod!, keywordConstant);
                var propertyPredicate = Expression.AndAlso(notNull, containsCall);

                predicate = predicate == null ? propertyPredicate : Expression.OrElse(predicate, propertyPredicate);
            }

            if (predicate == null)
            {
                return query;
            }

            var lambda = Expression.Lambda<Func<T, bool>>(predicate, parameter);
            return query.Where(lambda);
        }
    }
}
