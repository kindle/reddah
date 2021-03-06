﻿using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using Reddah.Web.Login.Utilities;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;
using System.Data.Entity.Validation;
using Azure.Storage.Blobs;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/article")]
    public class ArticleController : ApiBaseController
    {
        [Route("getarticles")]
        [HttpPost]
        public IEnumerable<ArticlePreview> GetArticles([FromBody] UserProfileModel userProfileModel)
        {
            /*UserProfileModel userProfileModel = new UserProfileModel();
            userProfileModel.LoadedIds = loadedIds;
            userProfileModel.Locale = "en-us";
            userProfileModel.Menu = "new";*/

            return this.GetUserProfileArticles(userProfileModel);

        }

        private List<ArticlePreview> GetUserProfileArticles(UserProfileModel userProfileModel)
        {
            const int pageCount = 10;
            const int randomPageCount = 30;
            var apList = new List<ArticlePreview>();

            //string locale = CultureInfo.CurrentUICulture.Name.ToLowerInvariant().Split('-')[0];
            string locale = userProfileModel.Locale.ToLowerInvariant().Split('-')[0];

            using (var db = new reddahEntities())
            {
                IEnumerable<PubArticle> query = null;
                int[] loaded = userProfileModel.LoadedIds == null ? new int[] { } : userProfileModel.LoadedIds;
                string[] disgrp = userProfileModel.DislikeGroups == null ? new string[] { } : userProfileModel.DislikeGroups;
                string[] disuser = userProfileModel.DislikeUserNames == null ? new string[] { } : userProfileModel.DislikeUserNames;

                IEnumerable<string> grp = new List<string>(disgrp);

                if (userProfileModel.Menu.Equals("new", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
                                })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("promoted", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    //query according to user habits
                    //too slow
                    /*query = (from b in db.Articles.AsEnumerable()
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
                                //!(loaded).Contains(b.Id) && !(disgrp).Contains(b.GroupName) && !(disuser).Contains(b.UserName)
                                !(loaded).Contains(b.Id) && !(disuser).Contains(b.UserName) && 
                                grp.Intersect(b.GroupName.Split(',').ToList()).Count()==0
                                orderby b.Count descending, b.LastUpdateOn descending
                                select b)
                            .Take(pageCount);*/
                    string grp0 = "-", grp1 = "-", grp2 = "-", grp3 = "-", grp4 = "-", grp5 = "-", grp6 = "-",
                            grp7 = "-", grp8 = "-", grp9 = "-", grp10 = "-";
                    disgrp.Reverse();
                    for (int i = 0; i < disgrp.Length; i++)
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

                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
                                })
                            .Take(pageCount);
                    if (query.ToList().Count == 0)
                    {
                        query = (from b in db.Article
                                    join u in db.UserProfile on b.UserName equals u.UserName
                                    where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.LastUpdateType != 100 &&
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
                                        PubName = u.NickName ?? u.UserName,
                                        Admins = u.Admins,
                                    })
                            .Take(pageCount);
                    }
                }
                //copy promoted
                else if (userProfileModel.Menu.Equals("random", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    //query according to user habits
                    //too slow
                    /*query = (from b in db.Articles.AsEnumerable()
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
                                //!(loaded).Contains(b.Id) && !(disgrp).Contains(b.GroupName) && !(disuser).Contains(b.UserName)
                                !(loaded).Contains(b.Id) && !(disuser).Contains(b.UserName) && 
                                grp.Intersect(b.GroupName.Split(',').ToList()).Count()==0
                                orderby b.Count descending, b.LastUpdateOn descending
                                select b)
                            .Take(pageCount);*/
                    string grp0 = "-", grp1 = "-", grp2 = "-", grp3 = "-", grp4 = "-", grp5 = "-", grp6 = "-",
                            grp7 = "-", grp8 = "-", grp9 = "-", grp10 = "-";
                    disgrp.Reverse();
                    for (int i = 0; i < disgrp.Length; i++)
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

                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
                                }).OrderBy(e => Guid.NewGuid())
                            .Take(randomPageCount);
                    if (query.ToList().Count == 0)
                    {
                        query = (from b in db.Article
                                    join u in db.UserProfile on b.UserName equals u.UserName
                                    where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.LastUpdateType != 100 &&
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
                                        PubName = u.NickName ?? u.UserName,
                                        Admins = u.Admins,
                                    }).OrderBy(e => Guid.NewGuid())
                            .Take(randomPageCount);
                    }
                }
                else if (userProfileModel.Menu.Equals("hot", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.Locale.StartsWith(locale) && b.LastUpdateType != 100 &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
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
                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.LastUpdateType != 100 &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
                                })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("byuser", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.LastUpdateType != 100 &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
                                })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("search", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type && b.LastUpdateType != 100 &&
                                (b.Title.Contains(userProfileModel.Keyword) ||
                                b.Content.Contains(userProfileModel.Keyword) ||
                                b.UserName.Contains(userProfileModel.Keyword) ||
                                b.Abstract.Contains(userProfileModel.Keyword) ||
                                b.GroupName.Contains(userProfileModel.Keyword)) &&
                                //b.Locale.StartsWith(locale) &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
                                })
                            .Take(pageCount);
                }
                else if (userProfileModel.Menu.Equals("draft", System.StringComparison.InvariantCultureIgnoreCase))
                {
                    query = (from b in db.Article
                                join u in db.UserProfile on b.UserName equals u.UserName
                                where b.Status == userProfileModel.Status && b.Type == userProfileModel.Type &&
                                b.UserName == userProfileModel.User &&
                                //b.Locale.StartsWith(locale) &&
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
                                    PubName = u.NickName ?? u.UserName,
                                    Admins = u.Admins,
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
                    ap.CreatedOn = item.CreatedOn.ToString();
                    ap.CreatedOnOrg = item.CreatedOn;
                    ap.UserName = item.UserName;
                    ap.GroupName = item.GroupName;
                    ap.Content = item.Content;
                    ap.Type = item.Type;
                    ap.Locale = item.Locale;
                    ap.Ref = item.Ref;
                    ap.LastUpdateOn = item.LastUpdateOn;
                    ap.PubName = item.PubName;
                    ap.LastUpdateBy = item.LastUpdateBy;
                    ap.LastUpdateContent = item.LastUpdateContent;
                    ap.Admins = item.Admins;

                    apList.Add(ap);
                }
            }

            return apList;
        }

        [Route("getcomments")]
        [HttpPost]
        public IHttpActionResult GetComments([FromBody]CommentQuery query)
        {
            SeededComments seededComments;
            using (var db = new reddahEntities())
            {
                var comments = (from c in db.Comment
                                join u in db.UserProfile on c.UserName equals u.UserName
                                where c.ArticleId == query.ArticleId && c.Status!=-1
                                orderby c.CreatedOn ascending
                                select new AdvancedComment
                                {
                                    Id = c.Id,
                                    ArticleId = c.ArticleId,
                                    ParentId = c.ParentId,
                                    Content = c.Content,
                                    CreatedOn = c.CreatedOn,
                                    Up = c.Up,
                                    Down = c.Down,
                                    Count = c.Count,
                                    UserName = c.UserName,
                                    Status = c.Status,
                                    UserNickName = u.NickName,
                                    UserPhoto = u.Photo,
                                    UserSex = u.Sex,
                                    Type=c.Type,
                                    Duration=c.Duration
                                });

                seededComments = new SeededComments { Seed = -1, Comments = comments.ToList() };
                
            }
            return Ok(seededComments);

        }

        /// <summary>
        /// 0:mytimeline, 1:@ 2:comment, 3:like
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        [Route("addcomments")]
        [HttpPost]
        public IHttpActionResult AddComments([FromBody]NewComment data)
        {
            if (data.ArticleId < 0)
                return Ok(new ApiResult(1, "Invalid Article Id"));

            JwtResult jwtResult = AuthController.ValidJwt(data.Jwt);

            if(jwtResult.Success!=0)
                return Ok(new ApiResult(2, "Jwt invalid"+jwtResult.Message));

            try
            {
                using (var db = new reddahEntities())
                {
                    data.Content = data.Content.Replace("\n", "<br>");

                    db.Comment.Add(new Comment()
                    {
                        ArticleId = data.ArticleId,
                        ParentId = data.ParentId,
                        Content = HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content))),
                        CreatedOn = DateTime.UtcNow,
                        UserName = jwtResult.JwtUser.User,
                        Uid = data.Uid
                    });


                    var article = db.Article.FirstOrDefault(a => a.Id == data.ArticleId);
                    if (article != null)
                    {
                        article.Count++;
                        article.LastUpdateBy = jwtResult.JwtUser.User;
                        var lastContent = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content)));
                        if(!string.IsNullOrWhiteSpace(lastContent))
                        {
                            article.LastUpdateContent = lastContent;
                            article.LastUpdateOn = DateTime.UtcNow;
                        }
                        

                        //user or pub
                        var comUser = db.UserProfile.FirstOrDefault(u => u.UserName == article.UserName);
                        if (comUser.Type == 0)//person user
                        {
                            var msg = new Message()
                            {
                                From = jwtResult.JwtUser.User,
                                To = article.UserName,
                                Msg = "comment",
                                ArticleId = article.Id,
                                AritclePhoto = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content))),
                                Type = 2,
                                CreatedOn = DateTime.UtcNow,
                                Status = 0
                            };
                            db.Message.Add(msg);
                        }
                        else if (comUser.Type == 1)//pub user
                        {
                            foreach(var adminUser in comUser.Admins.Split(','))
                            {
                                var msg = new Message()
                                {
                                    From = jwtResult.JwtUser.User,
                                    To = adminUser,
                                    Msg = "comment",
                                    ArticleId = article.Id,
                                    AritclePhoto = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content))),
                                    Type = 2,
                                    CreatedOn = DateTime.UtcNow,
                                    Status = 0
                                };
                                db.Message.Add(msg);
                            }
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(data.AtUsers))
                    {
                        foreach(var atUserName in data.AtUsers.Split(','))
                        {
                            var msg = new Message()
                            {
                                From = jwtResult.JwtUser.User,
                                To = atUserName,
                                Msg = "at",
                                ArticleId = article.Id,
                                AritclePhoto = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content))),
                                Type = 1,
                                CreatedOn = DateTime.UtcNow,
                                Status = 0
                            };
                            db.Message.Add(msg);
                        }
                    }

                    if (data.ParentId != -1)
                    {
                        var parentComment = db.Comment.FirstOrDefault(c => c.Id == data.ParentId);
                        if (parentComment != null)
                        {
                            parentComment.Count++;
                        }
                    }

                    var chatItem = db.Article.FirstOrDefault(a => a.Id == data.ArticleId);
                    if (chatItem!=null)
                    {
                        chatItem.LastUpdateBy = jwtResult.JwtUser.User;
                        chatItem.LastUpdateOn = DateTime.UtcNow;
                        article.LastUpdateContent = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content)));
                        article.LastUpdateType = 0;
                    }

                    db.SaveChanges();

                }
            }
            catch(Exception ex)
            {
                Ok(new ApiResult(3, "Excepion:"+ex.Message.ToString()));
            }

            return Ok(new ApiResult(0, "New Comment Added"));

        }


        [Route("addtimelineazure")]
        [HttpPost]
        public IHttpActionResult AddTimelineAzure()
        {
            bool isPorn = false;
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string myaction = HttpContext.Current.Request["action"];
                string lat = HttpContext.Current.Request["lat"];
                string lng = HttpContext.Current.Request["lng"];
                string thoughts = HttpContext.Current.Request["thoughts"];
                string location = HttpContext.Current.Request["location"];
                string shareTitle = HttpContext.Current.Request["abstract"];
                string shareImageUrl = HttpContext.Current.Request["content"];
                //this is actually fileurl array
                string rorder = HttpContext.Current.Request["order"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                int feedbackType = js.Deserialize<int>(HttpContext.Current.Request["feedbackType"]);
                int type = js.Deserialize<int>(HttpContext.Current.Request["type"]);
                int porn = js.Deserialize<int>(HttpContext.Current.Request["porn"]);
                if (porn > 50)
                    isPorn = true;
                int refArticleId = js.Deserialize<int>(HttpContext.Current.Request["ref"]);
                //4:article 5:mini
                int userType = 0;
                if (HttpContext.Current.Request["utype"] != null)
                    userType = js.Deserialize<int>(HttpContext.Current.Request["utype"]);
                string atUsers = HttpContext.Current.Request["at"];

                Dictionary<string, string> imageUrls = new Dictionary<string, string>();

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                if (String.IsNullOrWhiteSpace(thoughts) && hfc.Count == 0 && shareTitle == null)
                    return Ok(new ApiResult(1, "No thoughts and photos"));

                if (hfc.Count == 0 && type == 5)
                    return Ok(new ApiResult(1010, "No materials uploaded"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    string[] order = rorder.Split(',');

                    using (var db = new reddahEntities())
                    {
                        Dictionary<string, string> dict = new Dictionary<string, string>();
                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string containerName = "photo";

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];
                            var fileNameKey = rfilename.Replace("_reddah_preview", "");
                            if (!dict.Keys.Contains(fileNameKey))
                            {
                                dict.Add(fileNameKey, guid);
                            }
                            else
                            {
                                guid = dict[fileNameKey];
                            }
                            if (upload.FileName.Contains("_reddah_preview"))
                            {
                                guid += "_reddah_preview";
                            }

                            try
                            {
                                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                                var fileNameWithExt = Path.GetFileName(guid + "." + fileFormat);

                                //string connectionString = Environment.GetEnvironmentVariable("REDDAH_AZURE_STORAGE_CONNECTION_STRING");
                                BlobServiceClient blobServiceClient = new BlobServiceClient(base.GetAzureConnectionString());
                                BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                                BlobClient blobClient = containerClient.GetBlobClient(fileNameWithExt);
                                //blobClient.SetAccessTier("Cool");
                                //blobClient.SetAccessTier(Azure.Storage.Blobs.Models.AccessTier.Cool);
                                blobClient.Upload(upload.InputStream, false);



                                var url = "https://reddah.blob.core.windows.net/" + containerName + "/" + fileNameWithExt;


                                UploadFile file = new UploadFile();
                                file.Guid = guid;
                                file.Format = fileFormat;
                                file.UserName = jwtResult.JwtUser.User;
                                file.CreatedOn = DateTime.UtcNow;
                                file.GroupName = isPorn?"porn":"";
                                file.Tag = "";
                                db.UploadFile.Add(file);
                                if (upload.FileName.Contains("_reddah_preview."))
                                {
                                    if (!imageUrls.Values.Contains(url))
                                    {
                                        imageUrls.Add(guid.Replace("_reddah_preview", ""), url);
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                return Ok(new ApiResult(1, ex.Message));
                            }
                        }

                        //deal with photo order
                        List<string> articleContentList = new List<string>();
                        foreach (string key in order)
                        {
                            if (dict.ContainsKey(key))
                            {
                                string targetGuid = dict[key];
                                if (imageUrls.ContainsKey(targetGuid))
                                    articleContentList.Add(imageUrls[targetGuid]);
                            }
                        }

                        //award point for first time to add timeline
                        var gotPointBefore = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "timeline");
                        if (gotPointBefore == null)
                        {
                            var mypoint = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                            int awardPoint = 10;
                            var point = new Point()
                            {
                                CreatedOn = DateTime.UtcNow,
                                From = "Reddah",
                                To = jwtResult.JwtUser.User,
                                OldV = mypoint.Point,
                                V = awardPoint,
                                NewV = mypoint.Point + awardPoint,
                                Reason = "timeline"
                            };
                            db.Point.Add(point);
                            mypoint.Point = mypoint.Point + awardPoint;
                        }

                        //add timeline article
                        var newArticle = new Article()
                        {
                            Title = HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(thoughts.Replace("\n", "<br>")))),
                            Content = shareImageUrl != null ? shareImageUrl : string.Join("$$$", articleContentList),
                            CreatedOn = DateTime.UtcNow,
                            Count = 0,
                            GroupName = "",
                            Location = location,
                            UserName = jwtResult.JwtUser.User,
                            Type = type,
                            Ref = refArticleId,
                            Abstract = refArticleId > 0 ? shareTitle : feedbackType.ToString(),
                            LastUpdateType = userType,
                            Status = isPorn?-2:0
                            //when type=9, insert feedbacktype else if share article insert title else insert empty
                            //when type==11, add a story

                        };
                        if (myaction == "story")
                        {
                            newArticle.Lat = Decimal.Parse(lat);
                            newArticle.Lng = Decimal.Parse(lng);
                        }
                        if (myaction == "topic")
                        {
                            //mini username
                            newArticle.Abstract = shareTitle;
                        }
                        db.Article.Add(newArticle);

                        if (!string.IsNullOrWhiteSpace(atUsers))
                        {
                            foreach (var atUserName in atUsers.Split(','))
                            {
                                var msg = new Message()
                                {
                                    From = jwtResult.JwtUser.User,
                                    To = atUserName,
                                    Msg = "at",
                                    ArticleId = newArticle.Id,
                                    AritclePhoto = null,
                                    Type = 1,
                                    CreatedOn = DateTime.UtcNow,
                                    Status = 0
                                };
                                db.Message.Add(msg);
                            }
                        }

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "New Timeline Added"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }
        }

        [Route("addtimeline")]
        [HttpPost]
        public IHttpActionResult AddTimeline()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string myaction = HttpContext.Current.Request["action"];
                string lat = HttpContext.Current.Request["lat"];
                string lng = HttpContext.Current.Request["lng"];
                string thoughts = HttpContext.Current.Request["thoughts"];
                string location = HttpContext.Current.Request["location"];
                string shareTitle = HttpContext.Current.Request["abstract"];
                string shareImageUrl = HttpContext.Current.Request["content"];
                //this is actually fileurl array
                string rorder = HttpContext.Current.Request["order"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                int feedbackType = js.Deserialize<int>(HttpContext.Current.Request["feedbackType"]);
                int type = js.Deserialize<int>(HttpContext.Current.Request["type"]);
                int refArticleId = js.Deserialize<int>(HttpContext.Current.Request["ref"]);
                //4:article 5:mini
                int userType = 0;
                if(HttpContext.Current.Request["utype"]!=null)
                    userType = js.Deserialize<int>(HttpContext.Current.Request["utype"]);
                

                Dictionary<string, string> imageUrls = new Dictionary<string, string>();

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                if (String.IsNullOrWhiteSpace(thoughts) && hfc.Count == 0 && shareTitle==null)
                    return Ok(new ApiResult(1, "No thoughts and photos"));

                if (hfc.Count == 0 && type==5)
                    return Ok(new ApiResult(1010, "No materials uploaded"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    string[] order = rorder.Split(',');
                    
                    using (var db = new reddahEntities())
                    {
                        Dictionary<string, string> dict = new Dictionary<string, string>();
                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string uploadedImagePath = "/uploadPhoto/";
                            string uploadImageServerPath = "~" + uploadedImagePath;

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];
                            var fileNameKey = rfilename.Replace("_reddah_preview", "");
                            if (!dict.Keys.Contains(fileNameKey))
                            {
                                dict.Add(fileNameKey, guid);
                            }
                            else
                            {
                                guid = dict[fileNameKey];
                            }
                            if (upload.FileName.Contains("_reddah_preview"))
                            {
                                guid += "_reddah_preview";
                            }

                            try
                            {
                                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                                var fileName = Path.GetFileName(guid + "." + fileFormat);
                                var filePhysicalPath = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileName);
                                if (!Directory.Exists(HostingEnvironment.MapPath(uploadImageServerPath)))
                                {
                                    Directory.CreateDirectory(HostingEnvironment.MapPath(uploadImageServerPath));
                                }
                                upload.SaveAs(filePhysicalPath);
                                var url = uploadedImagePath + fileName;


                                UploadFile file = new UploadFile();
                                file.Guid = guid;
                                file.Format = fileFormat;
                                file.UserName = jwtResult.JwtUser.User;
                                file.CreatedOn = DateTime.UtcNow;
                                file.GroupName = "";
                                file.Tag = "";
                                db.UploadFile.Add(file);
                                if (upload.FileName.Contains("_reddah_preview."))
                                {
                                    if (!imageUrls.Values.Contains("///login.reddah.com" + url))
                                    {
                                        imageUrls.Add(guid.Replace("_reddah_preview", ""), "///login.reddah.com" + url);
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                return Ok(new ApiResult(1, ex.Message));
                            }
                        }
                        
                        //deal with photo order
                        List<string> articleContentList = new List<string>();
                        foreach(string key in order)
                        {
                            if (dict.ContainsKey(key))
                            {
                                string targetGuid = dict[key];
                                if(imageUrls.ContainsKey(targetGuid))
                                    articleContentList.Add(imageUrls[targetGuid]);
                            }
                        }

                        //award point for first time to add timeline
                        var gotPointBefore = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "timeline");
                        if (gotPointBefore == null)
                        {
                            var mypoint = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                            int awardPoint = 10;
                            var point = new Point()
                            {
                                CreatedOn = DateTime.UtcNow,
                                From = "Reddah",
                                To = jwtResult.JwtUser.User,
                                OldV = mypoint.Point,
                                V = awardPoint,
                                NewV = mypoint.Point + awardPoint,
                                Reason = "timeline"
                            };
                            db.Point.Add(point);
                            mypoint.Point = mypoint.Point + awardPoint;
                        }

                        //add timeline article
                        var newArticle = new Article()
                        {
                            Title = HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(thoughts.Replace("\n", "<br>")))),
                            Content = shareImageUrl != null ? shareImageUrl : string.Join("$$$", articleContentList),
                            CreatedOn = DateTime.UtcNow,
                            Count = 0,
                            GroupName = "",
                            Location = location,
                            UserName = jwtResult.JwtUser.User,
                            Type = type,
                            Ref = refArticleId,
                            Abstract = refArticleId > 0 ? shareTitle : feedbackType.ToString(),
                            LastUpdateType = userType
                            //when type=9, insert feedbacktype else if share article insert title else insert empty
                            //when type==11, add a story

                        };
                        if (myaction == "story")
                        {
                            newArticle.Lat = Decimal.Parse(lat);
                            newArticle.Lng = Decimal.Parse(lng);
                        }
                        if (myaction == "topic")
                        {
                            //mini username
                            newArticle.Abstract = shareTitle;
                        }
                        db.Article.Add(newArticle);

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }
                

                return Ok(new ApiResult(0, "New Timeline Added"));

            }
            catch(Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }
        }

        [Route("getmytimeline")]
        [HttpPost]
        public IHttpActionResult GetMyTimeline()
        {
            IEnumerable<Article> query = null;
            
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                //string thoughts = HttpContext.Current.Request["thoughts"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;
                    
                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;
                    
                    query = (from b in db.Article
                             join u in db.UserProfile on b.UserName equals u.UserName
                             where b.Type == 1 && b.Status!=-1 && (b.UserName == jwtResult.JwtUser.User || 
                             (from f in db.UserFriend where f.UserName == jwtResult.JwtUser.User && f.Approve==1 select f.Watch).ToList().Contains(b.UserName)) 
                             && !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedTimeline
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
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex
                             })
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getmytopic")]
        [HttpPost]
        public IHttpActionResult GetMyTopic()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                string topicUserName = HttpContext.Current.Request["abstract"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from b in db.Article
                             join u in db.UserProfile on b.UserName equals u.UserName
                             where b.Type == 6 && b.Status != -1 && b.Abstract == topicUserName
                             && !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedTimeline
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
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex
                             })
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getusertopic")]
        [HttpPost]
        public IHttpActionResult GetUserTopic()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                string targetUserName = HttpContext.Current.Request["abstract"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from b in db.Article
                             join u in db.UserProfile on b.UserName equals u.UserName
                             where b.Type == 6 && b.Status != -1 && b.UserName == targetUserName
                             && !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedTimeline
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
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex
                             })
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getusercomments")]
        [HttpPost]
        public IHttpActionResult GetUserComments()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                string targetUserName = HttpContext.Current.Request["abstract"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from c in db.Comment
                             join a in db.Article on c.ArticleId equals a.Id
                             where c.UserName == targetUserName && c.Status == 0 && (a.Type==0 || a.Type==6)
                             && !(loaded).Contains(c.Id)
                             orderby c.Id descending
                             select new CommentArticle
                             {
                                 Id = a.Id,
                                 Title = a.Title,
                                 Content = a.Content,
                                 Abstract = a.Abstract,
                                 CreatedOn = a.CreatedOn,
                                 Up = a.Up,
                                 Down = a.Down,
                                 Count = a.Count,
                                 UserName = a.UserName,
                                 GroupName = a.GroupName,
                                 Locale = a.Locale,
                                 LastUpdateOn = a.LastUpdateOn,
                                 Type = a.Type,
                                 Ref = a.Ref,
                                 Location = a.Location,
                                 CommentId = c.Id,
                                 ParentId = c.ParentId,
                                 CommentContent = c.Content,
                                 CommentCreatedOn = c.CreatedOn,
                                 CommentUp = c.Up,
                                 CommentDown = c.Down,
                                 CommentCount = c.Count,
                                 CommentStatus = c.Status,
                                 CommentType = c.Type,
                                 CommentUid = c.Uid,
                             })
                             .Take(pageCount);

                    var queryList = query.ToList();
                    var returnList = new List<AdvancedCommentArticle>();
                    foreach (CommentArticle item in queryList)
                    {
                        var returnItem = new AdvancedCommentArticle(item);
                        returnItem.ImageUrl = Helpers.GetFirstImageSrc(item.Content);
                        returnItem.ImageUrls = Helpers.GetFirstImageSrc(item.Content, 3);
                        returnItem.VideoUrl = Helpers.GetVideoSrc(item.Content);
                        returnItem.VideoPoster = Helpers.GetVideoPoster(item.Content);
                        returnList.Add(returnItem);

                    }
                    return Ok(returnList);

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getfindtopic")]
        [HttpPost]
        public IHttpActionResult GetFindTopic()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                string targetUserName = HttpContext.Current.Request["abstract"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from b in db.Article
                             join u in db.UserProfile on b.UserName equals u.UserName
                             where b.Type == 6 && b.Status != -1 
                             && !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedTimeline
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
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex,
                                 LastUpdateBy = b.LastUpdateBy,
                                 LastUpdateContent = b.LastUpdateContent,
                             })
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getsearchtopic")]
        [HttpPost]
        public IHttpActionResult GetSearchTopic()
        {
            IEnumerable<string> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                string key = HttpContext.Current.Request["key"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    query = (from g in db.Group
                             where g.Name.Contains(key)
                             orderby g.Name
                             select g.Name)
                            .Take(20);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("gettimeline")]
        [HttpPost]
        public IHttpActionResult GetTimeline()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                //string thoughts = HttpContext.Current.Request["thoughts"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from b in db.Article
                             where b.Type == 1 && b.UserName == targetUser && b.Status!=-1 &&
                                     !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select b)
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        /// <summary>
        /// timeline like, not article like
        /// </summary>
        /// <returns></returns>
        [Route("like")]
        [HttpPost]
        public IHttpActionResult Like()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                
                string action = HttpContext.Current.Request["action"];
                int id = int.Parse(HttpContext.Current.Request["id"]);
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));
                
                using (var db = new reddahEntities())
                {

                    var article = db.Article.FirstOrDefault(a => a.Id == id);
                    if(article != null)
                    {
                        if (action.Equals("add"))
                        {
                            if (!article.GroupName.Split(',').ToList().Contains(jwtResult.JwtUser.User))
                            {
                                if(string.IsNullOrWhiteSpace(article.GroupName))
                                    article.GroupName += jwtResult.JwtUser.User;
                                else 
                                    article.GroupName += "," + jwtResult.JwtUser.User;

                                var msg = new Message()
                                {
                                    From = jwtResult.JwtUser.User,
                                    To = article.UserName,
                                    Msg = "like",
                                    ArticleId = article.Id,
                                    AritclePhoto = article.Content.Length>0?article.Content.Split(new[] { "$$$" }, StringSplitOptions.None)[0]:null,
                                    Type = 0,
                                    CreatedOn = DateTime.UtcNow,
                                    Status = 0
                                };
                                db.Message.Add(msg);
                            }
                            else
                                return Ok(new ApiResult(1, "already add like"));
                        }

                        if (action.Equals("remove"))
                        {
                            if (article.GroupName.Split(',').ToList().Contains(jwtResult.JwtUser.User))
                            {
                                var list = article.GroupName.Split(',').ToList();
                                list.Remove(jwtResult.JwtUser.User);
                                article.GroupName = string.Join(",", list);
                            }
                            else
                                return Ok(new ApiResult(2, "already remove like"));
                        }

                        db.SaveChanges();
                    }
                    else
                        return Ok(new ApiResult(3, "Article not found"));

                    return Ok(new ApiResult(0, "success"+ jwtResult.JwtUser.User));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getarticlebyid")]
        [HttpPost]
        public IHttpActionResult GetArticleById()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                int articleId = int.Parse(HttpContext.Current.Request["ArticleId"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {

                    var article = db.Article.FirstOrDefault(a => a.Id == articleId);
                    if (article != null)
                    {
                        var advancedArticle = new AdvancedArticle(article);
                        advancedArticle.ImageUrl = Helpers.GetFirstImageSrc(article.Content);
                        return Ok(new ApiResult(0, advancedArticle));
                    }
                    else
                    {
                        return Ok(new ApiResult(3, "Article not found"));
                    }

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getuser")]
        [HttpPost]
        public IHttpActionResult GetUser()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var user = db.UserProfile.FirstOrDefault(u => u.UserName == targetUser);
                    userInfo.UserName = user.UserName;
                    userInfo.NickName = user.NickName??user.UserName;
                    userInfo.Sex = user.Sex??0;
                    userInfo.Photo = user.Photo;
                    userInfo.Location = user.Location;
                    userInfo.Admins = user.Admins;
                    userInfo.Point = user.Point;
                    userInfo.Signature = user.Signature;
                    userInfo.Cover = user.Cover;
                    userInfo.Type = user.Type;
                    userInfo.Email = user.Email;
                    userInfo.HideLocation = (user.PrivacyShowLocation == 1);
                    userInfo.AllowTenTimeline = (user.PrivacyViewTs == 1);
                    userInfo.Lan = user.Lan;

                    if (user.Type == 0)
                    {
                        var findFriends = db.UserFriend.FirstOrDefault(f => (f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser && f.Approve == 1) ||
                        (f.UserName == targetUser && f.Watch == jwtResult.JwtUser.User && f.Approve == 1));
                        userInfo.IsFriend = findFriends != null;

                        if (userInfo.IsFriend)
                            userInfo.NoteName = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser && f.Approve == 1).NoteName;
                    }
                    else
                    {
                        var findPubFocus = db.Article.FirstOrDefault(a => a.Type == 22 &&
                        (a.GroupName.StartsWith(targetUser + ",") ||
                        a.GroupName.EndsWith("," + targetUser))
                        &&
                        (a.GroupName.StartsWith(jwtResult.JwtUser.User + ",") ||
                        a.GroupName.EndsWith("," + jwtResult.JwtUser.User)));
                        userInfo.IsFriend = findPubFocus != null;
                    }

                    var usermem = db.webpages_Membership.FirstOrDefault(m => m.UserId == user.UserId);
                    if (usermem != null)
                    {
                        userInfo.EmailVerified = (usermem.IsConfirmed == true && usermem.ConfirmationToken!=null && usermem.ConfirmationToken.Length == 23);
                    }
                    


                    return Ok(userInfo);

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("searchuser")]
        [HttpPost]
        public IHttpActionResult SearchUser()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //userset status 0: can be searched by username
                    //sys status 0: normal user, others: forbidden user
                    var user = db.UserProfile.FirstOrDefault(u=>u.UserName == targetUser && u.SystemStatus==0 && u.UserSetStatus==0);
                    if (user != null)
                    {
                        return Ok(new ApiResult(0, "success"));
                    }
                    else
                    {
                        return Ok(new ApiResult(404, "user not found"));
                    }
                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changeprivacy")]
        [HttpPost]
        public IHttpActionResult ChangePrivacy()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetType = HttpContext.Current.Request["targetType"];
                string targetValue = HttpContext.Current.Request["targetValue"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                    if(targetType=="location")
                    {
                        target.PrivacyShowLocation = (targetValue == "True" ? 1 : 0);
                        db.SaveChanges();
                    }
                    if (targetType == "timeline")
                    {
                        target.PrivacyViewTs = (targetValue == "True" ? 1 : 0);
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changenotename")]
        [HttpPost]
        public IHttpActionResult ChangeNoteName()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                string targetNoteName = HttpContext.Current.Request["targetNoteName"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.UserFriend.FirstOrDefault(uf => uf.UserName == jwtResult.JwtUser.User && uf.Watch == targetUser&& uf.Approve==1);
                    target.NoteName = targetNoteName;
                    db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changelocation")]
        [HttpPost]
        public IHttpActionResult ChangeLocation()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string location = HttpContext.Current.Request["location"];
                string tag = HttpContext.Current.Request["tag"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                decimal lat = js.Deserialize<decimal>(HttpContext.Current.Request["lat"]);
                decimal lng = js.Deserialize<decimal>(HttpContext.Current.Request["lng"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    if (!string.IsNullOrWhiteSpace(location))
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);

                        if (target != null)
                        {
                            target.Location = location;
                            target.Lat = lat;
                            target.Lng = lng;
                            if (tag == "shake")
                            {
                                //award point for first time to use shake
                                var gotPointBefore = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "shake");
                                if (gotPointBefore == null)
                                {
                                    int awardPoint = 10;
                                    var point = new Point()
                                    {
                                        CreatedOn = DateTime.UtcNow,
                                        From = "Reddah",
                                        To = jwtResult.JwtUser.User,
                                        OldV = target.Point,
                                        V = awardPoint,
                                        NewV = target.Point + awardPoint,
                                        Reason = "shake"
                                    };
                                    db.Point.Add(point);
                                    target.Point = target.Point + awardPoint;
                                }
                                target.LastShakeOn = DateTime.UtcNow;
                            }
                               
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(2, "user not exist:" + jwtResult.JwtUser.User));
                        }
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getusersbylocation")]
        [HttpPost]
        public IHttpActionResult GetUsersByLocation()
        {
            IEnumerable<UserProfile> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                
                JavaScriptSerializer js = new JavaScriptSerializer();
                int type = js.Deserialize<int>(HttpContext.Current.Request["type"]);
                decimal latCenter = js.Deserialize<decimal>(HttpContext.Current.Request["latCenter"]);
                decimal lngCenter = js.Deserialize<decimal>(HttpContext.Current.Request["lngCenter"]);
                decimal latLow = js.Deserialize<decimal>(HttpContext.Current.Request["latLow"]);
                decimal latHigh = js.Deserialize<decimal>(HttpContext.Current.Request["latHigh"]);
                decimal lngLow = js.Deserialize<decimal>(HttpContext.Current.Request["lngLow"]);
                decimal lngHigh = js.Deserialize<decimal>(HttpContext.Current.Request["lngHigh"]);
                
                int min = js.Deserialize<int>(HttpContext.Current.Request["min"]);


                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 100;

                    if (min == 0)
                    {
                        query = (from u in db.UserProfile
                                 where (type==-1 || u.Sex == type)
                                    && u.SystemStatus == 0 && u.PrivacyShowLocation==0 && u.Lat != null && u.Lng != null && u.UserName != jwtResult.JwtUser.User &&
                                    u.Lat < latHigh && u.Lat > latLow &&
                                    u.Lng < lngHigh && u.Lng > lngLow 
                                 select new AdvancedUserProfile
                                 {
                                     UserName = u.UserName,
                                     Email = u.Email,
                                     Sex = u.Sex,
                                     Signature = u.Signature,
                                     Photo = u.Photo,
                                     NickName = u.NickName,
                                     Cover = u.Cover,
                                     Location = u.Location,
                                     Lat = u.Lat,
                                     Lng = u.Lng,
                                     Distance = (u.Lat - latCenter) > 0 ? (u.Lat - latCenter) : (u.Lat - latCenter) * -1 +
                                        (u.Lng - lngCenter) > 0 ? (u.Lng - lngCenter) : (u.Lng - lngCenter) * -1,
                                 })
                            .Take(pageCount).OrderBy(n => n.Distance);
                    }
                    else
                    {
                        //var limit = DateTime.UtcNow.AddMinutes(-min); use days as users is not many
                        var limit = DateTime.UtcNow.AddMonths(-min);

                        query = (from u in db.UserProfile
                                 where (type == -1 || u.Sex == type) 
                                    && u.SystemStatus == 0 && u.PrivacyShowLocation == 0 && u.Lat != null && u.Lng != null && u.UserName != jwtResult.JwtUser.User &&
                                    u.LastShakeOn >= limit &&
                                    u.Lat < latHigh && u.Lat > latLow &&
                                    u.Lng < lngHigh && u.Lng > lngLow 
                                 select new AdvancedUserProfile
                                 {
                                     UserName = u.UserName,
                                     Email = u.Email,
                                     Sex = u.Sex,
                                     Signature = u.Signature,
                                     Photo = u.Photo,
                                     NickName = u.NickName,
                                     Cover = u.Cover,
                                     Location = u.Location,
                                     Lat = u.Lat,
                                     Lng = u.Lng,
                                     Distance = (u.Lat - latCenter) > 0 ? (u.Lat - latCenter) : (u.Lat - latCenter) * -1 +
                                        (u.Lng - lngCenter) > 0 ? (u.Lng - lngCenter) : (u.Lng - lngCenter) * -1,
                                 })
                            .Take(pageCount).OrderBy(n => n.Distance);
                    }
                    

                    return Ok(new ApiResult(0, query.ToList()));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getstorybylocation")]
        [HttpPost]
        public IHttpActionResult GetStoryByLocation()
        {
            IEnumerable<AdvancedStory> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int type = js.Deserialize<int>(HttpContext.Current.Request["type"]);
                decimal latCenter = js.Deserialize<decimal>(HttpContext.Current.Request["latCenter"]);
                decimal lngCenter = js.Deserialize<decimal>(HttpContext.Current.Request["lngCenter"]);
                decimal latLow = js.Deserialize<decimal>(HttpContext.Current.Request["latLow"]);
                decimal latHigh = js.Deserialize<decimal>(HttpContext.Current.Request["latHigh"]);
                decimal lngLow = js.Deserialize<decimal>(HttpContext.Current.Request["lngLow"]);
                decimal lngHigh = js.Deserialize<decimal>(HttpContext.Current.Request["lngHigh"]);

                int min = js.Deserialize<int>(HttpContext.Current.Request["min"]);


                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 100;
                    //return Ok(new ApiResult(2, min));
                    if (min == 0)
                    {
                        query = (from u in db.Article
                                 where u.Type == 11 &&//story
                                    u.Status == 0 && u.UserName != jwtResult.JwtUser.User &&
                                    u.Lat < latHigh && u.Lat > latLow &&
                                    u.Lng < lngHigh && u.Lng > lngLow 
                                 select new AdvancedStory
                                 {
                                     Id = u.Id,
                                     Title = u.Title,
                                     Content = u.Content,
                                     Abstract = u.Abstract,
                                     CreatedOn = u.CreatedOn,
                                     Up = u.Up,
                                     Down = u.Down,
                                     Count = u.Count,
                                     UserName = u.UserName,
                                     GroupName = u.GroupName,
                                     Locale = u.Locale,
                                     LastUpdateOn = u.LastUpdateOn,
                                     Type = u.Type,
                                     Ref = u.Ref,
                                     Location = u.Location,
                                     Lat = u.Lat,
                                     Lng = u.Lng,
                                     Distance = (u.Lat - latCenter) > 0 ? (u.Lat - latCenter) : (u.Lat - latCenter) * -1 +
                                        (u.Lng - lngCenter) > 0 ? (u.Lng - lngCenter) : (u.Lng - lngCenter) * -1,
                                 })
                            .Take(pageCount).OrderBy(n => n.Distance);
                    }
                    else
                    {
                        //var limit = DateTime.UtcNow.AddMinutes(-min); use days as users is not many
                        var limit = DateTime.UtcNow.AddMonths(-min);

                        query = (from u in db.Article
                                 where u.Type == 11
                                    && u.Status == 0 && u.UserName != jwtResult.JwtUser.User &&
                                    u.CreatedOn >= limit &&
                                    u.Lat < latHigh && u.Lat > latLow &&
                                    u.Lng < lngHigh && u.Lng > lngLow 
                                 select new AdvancedStory
                                 {
                                     Id = u.Id,
                                     Title = u.Title,
                                     Content = u.Content,
                                     Abstract = u.Abstract,
                                     CreatedOn = u.CreatedOn,
                                     Up = u.Up,
                                     Down = u.Down,
                                     Count = u.Count,
                                     UserName = u.UserName,
                                     GroupName = u.GroupName,
                                     Locale = u.Locale,
                                     LastUpdateOn = u.LastUpdateOn,
                                     Type = u.Type,
                                     Ref = u.Ref,
                                     Location = u.Location,
                                     Lat = u.Lat,
                                     Lng = u.Lng,
                                     Distance = (u.Lat - latCenter) > 0 ? (u.Lat - latCenter) : (u.Lat - latCenter) * -1 +
                                        (u.Lng - lngCenter) > 0 ? (u.Lng - lngCenter) : (u.Lng - lngCenter) * -1,
                                 })
                            .Take(pageCount).OrderBy(n => n.Distance);
                    }


                    return Ok(new ApiResult(0, query.ToList()));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changesignature")]
        [HttpPost]
        public IHttpActionResult ChangeSignature()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetSignature = HttpContext.Current.Request["targetSignature"];
                string targetUserName = HttpContext.Current.Request["targetUserName"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    if (!string.IsNullOrWhiteSpace(targetUserName))
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == targetUserName && u.Type != 0
                            && (u.CreatedBy == jwtResult.JwtUser.User ||
                                (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                        u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                        u.Admins.EndsWith("," + jwtResult.JwtUser.User))
                         ));

                        if (target != null)
                        {
                            target.Signature = targetSignature;
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(2, "Can't perform this action:target:" + targetUserName + "current:" + jwtResult.JwtUser.User));
                        }
                    }
                    else
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                        //award point for first time to add signature
                        var gotPointBefore = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "signature");
                        if (gotPointBefore == null)
                        {
                            int awardPoint = 10;
                            var point = new Point()
                            {
                                CreatedOn = DateTime.UtcNow,
                                From = "Reddah",
                                To = jwtResult.JwtUser.User,
                                OldV = target.Point,
                                V = awardPoint,
                                NewV = target.Point + awardPoint,
                                Reason = "signature"
                            };
                            db.Point.Add(point);
                            target.Point = target.Point + awardPoint;
                        }
                        target.Signature = targetSignature;
                        db.SaveChanges();
                    }
                    

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changenickname")]
        [HttpPost]
        public IHttpActionResult ChangeNickName()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetNickName = HttpContext.Current.Request["targetNickName"];
                string targetUserName = HttpContext.Current.Request["targetUserName"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    if (!string.IsNullOrWhiteSpace(targetUserName))
                    {
                        var nickNameExist = db.UserProfile.FirstOrDefault(u => 
                            (u.NickName == targetNickName || u.NickName.Contains(targetNickName)) 
                            && u.Type==1);
                        if (nickNameExist != null)
                            return Ok(new ApiResult(3, "nickname exist"));

                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == targetUserName && u.Type != 0
                            && (u.CreatedBy == jwtResult.JwtUser.User ||
                                (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                        u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                        u.Admins.EndsWith("," + jwtResult.JwtUser.User))
                         ));

                        if (target != null)
                        {
                            target.NickName = targetNickName;
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(2, "Can't perform this action:target:"+targetNickName+"current:"+jwtResult.JwtUser.User));
                        }

                        
                    }
                    else
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                        target.NickName = targetNickName;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changesex")]
        [HttpPost]
        public IHttpActionResult ChangeSex()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                int userSex = js.Deserialize<int>(HttpContext.Current.Request["UserSex"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {

                    var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);

                    if (target != null)
                    {
                        target.Sex = userSex;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("addfriend")]
        [HttpPost]
        public IHttpActionResult AddFriend()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                string targetNoteName = HttpContext.Current.Request["targetNoteName"];
                string message = HttpContext.Current.Request["message"];
                bool hasPermisson = HttpContext.Current.Request["permission"].Equals("Allow", StringComparison.OrdinalIgnoreCase);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var item = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser);
                    if (item == null)
                    {
                        //award point for first time to apply for friend
                        var gotPointBefore = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "friend");
                        if (gotPointBefore == null)
                        {
                            var mypoint = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                            int awardPoint = 10;
                            var point = new Point()
                            {
                                CreatedOn = DateTime.UtcNow,
                                From = "Reddah",
                                To = jwtResult.JwtUser.User,
                                OldV = mypoint.Point,
                                V = awardPoint,
                                NewV = mypoint.Point + awardPoint,
                                Reason = "friend"
                            };
                            db.Point.Add(point);
                            mypoint.Point = mypoint.Point + awardPoint;
                        }

                        var uf = new UserFriend();
                        uf.UserName = jwtResult.JwtUser.User;
                        uf.Watch = targetUser;
                        uf.Just = message;
                        uf.RequestOn = DateTime.UtcNow;
                        uf.NoteName = targetNoteName;
                        db.UserFriend.Add(uf);
                    }
                    else
                    {
                        item.Just = item.Just==null?message:item.Just+"\r\n"+message;
                        item.RequestOn = DateTime.UtcNow;
                        item.NoteName = targetNoteName;
                    }

                    db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("removefriend")]
        [HttpPost]
        public IHttpActionResult RemoveFriend()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var itemMe = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser && f.Approve==1);
                    if(itemMe!=null)
                        db.UserFriend.Remove(itemMe);
                    var itemIt = db.UserFriend.FirstOrDefault(f => f.Watch == jwtResult.JwtUser.User && f.UserName == targetUser && f.Approve == 1);
                    if (itemIt != null)
                        db.UserFriend.Remove(itemIt);

                    if(itemMe!=null&&itemIt!=null)
                        db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("friends")]
        [HttpPost]
        public IHttpActionResult GetFriends()
        {
            IEnumerable<UserFriend> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    query =  from f in db.UserFriend
                             join u in db.UserProfile on f.Watch equals u.UserName
                             where f.UserName == jwtResult.JwtUser.User && f.Approve==1
                             orderby f.RequestOn descending
                             select new AdvancedUserFriend
                             {
                                 Id = f.Id,
                                 UserName = f.UserName,
                                 Watch = f.Watch,
                                 Just = f.Just,
                                 RequestOn = f.RequestOn,
                                 Approve = f.Approve,
                                 NoteName = f.NoteName,
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex,
                                 Signature = u.Signature,
                             };

                    return Ok(query.ToList());   
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("friendrequests")]
        [HttpPost]
        public IHttpActionResult GetFriendRequests()
        {
            IEnumerable<UserFriend> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 100;

                    query = (from f in db.UserFriend
                             join u in db.UserProfile on f.UserName equals u.UserName
                             where f.Watch == jwtResult.JwtUser.User
                             orderby f.RequestOn descending
                             select new AdvancedUserFriend
                             {
                                 Id = f.Id,
                                 UserName = f.UserName,
                                 Watch = f.Watch,
                                 Just = f.Just,
                                 RequestOn = f.RequestOn,
                                 Approve = f.Approve,
                                 NoteName = f.NoteName,
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex,
                                 Signature = u.Signature,
                             })
                            .Take(pageCount);
                             
                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("approvefriend")]
        [HttpPost]
        public IHttpActionResult ApproveFriend()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string requestUserName = HttpContext.Current.Request["requestUserName"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));
                
                using (var db = new reddahEntities())
                {
                    var item = db.UserFriend.FirstOrDefault(f => f.UserName == requestUserName && f.Watch == jwtResult.JwtUser.User);
                    if (item == null)
                    {
                        return Ok(new ApiResult(3, "Request not found"));
                    }
                    else
                    {
                        item.Approve = 1;
                        
                        var verse = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == requestUserName);
                        if (verse == null)
                        {
                            var uf = new UserFriend();
                            uf.UserName = jwtResult.JwtUser.User;
                            uf.Watch = requestUserName;
                            uf.Just = "confirmed";
                            uf.RequestOn = DateTime.UtcNow;
                            uf.NoteName = requestUserName;
                            uf.Approve = 1;
                            db.UserFriend.Add(uf);
                        }
                        else
                        {
                            verse.Just = "confirmed";
                            verse.RequestOn = DateTime.UtcNow;
                            verse.NoteName = requestUserName;
                            verse.Approve = 1;
                        }
                        
                    }

                    db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("updateuserphoto")]
        [HttpPost]
        public IHttpActionResult UpdateUserPhoto()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string tag = HttpContext.Current.Request["tag"];//cover|portrait
                string targetUserName = HttpContext.Current.Request["targetUserName"];

                List<string> imageUrls = new List<string>();

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                if (String.IsNullOrWhiteSpace(tag))
                    return Ok(new ApiResult(1, "No tag"));

                if (hfc.Count == 0)
                    return Ok(new ApiResult(1, "No photo"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        var fileName = "";

                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string uploadedImagePath = "/uploadPhoto/";
                            string uploadImageServerPath = "~" + uploadedImagePath;

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];

                            try
                            {
                                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                                fileName = Path.GetFileName(guid + "." + fileFormat);
                                var filePhysicalPath = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileName);
                                if (!Directory.Exists(HostingEnvironment.MapPath(uploadImageServerPath)))
                                {
                                    Directory.CreateDirectory(HostingEnvironment.MapPath(uploadImageServerPath));
                                }
                                upload.SaveAs(filePhysicalPath);
                                var fileNameUserName = Path.GetFileName(jwtResult.JwtUser.User + "." + fileFormat);
                                var filePhysicalPathUserName = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileNameUserName);
                                upload.SaveAs(filePhysicalPathUserName);
                                var url = uploadedImagePath + fileName;


                                UploadFile file = new UploadFile();
                                file.Guid = guid;
                                file.Format = fileFormat;
                                file.UserName = jwtResult.JwtUser.User;
                                file.CreatedOn = DateTime.UtcNow;
                                file.GroupName = "";
                                file.Tag = tag;
                                db.UploadFile.Add(file);
                                imageUrls.Add("https://login.reddah.com" + url);
                            }
                            catch (Exception ex)
                            {

                            }
                        }

                        if (!string.IsNullOrWhiteSpace(targetUserName))
                        {
                            var target = db.UserProfile.FirstOrDefault(u => u.UserName == targetUserName && u.Type != 0
                                && (u.CreatedBy == jwtResult.JwtUser.User ||
                                    (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                            u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                            u.Admins.EndsWith("," + jwtResult.JwtUser.User))
                             ));

                            if (target != null)
                            {
                                if (tag.Equals("cover", StringComparison.InvariantCultureIgnoreCase))
                                {
                                    target.Cover = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                                }
                                else
                                {
                                    //portrait
                                    target.Photo = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                                }
                                db.SaveChanges();
                            }
                            else
                            {
                                return Ok(new ApiResult(2, "Can't perform this action:target:" + targetUserName + "current:" + jwtResult.JwtUser.User));
                            }
                        }
                        else
                        {
                            var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                            if (tag.Equals("cover", StringComparison.InvariantCultureIgnoreCase))
                            {
                                target.Cover = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                            }
                            else
                            {
                                //award point for first time to upload photo 
                                var gotPointBefore = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "photo");
                                if (gotPointBefore == null)
                                {
                                    int awardPoint = 10;
                                    var point = new Point()
                                    {
                                        CreatedOn = DateTime.UtcNow,
                                        From = "Reddah",
                                        To = jwtResult.JwtUser.User,
                                        OldV = target.Point,
                                        V = awardPoint,
                                        NewV = target.Point + awardPoint,
                                        Reason = "photo"
                                    };
                                    db.Point.Add(point);
                                    target.Point = target.Point + awardPoint;
                                }
                                //portrait
                                target.Photo = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                            }

                            db.SaveChanges();
                        }
            
                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "User "+tag+" photo updated"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }



        }

        [Route("updateuserphotoazure")]
        [HttpPost]
        public IHttpActionResult UpdateUserPhotoAzure()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string tag = HttpContext.Current.Request["tag"];//cover|portrait
                string targetUserName = HttpContext.Current.Request["targetUserName"];

                List<string> imageUrls = new List<string>();

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                if (String.IsNullOrWhiteSpace(tag))
                    return Ok(new ApiResult(1, "No tag"));

                if (hfc.Count == 0)
                    return Ok(new ApiResult(1, "No photo"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        var fileName = "";

                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string containerName = "photo";

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];

                            try
                            {
                                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                                var fileNameWithExt = Path.GetFileName(guid + "." + fileFormat);

                                //string connectionString = Environment.GetEnvironmentVariable("REDDAH_AZURE_STORAGE_CONNECTION_STRING");
                                BlobServiceClient blobServiceClient = new BlobServiceClient(base.GetAzureConnectionString());
                                BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                                BlobClient blobClient = containerClient.GetBlobClient(fileNameWithExt);
                                //blobClient.SetAccessTier(Azure.Storage.Blobs.Models.AccessTier.Cool);
                                blobClient.Upload(upload.InputStream, false);
                                fileName = "https://reddah.blob.core.windows.net/" + containerName + "/" + fileNameWithExt;


                                UploadFile file = new UploadFile();
                                file.Guid = guid;
                                file.Format = fileFormat;
                                file.UserName = jwtResult.JwtUser.User;
                                file.CreatedOn = DateTime.UtcNow;
                                file.GroupName = "";
                                file.Tag = tag;
                                db.UploadFile.Add(file);
                                imageUrls.Add(fileName);
                            }
                            catch (Exception ex)
                            {

                            }
                        }

                        if (!string.IsNullOrWhiteSpace(targetUserName))
                        {
                            var target = db.UserProfile.FirstOrDefault(u => u.UserName == targetUserName && u.Type != 0
                                && (u.CreatedBy == jwtResult.JwtUser.User ||
                                    (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                            u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                            u.Admins.EndsWith("," + jwtResult.JwtUser.User))
                             ));

                            if (target != null)
                            {
                                if (tag.Equals("cover", StringComparison.InvariantCultureIgnoreCase))
                                {
                                    target.Cover = fileName;
                                }
                                else
                                {
                                    //portrait
                                    target.Photo = fileName;
                                }
                                db.SaveChanges();
                            }
                            else
                            {
                                return Ok(new ApiResult(2, "Can't perform this action:target:" + targetUserName + "current:" + jwtResult.JwtUser.User));
                            }
                        }
                        else
                        {
                            var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                            if (tag.Equals("cover", StringComparison.InvariantCultureIgnoreCase))
                            {
                                target.Cover = fileName;
                            }
                            else
                            {
                                //award point for first time to upload photo 
                                var gotPointBefore = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "photo");
                                if (gotPointBefore == null)
                                {
                                    int awardPoint = 10;
                                    var point = new Point()
                                    {
                                        CreatedOn = DateTime.UtcNow,
                                        From = "Reddah",
                                        To = jwtResult.JwtUser.User,
                                        OldV = target.Point,
                                        V = awardPoint,
                                        NewV = target.Point + awardPoint,
                                        Reason = "photo"
                                    };
                                    db.Point.Add(point);
                                    target.Point = target.Point + awardPoint;
                                }
                                //portrait
                                target.Photo = fileName;
                            }

                            db.SaveChanges();
                        }

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "User " + tag + " photo updated"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }
        }

        [Route("commentlike")]
        [HttpPost]
        public IHttpActionResult CommentLike()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);
                bool type = js.Deserialize<bool>(HttpContext.Current.Request["type"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Comment.FirstOrDefault(c => c.Id==id);

                    if (target != null)
                    {
                        if (target.Up == null)
                            target.Up = 0;
                        target.Up += (type ? 1 : -1);
                        if (target.Up < 0)
                            target.Up = 0;

                        var msg = new Message()
                        {
                            From = jwtResult.JwtUser.User,
                            To = target.UserName,
                            Msg = "like",
                            ArticleId = target.ArticleId,
                            AritclePhoto = null,
                            Type = 3,
                            CreatedOn = DateTime.UtcNow,
                            Status = 0
                        };
                        db.Message.Add(msg);

                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("articlelike")]
        [HttpPost]
        public IHttpActionResult ArticleLike()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);
                bool type = js.Deserialize<bool>(HttpContext.Current.Request["type"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Article.FirstOrDefault(c => c.Id == id);

                    if (target != null)
                    {
                        if (target.Up == null)
                            target.Up = 0;
                        target.Up += (type ? 1 : -1);
                        if (target.Up < 0)
                            target.Up = 0;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("articleforward")]
        [HttpPost]
        public IHttpActionResult ArticleForward()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);
                bool type = js.Deserialize<bool>(HttpContext.Current.Request["type"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Article.FirstOrDefault(c => c.Id == id);

                    if (target != null)
                    {
                        if (target.Down == null)
                            target.Down = 0;
                        target.Down += (type ? 1 : -1);
                        if (target.Down < 0)
                            target.Down = 0;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        /// <summary>
        /// --default 0 as article, 1 as an image link, 2 as an video
        /// --bookmark an image link in content
        /// </summary>
        /// <returns></returns>
        [Route("bookmark")]
        [HttpPost]
        public IHttpActionResult Bookmark()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                
                JavaScriptSerializer js = new JavaScriptSerializer();
                int articleId = js.Deserialize<int>(HttpContext.Current.Request["ArticleId"]);

                string content = HttpContext.Current.Request["Content"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = articleId>0? db.UserArticle.FirstOrDefault(ua => ua.ArticleId==articleId && ua.Type==0)
                        : db.UserArticle.FirstOrDefault(ua => ua.Content==content && ua.Type==1);
                    if(target==null)
                    {
                        db.UserArticle.Add(new UserArticle {
                            UserName = jwtResult.JwtUser.User,
                            ArticleId = articleId,
                            Content =content==null?string.Empty:content,
                            Type = articleId>0?0:1,
                            CreatedOn =DateTime.UtcNow
                        });
                        if (articleId > 0)
                        {
                            var article = db.Article.FirstOrDefault(a => a.Id == articleId);
                            if (article != null)
                            {
                                if (article.Down != null)
                                    article.Down += 1;
                                else
                                    article.Down = 1;
                            }
                        }
                            
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch(DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("deletearticle")]
        [HttpPost]
        public IHttpActionResult DeleteArticle()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Article.FirstOrDefault(a => a.Id == id);

                    if (target != null)
                    {
                        bool canDelete = false;

                        if (target.Type == 0)//pub article
                        {
                            var pub = db.UserProfile.FirstOrDefault(u => u.UserName == target.UserName);
                            if (pub.Admins.Split(',').Contains(jwtResult.JwtUser.User))
                            {
                                canDelete = true;
                                //log...
                            }
                        }
                        if(target.Type==1)//mytimeline
                        {
                            if (target.UserName == jwtResult.JwtUser.User)
                            {
                                canDelete = true;
                            }
                        }

                        var user = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                        var query = (from ur in db.webpages_UsersInRoles
                                         join pr in db.webpages_PrivilegesInRoles on ur.RoleId equals pr.RoleId
                                         where ur.UserId == user.UserId && pr.PrivilegeId ==2 //2:delete post permission
                                     select pr.PrivilegeId);
                        if (query.ToList().Count>0) 
                        {
                            canDelete = true;
                            //log...
                        }


                        if(canDelete)
                        {
                            target.Status = -1;
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(1011, "No permission"));
                        }
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("deletecomment")]
        [HttpPost]
        public IHttpActionResult DeleteComment()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var comment = db.Comment.FirstOrDefault(c => c.Id == id);
                    var article = db.Article.FirstOrDefault(a => a.Id == comment.ArticleId);

                    if (comment != null&& article!=null)
                    {
                        var pub = db.UserProfile.FirstOrDefault(u => u.UserName == article.UserName);
                        bool canDelete = false;
                        if (pub.Admins.Split(',').Contains(jwtResult.JwtUser.User))
                        {
                            canDelete = true;
                            //log...
                        }

                        if (comment.UserName == jwtResult.JwtUser.User)
                        {
                            canDelete = true;
                            //log ...
                        }

                        var user = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);

                        var query = (from ur in db.webpages_UsersInRoles
                                     join pr in db.webpages_PrivilegesInRoles on ur.RoleId equals pr.RoleId
                                     where ur.UserId == user.UserId && pr.PrivilegeId== 3 //3:delete comment permission
                                     select pr.PrivilegeId);
                        if (query.ToList().Count>0) 
                        {
                            canDelete = true;
                            //log...
                        }


                        if(canDelete)
                        {
                            comment.Status = -1;
                            article.Count--;
                            if(comment.ParentId != -1)
                            {
                                var parentComment = db.Comment.FirstOrDefault(c => c.Id == comment.ParentId);
                                if (parentComment != null)
                                {
                                    parentComment.Count--;
                                }
                            }
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(1012, "No permission"));
                        }
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("deletebookmark")]
        [HttpPost]
        public IHttpActionResult DeleteBookmark()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.UserArticle.FirstOrDefault(ua => ua.Id == id);
                        
                    if (target != null)
                    {
                        db.UserArticle.Remove(target);
                        if (target.ArticleId > 0)
                        {
                            var article = db.Article.FirstOrDefault(a => a.Id == target.ArticleId);
                            if (article != null)
                            {
                                if (article.Down != null&&article.Down>0)
                                    article.Down -= 1;
                                else
                                    article.Down = 0;
                            }
                        }
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getbookmarks")]
        [HttpPost]
        public IHttpActionResult GetBookmarks()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //type:0 article, 1: image, 2: video
                    IEnumerable<AdvancedUserArticle> query = null;
                    int pageCount = 10;
                    query = (from b in db.UserArticle
                             join a in db.Article on b.ArticleId equals a.Id into temp
                             from tt in temp.DefaultIfEmpty()
                             where b.UserName==jwtResult.JwtUser.User &&
                                !(loadedIds).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedUserArticle
                             {
                                 Id = b.Id,
                                 UserName = b.UserName,
                                 ArticleId = b.ArticleId,
                                 Title = (b.Type == 0 ? tt.Title : ""),
                                 OrgUserName = (b.Type == 0 ? tt.UserName : ""),
                                 PreviewPhoto = (b.Type == 0 ? tt.Content : b.Content),
                                 article = (b.Type == 0 ? tt : null),
                                 Content= (b.Type==0 ? "" : b.Content),
                                 Type = b.Type,
                                 CreatedOn = b.CreatedOn
                             })
                            .Take(pageCount);
                    
                    var list = query.ToList();
                    foreach(var item in list)
                    {
                        item.PreviewPhoto = Helpers.GetFirstImageSrc(item.PreviewPhoto);
                    }

                    return Ok(new ApiResult(0, list));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("messageunread")]
        [HttpPost]
        public IHttpActionResult MessageUnread()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    return Ok(new ApiResult(0, db.Message.Where(x => x.Status == 0 && x.To == jwtResult.JwtUser.User 
                        //&& x.From!=jwtResult.JwtUser.User//self like/comment not notify self
                    ).ToList()));

                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        /// <summary>
        /// type:0 mytimeline, type:1 pub article comment, type:2 arcile reply/@you
        /// </summary>
        /// <returns></returns>
        [Route("messagesetread")]
        [HttpPost]
        public IHttpActionResult MessageSetRead()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JavaScriptSerializer js = new JavaScriptSerializer();
                int msgType = js.Deserialize<int>(HttpContext.Current.Request["type"]);


                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var messages = db.Message.Where(x => x.To == jwtResult.JwtUser.User&&x.Status==0&&x.Type== msgType);
                    foreach(var msg in messages)
                    {
                        msg.Status = 1;
                    }
                    db.SaveChanges();

                    return Ok(new ApiResult(0, "Success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

    }
}
