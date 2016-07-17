namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Xml;
    using System.Xml.Linq;

    using Reddah.Web.UI.Models;
    
    public class HomePageViewModel
    {
        public string PageTitle;
        public string AnnouncementsTitle;
        public List<ArticlePreview> Announcements { get; set; }
        public List<ArticlePreview> RightBoxModules { get; set; }
        public List<SectionPreview> HomePageContents { get; set; }

        private const string HomePageXmlPath = "~/App_Data/wiki/Pages/HomePage.xml";

        public HomePageViewModel(string path="")
        {
            PageTitle = GetContentItems("/Root/PageDetails/Title");
            AnnouncementsTitle = GetContentItems("/Root/Announcements/Title");
            Announcements = GetArticlePreviews("/Root/Announcements/AnnouncementsLinkList/AnnouncementsLink");
            HomePageContents = GetSectionPreviews("/Root/HomePageModularLeftContent/HomePageContent");
            RightBoxModules = GetArticlePreviews("/Root/HomePageModularRightContent/HomePageRightBoxModule");
        }

        /// <summary>
        /// List of articles
        /// </summary>
        public List<ArticlePreview> Articles { get; set; }

        private string GetContentItems(string path)
        {
            var doc = XDocument.Load(HttpContext.Current.Server.MapPath(HomePageXmlPath));
            XElement node = doc.Descendants().FirstOrDefault(e => e.Path() == path);
            return node.Value;
        }

        private List<ArticlePreview> GetArticlePreviews(string path)
        {
            var doc = new XmlDocument();
            doc.Load(HttpContext.Current.Server.MapPath(HomePageXmlPath));

            var apList = new List<ArticlePreview>();
            foreach (XmlNode node in doc.SelectNodes(path))
            {
                var ap = new ArticlePreview();
                ap.Title = node.SelectSingleNode("Title").InnerText;
                ap.Description = node.SelectSingleNode("Description").InnerText;
                ap.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
                ap.ArticleUrl = node.SelectSingleNode("ArticleUrl").InnerText;

                apList.Add(ap);
            }

            return apList;
        }

        private List<SectionPreview> GetSectionPreviews(string path)
        {
            var spList = new List<SectionPreview>();

            var doc = new XmlDocument();
            doc.Load(HttpContext.Current.Server.MapPath(HomePageXmlPath));

            foreach (XmlNode node in doc.SelectNodes(path))
            {
                var sp = new SectionPreview();
                sp.Title = node.SelectSingleNode("Title").InnerText;

                //var apList = GetArticlePreviews("");
                var apList = new List<ArticlePreview>();
                foreach (XmlNode articleNode in node.SelectNodes("HomePageContentLinkList/HomePageContentLink"))
                {
                    var ap = new ArticlePreview();
                    ap.Title = articleNode.SelectSingleNode("Title").InnerText;
                    ap.Description = articleNode.SelectSingleNode("Description").InnerText;
                    ap.ImageUrl = articleNode.SelectSingleNode("ImageUrl").InnerText;
                    ap.ArticleUrl = articleNode.SelectSingleNode("ArticleUrl").InnerText;

                    apList.Add(ap);
                }

                sp.Items = apList;
                
                spList.Add(sp);
            }

            return spList;
        }
    }

    static class Extensions
    {
        public static string Path(this XElement element)
        {
            XElement tmp = element;
            string path = string.Empty;
            while (tmp != null)
            {
                path = "/" + tmp.Name + path;
                tmp = tmp.Parent;
            }
            return path;
        }
    }
}