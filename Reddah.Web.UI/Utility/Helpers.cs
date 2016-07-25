namespace Reddah.Web.UI.Utility
{
    using System;
    using System.Linq;
    using System.Globalization;
    using System.Text.RegularExpressions;

    public static class Helpers
    {
        public static string RemoveLocaleFromPath(string originalPath)
        {
            String path = String.Empty;

            if (!String.IsNullOrEmpty(originalPath))
            {
                path = originalPath.TrimStart('/');

                //Remove locale if found
                if (originalPath.Length > 5)
                {
                    Regex rgx = new Regex("^[A-Z]{2}-[A-Z]{2}/", RegexOptions.IgnoreCase);
                    path = rgx.Replace(path, "");
                }
            }

            return path;
        }

        public static bool IsValidLocale(string localeToTest)
        {
            if (!String.IsNullOrEmpty(localeToTest))
            {
                // Get and enumerate all cultures 
                var cultures = CultureInfo.GetCultures(CultureTypes.AllCultures);
                return cultures.Any(elt => elt.ToString().Equals(localeToTest));
            }
            return false;
        }

        public static string GetFirstImageSrc(string content)
        {
            var matches = Regex.Match(content, "<img.+?src=[\"'](.+?)[\"'].*?>", RegexOptions.IgnoreCase);
            string matchString = string.IsNullOrWhiteSpace(matches.Groups[1].Value) ? 
                "" : matches.Groups[1].Value;

            return matchString;
        }

        public static string TimeAgo(DateTime dt)
        {
            TimeSpan span = DateTime.Now - dt;
            if (span.Days > 365)
            {
                int years = (span.Days / 365);
                if (span.Days % 365 != 0)
                    years += 1;
                return String.Format("about {0} {1} ago",
                years, years == 1 ? "year" : "years");
            }
            if (span.Days > 30)
            {
                int months = (span.Days / 30);
                if (span.Days % 31 != 0)
                    months += 1;
                return String.Format("about {0} {1} ago",
                months, months == 1 ? "month" : "months");
            }
            if (span.Days > 0)
                return String.Format("about {0} {1} ago",
                span.Days, span.Days == 1 ? "day" : "days");
            if (span.Hours > 0)
                return String.Format("about {0} {1} ago",
                span.Hours, span.Hours == 1 ? "hour" : "hours");
            if (span.Minutes > 0)
                return String.Format("about {0} {1} ago",
                span.Minutes, span.Minutes == 1 ? "minute" : "minutes");
            if (span.Seconds > 5)
                return String.Format("about {0} seconds ago", span.Seconds);
            if (span.Seconds <= 5)
                return "just now";
            return string.Empty;
        }

        public static string GetShortTitle(string title)
        {
            title = (title == null) ? "" : title.Trim().Replace(" ", "_");
            return title.Substring(0, Math.Min(50, title.Length - 1));
        }

        //public static string GetLocalizedPath(string originalPath)
        //{
        //    String path = RemoveLocaleFromPath(originalPath);

        //    var culture = new CultureInfo("en-US");

        //    return string.Join("/", culture.Name, path);
        //}

    }
}