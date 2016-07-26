namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;

    public class UserArticleViewModel
    {
        public List<ArticlePreview> Articles { get; set; }

        public UserArticleViewModel(string userName, string count)
        {
            Articles = new List<ArticlePreview>();

            using (var db = new reddahEntities1())
            {
                var query = from b in db.Articles 
                            where b.UserName == userName
                            orderby b.Count descending
                            select b;

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

                    Articles.Add(ap);
                }
            }
        }
    }
}