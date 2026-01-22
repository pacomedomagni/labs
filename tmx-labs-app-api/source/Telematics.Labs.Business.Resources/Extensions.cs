using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Shared;

namespace Progressive.Telematics.Labs.Business.Resources
{
    public static class Extensions
    {
        public static PagedList<T> GetPage<T>(this IEnumerable<T> source, int currentPage, int itemsPerPage, Func<T, bool> filter = null, SortOrder sortOrder = SortOrder.Unspecified, string sortField = "")
        {
            var itemsToSkip = currentPage * itemsPerPage;
            var queryable = source.AsQueryable();

            var totalItems = queryable.Count();
            var pageData = queryable.Skip(itemsToSkip).Take(itemsPerPage != 0 ? itemsPerPage : totalItems).Where(x => filter != null ? filter(x) : true);
            switch (sortOrder)
            {
                case SortOrder.Asc:
                    pageData = pageData.OrderBy(sortField);
                    break;
                case SortOrder.Desc:
                    pageData = pageData.OrderByDescending(sortField);
                    break;
            }
            return new PagedList<T>(pageData, totalItems, currentPage, itemsPerPage);
        }

        public static IOrderedQueryable<T> OrderBy<T>(this IQueryable<T> source, string property)
        {
            return ApplyOrder<T>(source, property, "OrderBy");
        }

        public static IOrderedQueryable<T> OrderByDescending<T>(this IQueryable<T> source, string property)
        {
            return ApplyOrder<T>(source, property, "OrderByDescending");
        }

        public static IOrderedQueryable<T> ThenBy<T>(this IOrderedQueryable<T> source, string property)
        {
            return ApplyOrder<T>(source, property, "ThenBy");
        }

        public static IOrderedQueryable<T> ThenByDescending<T>(this IOrderedQueryable<T> source, string property)
        {
            return ApplyOrder<T>(source, property, "ThenByDescending");
        }

        private static IOrderedQueryable<T> ApplyOrder<T>
            (this IQueryable<T> queryable, string propertyName, string sortMethodName)
        {
            //build an expression tree that can be passed as lambda to IQueryable#OrderBy
            var type = typeof(T);
            var paramExpression = Expression.Parameter(type, "parameterExpression");

            var property = type.GetProperty(propertyName);
            var propertyExpression = Expression.Property(paramExpression, property);

            var lambdaType = typeof(Func<,>).MakeGenericType(type, property.PropertyType);
            var lambdaExpression = Expression.Lambda(lambdaType, propertyExpression, paramExpression);

            // dynamically generate a method with the correct type parameters
            var queryableType = typeof(Queryable);
            var orderByMethod = queryableType.GetMethods()
                .Single(m => m.Name == sortMethodName &&
                             m.IsGenericMethodDefinition
                             && m.GetGenericArguments().Length == 2
                             && m.GetParameters().Length == 2)
                .MakeGenericMethod(type, property.PropertyType);

            var result = orderByMethod.Invoke(null, new object[] { queryable, lambdaExpression });
            return (IOrderedQueryable<T>)result;
        }
    }
}

