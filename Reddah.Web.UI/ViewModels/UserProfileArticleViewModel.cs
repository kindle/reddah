namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;
    using System.Globalization;

    public class UserProfileArticleViewModel
    {
        public List<ArticlePreview> Articles { get; set; }
        
        public UserProfileArticleViewModel(UserProfileModel userProfileModel)
        {
            Articles = GetUserProfileArticles(userProfileModel);
        }

        private List<ArticlePreview> GetUserProfileArticles(UserProfileModel userProfileModel)
        {
            const int pageCount = 10;
            var apList = new List<ArticlePreview>();

            //string locale = CultureInfo.CurrentUICulture.Name.ToLowerInvariant().Split('-')[0];
            string locale = userProfileModel.Locale.ToLowerInvariant().Split('-')[0];

            using (var db = new reddahEntities1())
            {
                IEnumerable<Article> query = null;
                int[] loaded = userProfileModel.LoadedIds == null ? new int[] { } : userProfileModel.LoadedIds;

                if (userProfileModel.Menu.Equals("new", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale) &&
                              !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select b)
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("promoted", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    //query according to user habits
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale) &&
                              !(loaded).Contains(b.Id)
                             orderby b.Count descending, b.LastUpdateOn descending
                             select b)
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("hot", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             where b.Locale.StartsWith(locale) &&
                              !(loaded).Contains(b.Id)
                             orderby b.Count descending, b.LastUpdateOn descending
                             select b)
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("bysub", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    //max support 5
                    var ga = userProfileModel.Sub.Split(',');
                    var g1 = ga.Length > 0 ? ga[0] : "";
                    var g2 = ga.Length > 1 ? ga[1] : "";
                    var g3 = ga.Length > 2 ? ga[2] : "";
                    var g4 = ga.Length > 3 ? ga[3] : "";
                    var g5 = ga.Length > 4 ? ga[4] : "";
                    query = (from b in db.Articles
                             where
                                b.GroupName.Contains(g1) &&
                                b.GroupName.Contains(g2) &&
                                b.GroupName.Contains(g3) &&
                                b.GroupName.Contains(g4) &&
                                b.GroupName.Contains(g5) &&
                                b.Locale.StartsWith(locale) &&
                                !(loaded).Contains(b.Id)
                             orderby b.Count descending, b.LastUpdateOn descending
                             select b)
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("byuser", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             where
                                b.UserName == userProfileModel.User &&
                                b.Locale.StartsWith(locale) &&
                                !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select b)
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("search", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             where
                                (b.Title.Contains(userProfileModel.Keyword) ||
                                b.Content.Contains(userProfileModel.Keyword) ||
                                b.UserName.Contains(userProfileModel.Keyword) ||
                                b.Abstract.Contains(userProfileModel.Keyword) ||
                                b.GroupName.Contains(userProfileModel.Keyword))  &&
                                //b.Locale.StartsWith(locale) &&
                                !(loaded).Contains(b.Id)&&
                                b.Type == userProfileModel.Type
                             orderby b.Count descending, b.LastUpdateOn descending
                             select b)
                            .Take(pageCount);
                }

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
                    ap.Type = item.Type;
                    ap.Locale = item.Locale;
                    
                    apList.Add(ap);
                }
            }

            return apList;
        }
    }
}