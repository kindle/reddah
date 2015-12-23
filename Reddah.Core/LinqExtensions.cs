namespace Reddah.Core
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    public static class LinqExtensions
    {
        public static void ForEach<T>(this IEnumerable<T> collection, Action<T> mapFunction)
        {
            foreach (var item in collection)
            {
                mapFunction(item);
            }
        }

        public static string JoinStrings(this IEnumerable<string> strings, string separator)
        {
            return String.Join(separator, strings.ToArray());
        }

        public static IEnumerable<T> Page<T>(this IEnumerable<T> source, int page, int size)
        {
            return source.Skip((page - 1) * size).Take(size);
        }

        public static IEnumerable<T> Distinct<T>(this IEnumerable<T> source, Func<T, object> comparePropertySelector)
        {
            return source.Distinct(new LambdaEqualityComparer<T>(comparePropertySelector));
        }
    }

    internal class LambdaEqualityComparer<T> : EqualityComparer<T>
    {
        private readonly Func<T, object> compareSelector;

        public LambdaEqualityComparer(Func<T, object> compareSelector)
        {
            this.compareSelector = compareSelector;
        }

        public override bool Equals(T x, T y)
        {
            return compareSelector(x).Equals(compareSelector(y));
        }

        public override int GetHashCode(T obj)
        {
            return compareSelector(obj).GetHashCode();
        }
    }
}
