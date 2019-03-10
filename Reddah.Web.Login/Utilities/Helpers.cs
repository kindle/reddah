using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace Reddah.Web.Login.Utilities
{
    public static class Helpers
    {
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

        public static string HideXss(string text)
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
            return re.Replace(text, match => replacements.ContainsKey(match.Groups[1].Value) ?
                replacements[match.Groups[1].Value] : match.Groups[1].Value);
        }
    }
}