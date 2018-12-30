using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using Reddah.Web.UI.Models;
using Reddah.Web.UI.Utility;

namespace Reddah.Web.UI.Controllers
{
    using System.Web.Mvc;
    using System.Xml;
    using Reddah.Web.Core.ABTesting;
    using Reddah.Web.UI.ViewModels;

    public class SupportController : Controller
    {
        //[ABTesting(Feature.HomePageV2, "HomePageV2")]
        public ActionResult Index(string path="")
        {
            var presentationView = Request.Browser.IsMobileDevice ?
                "~/Views/Home/HomePageV1.mobile.cshtml" : "~/Views/Home/HomePageV1.cshtml";
            
            return View(presentationView, new HomePageViewModel(path));
        }

        public ActionResult HomePageV2(string path = "")
        {
            ViewBag.Message = "Agile and optimize your test experience of CodedUI projects.";

            var presentationView = "~/Views/Home/HomePageV2.cshtml";

            return View(presentationView, new HomePageViewModel());
        }

        private string GetContentType(string path)
        {
            var doc = new XmlDocument();

            doc.Load(HttpContext.Server.MapPath("~/Content/" + path + ".xml"));

            return doc.SelectSingleNode("ContentType/@Name").Value;
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your app description page.";

            return View("~/Views/Home/About.cshtml");
        }

        public ActionResult Error()
        {
            return View();
        }

        
        [HttpGet]
        public ActionResult ChangeLocale(string targetLocale, string returnUrl)
        {
            if (string.IsNullOrEmpty(targetLocale))
            {
                var presentationView = Request.Browser.IsMobileDevice ? 
                    "~/Views/Shared/ChangeLocale.mobile.cshtml" : "~/Views/Shared/ChangeLocale.cshtml";

                var allWebCultures = GetCultures();
                var cultures = new List<CultureViewModel>();
                var referrerUrl = Request.UrlReferrer;
                // Ensure we send users only to pages from this website
                //if (!DomainReferrerWhitelist.IsReferrerAllowed(referrerUrl))
                //{
                //    referrerUrl = null;
                //}

                foreach (var culture in allWebCultures)
                {
                    var link = string.Format("?targetLocale={0}", culture.Name);
                    if (referrerUrl != null)
                    {
                        link += "&returnUrl=" + Server.UrlEncode(referrerUrl.ToString()); // Encode a return url
                    }
                    cultures.Add(new CultureViewModel
                                     {
                                         Name = culture.Name,
                                         SortName = culture.SortName,
                                         DisplayName = culture.DisplayName,
                                         Link = link,
                                         IsInPreferList = culture.IsInPreferList,
                                     });
                }

                var groupedCultures = cultures
                    .OrderBy(c => c.SortName, StringComparer.CurrentCultureIgnoreCase)
                    .GroupBy(c => new StringInfo(c.SortName).SubstringByTextElements(0, 1));

                return View(presentationView, groupedCultures);
            }

            var currentCulture = Thread.CurrentThread.CurrentUICulture;

            Thread.CurrentThread.CurrentCulture = new CultureInfo(targetLocale);
            Thread.CurrentThread.CurrentUICulture = new CultureInfo(targetLocale);

            return Redirect(returnUrl.Replace(currentCulture.Name, targetLocale));
        }

        private List<CultureViewModel> GetCultures()
        {
            var cultures = new List<CultureViewModel>();

            cultures.Add(new CultureViewModel
                {
                    Name = "en-US",
                    SortName = "US",
                    DisplayName = "United States",
                    Link = "",
                    IsInPreferList = true,
                });

            cultures.Add(new CultureViewModel
            {
                Name = "en-GB",
                SortName = "United Kingdom",
                DisplayName = "United Kingdom",
                Link = "",
                IsInPreferList = true,
            });

            cultures.Add(new CultureViewModel
            {
                Name = "zh-CN",
                SortName = "CN",
                DisplayName = "中华人民共和国 (China)",
                Link = "",
                IsInPreferList = true,
            });

            cultures.Add(new CultureViewModel
            {
                Name = "ja-JP",
                SortName = "JP",
                DisplayName = "日本 (Japan)",
                Link = "",
                IsInPreferList = true,
            });

            cultures.Add(new CultureViewModel
            {
                Name = "ko-KR",
                SortName = "KR",
                DisplayName = "대한민국 (Korea)",
                Link = "",
                IsInPreferList = true,
            });

            cultures.Add(new CultureViewModel
            {
                Name = "fr-FR",
                SortName = "FR",
                DisplayName = "France",
                Link = "",
                IsInPreferList = true,
            });
            
            return cultures;
        }
    }
}
