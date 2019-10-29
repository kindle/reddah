namespace Reddah.Web.UI.Utility
{
    using System;
    using System.Linq;
    using System.Globalization;
    using System.Text.RegularExpressions;
    using System.Web.Helpers;
    using System.Collections.Generic;
    using System.Runtime.InteropServices;

    public enum PrivilegeList
    {
        EditPost=1,
        DeletePost=2,
        DeleteComment=3
    }

    public static class Helpers
    {
        public static bool Acl(string userName, PrivilegeList privilegeList)
        {
            using (var db = new reddahEntities1())
            {
                var query = (from user in db.Set<UserProfile>()
                             join userInRole in db.Set<webpages_UsersInRoles>() on user.UserId equals userInRole.UserId
                             join privilegeInRole in db.Set<webpages_PrivilegesInRoles>() on userInRole.RoleId equals privilegeInRole.RoleId
                             join priviege in db.Set<webpages_Privileges>() on privilegeInRole.PrivilegeId equals priviege.PrivilegeId
                             join role in db.Set<webpages_Roles>() on userInRole.RoleId equals role.RoleId
                             where user.UserName == userName && priviege.PrivilegeId == (int)privilegeList
                             select new
                             {
                                 user.UserId,
                                 PrivilegeName = priviege.PrivilegeId
                             }).Take(1);

                if (query.Count() > 0)
                    return true;


            }

            return false;
        }
        public static string Display(bool flag)
        {
            return flag ? "flex" : "";
        }
        public static string GetColor(int n)
        {
            return n == 0 ? "black" : "darkgreen";
        }

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

        public static string GetRelativeUrl(string url)
        {
            return url.StartsWith("/uploadPhoto", StringComparison.InvariantCultureIgnoreCase)?url.Replace("/uploadPhoto", 
                "///reddah.com/uploadPhoto") : url;
        }

        public static string GetVideoSrc(string content)
        {
            var matches = Regex.Match(System.Web.HttpUtility.HtmlDecode(content), "<video.+?src=[\"'](.+?)[\"'].*?>", RegexOptions.IgnoreCase);
            string matchString = string.IsNullOrWhiteSpace(matches.Groups[1].Value) ?
                "" : matches.Groups[1].Value;

            return GetRelativeUrl(matchString);
        }

        public static string GetVideoPoster(string content)
        {
            var matches = Regex.Match(System.Web.HttpUtility.HtmlDecode(content), "<video.+?poster=[\"'](.+?)[\"'].*?>", RegexOptions.IgnoreCase);
            string matchString = string.IsNullOrWhiteSpace(matches.Groups[1].Value) ?
                "" : matches.Groups[1].Value;

            return GetRelativeUrl(matchString);
        }

        public static string GetFirstImageSrc(string content)
        {
            var matches = Regex.Match(System.Web.HttpUtility.HtmlDecode(content), "<img.+?src=[\"'](.+?)[\"'].*?>", RegexOptions.IgnoreCase);
            string matchString = string.IsNullOrWhiteSpace(matches.Groups[1].Value) ? 
                "" : matches.Groups[1].Value;

            return GetRelativeUrl(matchString);
        }

        public static string[] GetFirstImageSrc(string content, int n)
        {
            List<string> list = new List<string>();
            var matches = Regex.Matches(System.Web.HttpUtility.HtmlDecode(content), "<img.+?src=[\"'](.+?)[\"'].*?>", RegexOptions.IgnoreCase);
            var count = 0;
            foreach (Match m in matches)
            {
                if (count < n)
                {
                    if(!string.IsNullOrWhiteSpace(m.Groups[1].Value))
                    {
                        list.Add(GetRelativeUrl(m.Groups[1].Value));
                        count++;
                    }
                }
                else
                    break;
            }

            return list.ToArray<string>(); 
        }


        public static string TimeAgoNullable(Nullable<System.DateTime> dt)
        {
            if (dt == null)
                return null;
            else
                return dt.Value.ToShortDateString() + " " + dt.Value.ToShortTimeString();
        }

        public static string TimeAgo(DateTime dt)
        {
            TimeSpan span = DateTime.Now - dt;
            return TimeAgo(span);
        }

        private static string TimeAgo(TimeSpan span)
        {
            if (span.Days > 365)
            {
                int years = (span.Days / 365);
                if (span.Days % 365 != 0)
                    years += 1;
                return String.Format(Resources.Resources.List_Time_Format,
                years, years == 1 ? Resources.Resources.List_Time_Year : Resources.Resources.List_Time_Years);
            }
            if (span.Days > 30)
            {
                int months = (span.Days / 30);
                if (span.Days % 31 != 0)
                    months += 1;
                return String.Format(Resources.Resources.List_Time_Format,
                months, months == 1 ? Resources.Resources.List_Time_Month : Resources.Resources.List_Time_Months);
            }
            if (span.Days > 0)
                return String.Format(Resources.Resources.List_Time_Format,
                span.Days, span.Days == 1 ? Resources.Resources.List_Time_Day : Resources.Resources.List_Time_Days);
            if (span.Hours > 0)
                return String.Format(Resources.Resources.List_Time_Format,
                span.Hours, span.Hours == 1 ? Resources.Resources.List_Time_Hour : Resources.Resources.List_Time_Hours);
            if (span.Minutes > 0)
                return String.Format(Resources.Resources.List_Time_Format,
                span.Minutes, span.Minutes == 1 ? Resources.Resources.List_Time_Minute : Resources.Resources.List_Time_Minutes);
            if (span.Seconds > 5)
                return String.Format(Resources.Resources.List_Time_Format, span.Seconds, Resources.Resources.List_Time_Seconds);
            if (span.Seconds <= 5)
                return Resources.Resources.List_Time_Just;
            return string.Empty;
        }

        public static string GetShortTitle(string title)
        {
            var urlTitle = string.Empty;
            if (!String.IsNullOrWhiteSpace(title))
            {
                urlTitle = title;
            }
            else 
            {
                return "article";
            }

            //urlTitle = Regex.Replace(urlTitle, @"[^A-Za-z0-9 ]+", "");
            //urlTitle = urlTitle.Trim().Replace(" ", "-");
            return SubString(urlTitle, Math.Min(50, urlTitle.Length - 1));
        }

        public static string GetUrlTitle(string title)
        {
            var urlTitle = string.Empty;
            if (!String.IsNullOrWhiteSpace(title))
            {
                urlTitle = title;
            }
            else
            {
                return "reddah_article";
            }

            urlTitle = urlTitle.Trim().Replace(" ", "-");

            string[] invalid = { "<", ">", "*", "%", "&", ":", "/", "." };
                                
            foreach (string item in invalid) {
                urlTitle = urlTitle.Replace(item, "-");
            }

            string[] opts = { ",", ";", "'", "(", ")"};
            foreach (string item in opts)
            {
                urlTitle = urlTitle.Replace(item, "");
            }

            urlTitle = urlTitle.Replace("--", "-");
            if (urlTitle.IndexOf('-') == 0 && urlTitle.Length>1)
                urlTitle.Remove(1);

            urlTitle = SubString(urlTitle, Math.Min(50, urlTitle.Length));

            if (urlTitle.LastIndexOf('-') == urlTitle.Length - 1)
                urlTitle = SubString(urlTitle, urlTitle.Length - 1);

            return urlTitle;
        }

        public static string GetAntiForgeryToken()
        {
            string cookieToken, formToken;
            AntiForgery.GetTokens(null, out cookieToken, out formToken);
            return cookieToken + ":" + formToken;
        }

        public static string HideSensitiveWords(string text)
        {
            var re = new Regex(@"\b(\w+)\b", RegexOptions.Compiled);
            var replacements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                {"fuck", "duck"},
                {"bitch", "beach"},
                {"asshole", "niceweather"},
                {"操他妈","#$@" },
                {"操你妈","#*@" },
                {"你妈逼","*@O" },
            };
            return re.Replace(text, match => replacements.ContainsKey(match.Groups[1].Value) ? 
                replacements[match.Groups[1].Value] : match.Groups[1].Value);
        }

        public static string HideXss(string text="")
        {
            var re = new Regex(@"\b(\w+)\b", RegexOptions.Compiled);
            var replacements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                {"<applet>", "(applet)"},
                {"<body>", "(body)"},
                {"<embed>", "(embed)"},
                {"<frame>", "(frame)"},
                {"<script>", "(script)"},
                {"<frameset>", "(frameset)"},
                {"<html>", "(html)"},
                {"<iframe>", "(iframe)"},
                {"<img>", "(img)"},
                {"<style>", "(style)"},
                {"<layer>", "(layer)"},
                {"<link>", "(link)"},
                {"<ilayer>", "(ilayer)"},
                {"<meta>", "(meta)"},
                {"<object>", "(object)"},
                {"&lt;script&gt;", "(script)"},
            };

            var result = text;
            try
            {
                result = re.Replace(text, match => replacements.ContainsKey(match.Groups[1].Value) ?
                   replacements[match.Groups[1].Value] : match.Groups[1].Value);
            }
            catch { }
            return result;
        }

        public static string HtmlEncode(string text)
        {
            return System.Web.HttpUtility.HtmlEncode(HideXss(HideSensitiveWords(text)));
        }

        public static string HtmlDecode(string text)
        {
            return System.Web.HttpUtility.HtmlDecode(HideXss(text));
        }

        public static string ReplaceHtmlTag(string html)
        {
            string stroutput = html??"";
            Regex regex = new Regex(@"<[^>]+>|</[^>]+>");

            stroutput = regex.Replace(stroutput, "");
            return stroutput;
        }

        public static string ToAudioString(string html)
        {
            html = HtmlDecode(html??"");
            html = System.Web.HttpUtility.HtmlDecode(html);

            return SubString(ReplaceHtmlTag(html), Math.Min(500, html.Length - 1));
        }

        public static string SubString(string str, int len)
        {
            string result = string.Empty;
            if (string.IsNullOrEmpty(str))
            {
                return result;
            }
            int byteLen = System.Text.Encoding.Default.GetByteCount(str);
            int charLen = str.Length;
            int byteCount = 0;
            int pos = 0;
            if (byteLen > len)
            {
                for (int i = 0; i < charLen; i++)
                {
                    if (Convert.ToInt32(str.ToCharArray()[i]) > 255)
                    {
                        byteCount += 2;
                    }
                    else
                    {
                        byteCount += 1;
                    }
                    if (byteCount > len)
                    {
                        pos = i;
                        break;
                    }
                    else if (byteCount == len)
                    {
                        pos = i + 1; break;
                    }
                }
                if (pos >= 0)
                {
                    result = str.Substring(0, pos);
                }
            }
            else { result = str; }
            return result;

        }

        //public static string GetLocalizedPath(string originalPath)
        //{
        //    String path = RemoveLocaleFromPath(originalPath);

        //    var culture = new CultureInfo("en-US");

        //    return string.Join("/", culture.Name, path);
        //}


        public static string ToSimplified(string source)
        {
            return Microsoft.VisualBasic.Strings.StrConv(source, Microsoft.VisualBasic.VbStrConv.SimplifiedChinese, 0);
        }

        public static string ToTraditional(string source)
        {
            return Microsoft.VisualBasic.Strings.StrConv(source, Microsoft.VisualBasic.VbStrConv.TraditionalChinese, 0); 
        }

    }
}