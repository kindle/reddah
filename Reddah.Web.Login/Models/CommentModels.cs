﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Reddah.Web.Login
{
    public class BaseModel
    {
        public string Jwt { get; set; }
    }

    public class CommentQuery : BaseModel
    {
        public int ArticleId { get; set; }
    }

    public class NewComment : BaseModel
    {
        public int ArticleId { get; set; }
        public int ParentId { get; set; }
        public string Content { get; set; }
    }

    public class NewTimeline : BaseModel
    {
        public string Thoughts { get; set; }
        public string Content { get; set; }
        public string Location { get; set; }
    }

    public class SeededComments
    {
        public int Seed { get; set; }
        public IList<AdvancedComment> Comments { get; set; }
    }

    public class GroupChatSeededComments
    {
        public Article Group { get; set; }
        public IList<AdvancedComment> Comments { get; set; }
    }

    public class AdvancedComment : Comment
    {
        public string UserNickName { get; set; }
        public string UserPhoto { get; set; }
        public Nullable<int> UserSex { get; set; }
    }

    public class AdvancedTimeline : Article
    {
        public string UserNickName { get; set; }
        public string UserPhoto { get; set; }
        public Nullable<int> UserSex { get; set; }
    }

    public class AdvancedUserFriend : UserFriend
    {
        public string UserNickName { get; set; }
        public string UserPhoto { get; set; }
        public Nullable<int> UserSex { get; set; }
        public string Signature { get; set; }
    }

    public class AdvancedUserArticle: UserArticle
    {
        public string Title { get; set; }
        public string OrgUserName { get; set; }
        public string PreviewPhoto { get; set; }
        public Article article { get; set; }
    }

    public class AdvancedArticle: Article
    {
        public string ImageUrl { get; set; }

        public AdvancedArticle(Article article)
        {
            this.Id = article.Id;
            this.Title = article.Title;
            this.Content = article.Content;
            this.Abstract = article.Abstract;
            this.CreatedOn = article.CreatedOn;
            this.Up = article.Up;
            this.Down = article.Down;
            this.Count = article.Count;
            this.UserName = article.UserName;
            this.GroupName = article.GroupName;
            this.Locale = article.Locale;
            this.LastUpdateOn = article.LastUpdateOn;
            this.Type = article.Type;
            this.Ref = article.Ref;
        }
        
    }

}