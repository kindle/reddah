namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;
    using System.Xml;
    using System.Web;

    public class ArticleCommentViewModel : ArticleViewModelBase
    {
        public ArticlePreview Article { get; set; }
        //public List<ArticlePreview> RightBoxModules { get; set; }
        public SeededComments Comments { get; set; }
        public string GroupName { get; set; }

        public ArticleCommentViewModel() : base()
        {
            
        }

        public ArticleCommentViewModel(string groupName, int id, string count)
        {
            GroupName = groupName.ToLowerInvariant();
            
            Article = new ArticlePreview();
            //Comments = new List<ArticleComment>();
            using (var db = new reddahEntities1())
            {
                var item = db.Articles.FirstOrDefault(a => a.Id == id);
                if (item != null)
                {
                    Article.Id = item.Id;
                    Article.Title = item.Title;
                    Article.Abstract = item.Abstract;
                    Article.Description = item.Content;
                    Article.ImageUrl = Helpers.GetFirstImageSrc(item.Content);
                    Article.ArticleUrl = item.Title;
                    Article.Comments = item.Count;
                    Article.Up = item.Up ?? 0;
                    Article.Down = item.Down ?? 0;
                    Article.Count = item.Count;
                    Article.CreatedOn = Helpers.TimeAgo(item.CreatedOn);
                    Article.UserName = item.UserName;
                    Article.GroupName = item.GroupName;
                    Article.Content = item.Content;
                    Article.LastUpdateOn = Helpers.TimeAgoNullable(item.LastUpdateOn);
                }

                var comments = (from c in db.Comments
                                where c.ArticleId == id
                                orderby c.CreatedOn descending
                             select c);//.Skip(pageCount * pageNo).Take(pageCount);

                Comments = new SeededComments { Seed = -1, Comments = comments.ToList() };
            }
        }
        /*
        private const string HomePageXmlPath = "~/App_Data/wiki/Pages/HomePage.xml";

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
        }*/
    }
}