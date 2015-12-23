namespace Reddah.Web.Core.Mvc.ActionFilters
{
    using System;
    using System.Web.Mvc;

    public static class FilterExtensions
    {
        public static void PreventChildActions(this ControllerContext filterContext)
        {
            if (filterContext != null && filterContext.IsChildAction)
            {
                const string message = "Child actions are not allowed to use this attribute.";
                throw new InvalidOperationException(message);
            }
        }
    }
}
