namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Xml;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;
    using System.Web;
    using System.Globalization;

    public class UserProfileArticleViewModel : ArticleViewModelBase
    {
        public List<ArticlePreview> Articles { get; set; }

        public UserProfileArticleViewModel(UserProfileModel userProfileModel) : base()
        {
            Articles = GetUserProfileArticles(userProfileModel);
        }

        private List<ArticlePreview> GetUserProfileArticles(UserProfileModel userProfileModel)
        {
            const int pageNo = 0; // put in userProfile send article list
            const int pageCount = 25;
            var apList = new List<ArticlePreview>();

            string locale = CultureInfo.CurrentUICulture.Name.ToLowerInvariant().Split('-')[0];

            /*using (var db = new reddahEntities1())
            {
                IEnumerable<Article> query = null;

                query = (from b in db.Articles
                            where b.Locale.StartsWith(locale)
                            orderby b.Count descending
                            select b).Skip(pageCount * pageNo).Take(pageCount);
                
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
            }*/

            return apList;
        }
    }
}