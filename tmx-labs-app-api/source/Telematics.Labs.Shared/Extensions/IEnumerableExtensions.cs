using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Progressive.Telematics.Labs.Shared
{
    public static class IEnumerableExtensions
    {
        public static IEnumerable<T> Yield<T>(this T item)
        {
            yield return item;
        }

        public static void ForEach<T>(this T[] items, Action<T> action)
        {
            items.AsEnumerable().ForEach(action);
        }

        public static void ForEach<T>(this IEnumerable<T> items, Action<T> action)
        {
            foreach (var item in items)
                action(item);
        }

        public static void ForEach(this IEnumerable items, Action<object> action)
        {
            foreach (var item in items)
                action(item);
        }

        public static IEnumerable<TSource> Except<TSource>(this IEnumerable<TSource> first, IEnumerable<TSource> second, Func<TSource, TSource, bool> comparer)
        {
            return first.Where(x => second.Count(y => comparer(x, y)) == 0);
        }

        public static IEnumerable<TSource> Intersect<TSource>(this IEnumerable<TSource> first, IEnumerable<TSource> second, Func<TSource, TSource, bool> comparer)
        {
            return first.Where(x => second.Count(y => comparer(x, y)) == 1);
        }

        public static List<T> AddRangeSafe<T>(this List<T> list, IEnumerable<T> newItems)
        {
            if (newItems != null)
                list.AddRange(newItems);
            return list;
        }
    }
}

