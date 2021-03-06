﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
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

        public static string HtmlEncode(string text)
        {
            return HttpUtility.HtmlEncode(HideXss(HideSensitiveWords(text)));
        }

        public static string Sha1(this string str)
        {
            var buffer = Encoding.UTF8.GetBytes(str);
            var data = SHA1.Create().ComputeHash(buffer);

            var sb = new StringBuilder();
            foreach (var t in data)
            {
                sb.Append(t.ToString("X2"));
            }

            return sb.ToString();
        }

        public static string EncodeBase64(string code_type, string code)
        {
            string encode = "";
            byte[] bytes = Encoding.GetEncoding(code_type).GetBytes(code);
            try
            {
                encode = Convert.ToBase64String(bytes);
            }
            catch
            {
                encode = code;
            }
            return encode;
        }

        public static string GetRelativeUrl(string url)
        {
            return url.StartsWith("/uploadPhoto", StringComparison.InvariantCultureIgnoreCase) ? url.Replace("/uploadPhoto",
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
                    if (!string.IsNullOrWhiteSpace(m.Groups[1].Value))
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

        public static void Email(
            MailAddress from,
            MailAddress to,
            string subject,
            string body,
            bool isbodyHtml = false
            )
        {

            try
            {
                var verifyEmailPassword = string.Empty;
                using (var db = new reddahEntities())
                {
                    verifyEmailPassword = db.Setting.FirstOrDefault(s => s.Key == "VerifyEmailPassword").Value;
                }
                SmtpClient client = new SmtpClient();
                client.Host = "smtp.reddah.com";
                client.Credentials = new System.Net.NetworkCredential(from.Address, verifyEmailPassword);
                client.EnableSsl = false;
                MailMessage message = new MailMessage(from, to);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = isbodyHtml;
                client.Send(message);
            }
            catch (Exception e)
            {

            }
        }
        
        private static MD5 md5 = MD5.Create();

        public static string Md5(string sourceStr)
        {
            return Md5(Encoding.UTF8, sourceStr);
        }

        public static string Md5(Encoding encode, string sourceStr)
        {
            StringBuilder sb = new StringBuilder();

            byte[] source = md5.ComputeHash(encode.GetBytes(sourceStr));
            for (int i = 0; i < source.Length; i++)
            {
                sb.Append(source[i].ToString("x2"));
            }

            return sb.ToString();
        }
    }
}