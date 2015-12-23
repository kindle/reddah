namespace Reddah.Core
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;

    public static class ExceptionExtensions
    {
        public static IEnumerable<Exception> InnerExceptions(this Exception exception)
        {
            var next = exception.InnerException;
            while (next != null)
            {
                yield return next;
                next = next.InnerException;
            }

            yield break;
        }

        public static bool IsFatal(this Exception exception)
        {
            return exception.IsItselfFatal() || exception.InnerExceptions().Any(IsItselfFatal);
        }

        private static bool IsItselfFatal(this Exception exception)
        {
            return (exception is ThreadAbortException ||
                    exception is AccessViolationException ||
                    (exception is OutOfMemoryException) && !(exception is InsufficientMemoryException));
        }

        //public static void AddExceptionMetadata(this Exception exception, System.Diagnostics.BaseEvent evt)
        //{
        //    foreach (var key in exception.Data.Keys)
        //    {
        //        evt.Metadata[key.ToString()] = exception.Data[key].ToString();
        //    }

        //    if (exception.InnerException != null)
        //    {
        //        exception.InnerException.AddExceptionMetadata(evt);
        //    }
        //}
    }
}
