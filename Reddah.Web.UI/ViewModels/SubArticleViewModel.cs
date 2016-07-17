namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;
    using System.Web;

    public class SubArticleViewModel
    {
        public List<ArticlePreview> RightBoxModules { get; set; }

        public SubArticleViewModel(string sub, int count)
        {
            
            //Folders = GetFolderPreviews(path);
            Items = GetItemPreviews(sub);
            Articles = GetArticlePreviews();
            RightBoxModules = GetArticlePreviews1("/Root/HomePageModularRightContent/HomePageRightBoxModule");
        }

        public List<ArticlePreview> Articles { get; set; }
        public List<ArticlePreview> Folders { get; set; }
        public List<ArticlePreview> Items { get; set; }

        private List<ArticlePreview> GetItemPreviews(string sub)
        {
            var apList = new List<ArticlePreview>();

            //if hot
            using (var db = new reddahEntities1())
            {
                var query = from b in db.Articles
                            orderby b.Count descending where b.GroupName == sub
                            select b;

                foreach (var item in query)
                {
                    var ap = new ArticlePreview();
                    ap.Title = item.Title;
                    ap.Abstract = item.Abstract;
                    ap.Description = item.Content;
                    ap.ImageUrl = Helpers.GetFirstImageSrc(item.Content);
                    ap.ArticleUrl = item.Title;
                    ap.Comments = item.Count ?? 0;
                    ap.Up = item.Up ?? 0;
                    ap.Down = item.Down ?? 0;
                    ap.Count = ap.Up - ap.Down;
                    ap.CreatedOn = Helpers.TimeAgo(item.CreatedOn);
                    ap.UserName = item.UserName;
                    ap.GroupName = item.GroupName;

                    apList.Add(ap);
                }
            }

            return apList;
        }

        //private List<ArticlePreview> GetFolderPreviews(string path)
        //{
        //    return GetItemPreviews(path).FindAll(url => url.ArticleUrl.ToLower().Contains("navigationlist"));
        //}

        private List<ArticlePreview> GetArticlePreviews()
        {
            return Items.FindAll(url => !url.ArticleUrl.ToLower().Contains("navigationlist"));
        }

        private const string HomePageXmlPath = "~/App_Data/wiki/Pages/HomePage.xml";

        private List<ArticlePreview> GetArticlePreviews1(string path)
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
    }
}