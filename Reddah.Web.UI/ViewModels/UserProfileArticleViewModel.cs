namespace Reddah.Web.UI.ViewModels
{
    using System.Collections.Generic;
    using System.Linq;

    using Reddah.Web.UI.Models;
    using Reddah.Web.UI.Utility;

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
                IEnumerable<PubArticle> query = null;
                int[] loaded = userProfileModel.LoadedIds == null ? new int[] { } : userProfileModel.LoadedIds;
                string[] disgrp = userProfileModel.DislikeGroups == null ? new string[] { } : userProfileModel.DislikeGroups;
                string[] disuser = userProfileModel.DislikeUserNames == null ? new string[] { } : userProfileModel.DislikeUserNames;

                IEnumerable<string> grp = new List<string>(disgrp);

                if (userProfileModel.Menu.Equals("new", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             join u in db.UserProfiles on b.UserName equals u.UserName
                             where b.Status== userProfileModel.Status && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
                              !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new PubArticle()
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 CreatedBy = b.CreatedBy,
                                 LastUpdateBy = b.LastUpdateBy,
                                 Status = b.Status,
                                 LastUpdateContent = b.LastUpdateContent,
                                 LastUpdateType = b.LastUpdateType,
                                 PubName = u.NickName ?? u.UserName
                             })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("promoted", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    //query according to user habits
                    //too slow
                    /*query = (from b in db.Articles.AsEnumerable()
                             where b.Status == userProfileModel.Status && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
                              //!(loaded).Contains(b.Id) && !(disgrp).Contains(b.GroupName) && !(disuser).Contains(b.UserName)
                              !(loaded).Contains(b.Id) && !(disuser).Contains(b.UserName) && 
                                grp.Intersect(b.GroupName.Split(',').ToList()).Count()==0
                             orderby b.Count descending, b.LastUpdateOn descending
                             select b)
                            .Take(pageCount);*/
                    string grp0 = "-", grp1 = "-", grp2 = "-", grp3 = "-", grp4 = "-", grp5 = "-", grp6 = "-",
                         grp7 = "-",  grp8 = "-", grp9 = "-", grp10 = "-";
                    disgrp.Reverse();
                    for(int i=0;i<disgrp.Length;i++)
                    {
                        if (i == 0)
                            grp0 = disgrp[i];
                        if (i == 1)
                            grp1 = disgrp[i];
                        if (i == 2)
                            grp2 = disgrp[i];
                        if (i == 3)
                            grp3 = disgrp[i];
                        if (i == 4)
                            grp4 = disgrp[i];
                        if (i == 5)
                            grp5 = disgrp[i];
                        if (i == 6)
                            grp6 = disgrp[i];
                        if (i == 7)
                            grp7 = disgrp[i];
                        if (i == 8)
                            grp8 = disgrp[i];
                        if (i == 9)
                            grp9 = disgrp[i];
                        if (i == 10)
                            grp10 = disgrp[i];
                        
                    }

                    query = (from b in db.Articles
                             join u in db.UserProfiles on b.UserName equals u.UserName
                             where b.Status == userProfileModel.Status && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
                              //!(loaded).Contains(b.Id) && !(disgrp).Contains(b.GroupName) && !(disuser).Contains(b.UserName)
                              !(loaded).Contains(b.Id) && !(disuser).Contains(b.UserName) &&
                                !b.GroupName.Contains(grp0) &&
                                !b.GroupName.Contains(grp1) &&
                                !b.GroupName.Contains(grp2) &&
                                !b.GroupName.Contains(grp3) &&
                                !b.GroupName.Contains(grp4) &&
                                !b.GroupName.Contains(grp5) &&
                                !b.GroupName.Contains(grp6) &&
                                !b.GroupName.Contains(grp7) &&
                                !b.GroupName.Contains(grp8) &&
                                !b.GroupName.Contains(grp9) &&
                                !b.GroupName.Contains(grp10) 
                             orderby b.Count descending, b.LastUpdateOn descending
                             select new PubArticle()
                             {
                                 Id = b.Id,
                                Title = b.Title,
                                Content = b.Content,
                                Abstract = b.Abstract,
                                CreatedOn = b.CreatedOn,
                                Up = b.Up,
                                Down = b.Down,
                                Count = b.Count,
                                UserName = b.UserName,
                                GroupName = b.GroupName,
                                Locale = b.Locale,
                                LastUpdateOn = b.LastUpdateOn,
                                Type = b.Type,
                                Ref = b.Ref,
                                Location = b.Location,
                                CreatedBy = b.CreatedBy,
                                LastUpdateBy = b.LastUpdateBy,
                                Status = b.Status,
                                LastUpdateContent = b.LastUpdateContent,
                                LastUpdateType = b.LastUpdateType,
                                PubName = u.NickName ?? u.UserName
                             })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("hot", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             join u in db.UserProfiles on b.UserName equals u.UserName
                             where b.Status == userProfileModel.Status && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
                              !(loaded).Contains(b.Id)
                             orderby b.Count descending, b.LastUpdateOn descending
                             select new PubArticle()
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 CreatedBy = b.CreatedBy,
                                 LastUpdateBy = b.LastUpdateBy,
                                 Status = b.Status,
                                 LastUpdateContent = b.LastUpdateContent,
                                 LastUpdateType = b.LastUpdateType,
                                 PubName = u.NickName ?? u.UserName
                             })
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
                             join u in db.UserProfiles on b.UserName equals u.UserName
                             where b.Status == userProfileModel.Status && b.LastUpdateType != 100 &&
                                b.GroupName.Contains(g1) &&
                                b.GroupName.Contains(g2) &&
                                b.GroupName.Contains(g3) &&
                                b.GroupName.Contains(g4) &&
                                b.GroupName.Contains(g5) &&
                                b.Locale.StartsWith(locale) &&
                                !(loaded).Contains(b.Id)
                             orderby b.Count descending, b.LastUpdateOn descending
                             select new PubArticle()
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 CreatedBy = b.CreatedBy,
                                 LastUpdateBy = b.LastUpdateBy,
                                 Status = b.Status,
                                 LastUpdateContent = b.LastUpdateContent,
                                 LastUpdateType = b.LastUpdateType,
                                 PubName = u.NickName ?? u.UserName
                             })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("byuser", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             join u in db.UserProfiles on b.UserName equals u.UserName
                             where b.Status == userProfileModel.Status && b.LastUpdateType != 100 &&
                                b.UserName == userProfileModel.User &&
                                b.Locale.StartsWith(locale) &&
                                !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new PubArticle()
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 CreatedBy = b.CreatedBy,
                                 LastUpdateBy = b.LastUpdateBy,
                                 Status = b.Status,
                                 LastUpdateContent = b.LastUpdateContent,
                                 LastUpdateType = b.LastUpdateType,
                                 PubName = u.NickName ?? u.UserName
                             })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("search", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             join u in db.UserProfiles on b.UserName equals u.UserName
                             where b.Status == userProfileModel.Status && b.LastUpdateType!=100 &&
                                (b.Title.Contains(userProfileModel.Keyword) ||
                                b.Content.Contains(userProfileModel.Keyword) ||
                                b.UserName.Contains(userProfileModel.Keyword) ||
                                b.Abstract.Contains(userProfileModel.Keyword) ||
                                b.GroupName.Contains(userProfileModel.Keyword))  &&
                                //b.Locale.StartsWith(locale) &&
                                !(loaded).Contains(b.Id)&&
                                b.Type == userProfileModel.Type
                             orderby b.Id descending
                             select new PubArticle()
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 CreatedBy = b.CreatedBy,
                                 LastUpdateBy = b.LastUpdateBy,
                                 Status = b.Status,
                                 LastUpdateContent = b.LastUpdateContent,
                                 LastUpdateType = b.LastUpdateType,
                                 PubName = u.NickName ?? u.UserName
                             })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("draft", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Articles
                             join u in db.UserProfiles on b.UserName equals u.UserName
                             where b.Status == userProfileModel.Status &&
                                b.UserName == userProfileModel.User &&
                                //b.Locale.StartsWith(locale) &&
                                !(loaded).Contains(b.Id) &&
                                b.Type == userProfileModel.Type
                             orderby b.Id descending
                             select new PubArticle()
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 CreatedBy = b.CreatedBy,
                                 LastUpdateBy = b.LastUpdateBy,
                                 Status = b.Status,
                                 LastUpdateContent = b.LastUpdateContent,
                                 LastUpdateType = b.LastUpdateType,
                                 PubName = u.NickName ?? u.UserName
                             })
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
                    ap.CreatedOnOrg = item.CreatedOn;
                    ap.UserName = item.UserName;
                    ap.GroupName = item.GroupName;
                    ap.Content = item.Content;
                    ap.Type = item.Type;
                    ap.Locale = item.Locale;
                    ap.Ref = item.Ref;
                    ap.LastUpdateOn = item.LastUpdateOn;
                    ap.PubName = item.PubName;
                    
                    apList.Add(ap);
                }
            }

            return apList;
        }
    }
}