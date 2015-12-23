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

        //public static string GetLocalizedPath(string originalPath)
        //{
        //    String path = RemoveLocaleFromPath(originalPath);

        //    var culture = new CultureInfo("en-US");

        //    return string.Join("/", culture.Name, path);
        //}

    }
}