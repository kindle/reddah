namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;
    using System.Web;
    using System.Globalization;

    public static class MenuFactory 
    {
        public static List<ArticlePreview> GetItemPreviews(string type, int pageNo)
        {
            const int pageCount = 25;
            var apList = new List<ArticlePreview>();

            string locale = CultureInfo.CurrentUICulture.Name.ToLowerInvariant().Split('-')[0];

            using (var db = new reddahEntities1())
            {
                IEnumerable<Article> query = null;

                if (type == "hot")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                             orderby b.Count descending
                             select b).Skip(pageCount * pageNo).Take(pageCount);
                }
                else if (type == "new")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                                orderby b.Id descending
                             select b).Skip(pageCount * pageNo).Take(pageCount);
                }
                else if (type == "rising")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                                orderby (b.Up-b.Down) descending, b.Count descending
                             select b).Skip(pageCount * pageNo).Take(pageCount);
                }
                else if (type == "controversial")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                                orderby (b.Up - b.Down) ascending, (b.Up + b.Down) descending
                             select b).Skip(pageCount * pageNo).Take(pageCount);
                }
                else if (type == "top")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                                orderby (b.Up + b.Down) descending
                             select b).Skip(pageCount * pageNo).Take(pageCount);
                }
                else if (type == "gilded")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                                orderby b.Up descending
                             select b).Skip(pageCount * pageNo).Take(pageCount);
                }
                //todo
                else if (type == "promoted")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                                //where is promoted.
                                orderby b.Id descending
                             select b).Skip(pageCount * pageNo).Take(pageCount);
                }
                else if (type == "nextprevbox")
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale)
                                where b.Up == null || b.Down == null
                                orderby b.CreatedOn descending
                                select b).Take(10);
                }

                foreach (var item in query)
                {
                    var ap = new ArticlePreview();
                    ap.Id = item.Id;
                    ap.Title = item.Title;
                    ap.Abstract = item.Abstract;
                    ap.Description = item.Content;
                    ap.ImageUrl = Helpers.GetFirstImageSrc(item.Content);
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
    }

    public class MenuArticleViewModel : ArticleViewModelBase
    {
        public MenuArticleViewModel(string path, string type, int pageNo)
            : base(path)
        {
            //Folders = GetFolderPreviews(path);
            Items = MenuFactory.GetItemPreviews(type, pageNo);
            Articles = GetArticlePreviews(path);
            NextPrevBox = MenuFactory.GetItemPreviews("nextprevbox", 10);
            RightBoxModules = GetArticlePreviews1("/Root/HomePageModularRightContent/HomePageRightBoxModule");
            TrendingSubs = new SubArticleViewModel().GetTrendingSubs();
        }

        public List<ArticlePreview> Articles { get; set; }
        
        

        public List<ArticlePreview> Folders { get; set; }
        public List<ArticlePreview> Items { get; set; }

        //private List<ArticlePreview> GetItemPreviews(string path, string menu)
        //{
            

        //    } 


        //    //foreach (XmlNode node in Doc.SelectNodes("ContentType/Articles/Article"))
        //    //{
        //    //    var ap = new ArticlePreview();
        //    //    ap.Title = node.SelectSingleNode("Title").InnerText;
        //    //    ap.Description = node.SelectSingleNode("Description").InnerText;
        //    //    ap.ImageUrl = node.SelectSingleNode("ImageUrl").InnerText;
        //    //    ap.ArticleUrl = node.SelectSingleNode("ArticleUrl").InnerText;

        //    //    apList.Add(ap);
        //    //}
        //    //get top 25 dah from db

            
        //}

        //private List<ArticlePreview> GetFolderPreviews(string path)
        //{
        //    return GetItemPreviews(path).FindAll(url => url.ArticleUrl.ToLower().Contains("navigationlist"));
        //}

        private List<ArticlePreview> GetArticlePreviews(string path)
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