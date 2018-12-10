namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;
    using System.Web;
    using System;

    public class SubArticleViewModel
    {
        public List<ArticlePreview> RightBoxModules { get; set; }

        public SubArticleViewModel(string sub, int count)
        {
            //Folders = GetFolderPreviews(path);
            Items = GetItemPreviews(sub);
            Articles = GetArticlePreviews();
            NextPrevBox = MenuFactory.GetItemPreviews("nextprevbox", 10);
            RightBoxModules = GetArticlePreviews1("/Root/HomePageModularRightContent/HomePageRightBoxModule");
            TrendingSubs = new SubArticleViewModel().GetTrendingSubs();
        }

        //for random sub
        public SubArticleViewModel()
        {
        }

        public List<ArticlePreview> Articles { get; set; }
        public List<ArticlePreview> NextPrevBox { get; set; }
        public List<ArticlePreview> Folders { get; set; }
        public List<ArticlePreview> Items { get; set; }
        public List<string> TrendingSubs { get; set; }

        public string GetRandomSub() 
        {
            string subName = string.Empty;

            using (var db = new reddahEntities1())
            {
                var allSubs = db.Groups.AsEnumerable();
                              
                var randomGroup = allSubs.ElementAtOrDefault(new Random().Next() % allSubs.Count());
                subName = randomGroup.Name;
            }

            return subName;
        }

        public List<string> GetTrendingSubs()
        {
            TrendingSubs = new List<string>();

            using (var db = new reddahEntities1())
            {
                var q = db.Articles
                   .GroupBy(x => x.GroupName)
                   .Select(g => new { GroupName = g.Key, Count = g.Count() })
                   .OrderByDescending(i => i.Count)
                   .Take(5);

                foreach (var item in q)
                {
                    TrendingSubs.Add(item.GroupName);
                }
            }

            return TrendingSubs;
        }

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
                    ap.Id = item.Id;
                    ap.Title = item.Title;
                    ap.Abstract = item.Abstract;
                    ap.Description = item.Content;
                    ap.ImageUrl = Helpers.GetFirstImageSrc(item.Content);
                    ap.ImageUrls = Helpers.GetFirstImageSrc(item.Content, 3);
                    ap.VideoUrl = Helpers.GetVideoSrc(item.Content);
                    ap.VideoPoster = Helpers.GetVideoPoster(item.Content);
                    ap.ArticleUrl = item.Title;
                    ap.Comments = item.Count;
                    ap.Up = item.Up ?? 0;
                    ap.Down = item.Down ?? 0;
                    ap.Count = item.Count;
                    ap.CreatedOn = Helpers.TimeAgo(item.CreatedOn);
                    ap.UserName = item.UserName;
                    ap.GroupName = item.GroupName;
                    ap.Content = item.Content;

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