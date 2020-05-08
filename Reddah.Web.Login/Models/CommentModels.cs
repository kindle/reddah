using System;
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
        public string Uid { get; set; }
        public string AtUsers { get; set; }
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

    public class AdvancedPub : Article
    {
        public string UserName { get; set; }
        public string UserNickName { get; set; }
        public string Signature { get; set; }
        public string UserPhoto { get; set; }
        public string UserCover { get; set; }
        public string Email { get; set; }
    }

    public class AdvancedUserArticle: UserArticle
    {
        public string Title { get; set; }
        public string OrgUserName { get; set; }
        public string PreviewPhoto { get; set; }
        public Article article { get; set; }
    }

    public class PointCheckOnce
    {
        public bool Photo { get; set; }
        public bool Signature { get; set; }
        public bool Timeline { get; set; }
        public bool Mini { get; set; }
        public bool Friend { get; set; }
        public bool Shake { get; set; }
        public bool Email { get; set; }
        public int TodayTotalPoint { get; set; }
        public string Test { get; set; }
        public int TodayRead { get; set; }
        public int TodayMark { get; set; }
        public int TodayShare { get; set; }
        public int TodayComment { get; set; }
        public int PunchToday { get; set; }

    }

    public class AdvancedUserProfile : UserProfile
    {
        public decimal? Distance { get; set; }
    }

    public class AdvancedStory : Article
    {
        public decimal? Distance { get; set; }
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

    public class ArticlePreview
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string[] ImageUrls { get; set; }
        public string VideoUrl { get; set; }
        public string VideoPoster { get; set; }
        public string ArticleUrl { get; set; }
        public int Count { get; set; }
        public int Up { get; set; }
        public int Down { get; set; }
        public int Comments { get; set; }
        public string Abstract { get; set; }
        public string CreatedOn { get; set; }
        public DateTime CreatedOnOrg { get; set; }
        public string UserName { get; set; }
        public string GroupName { get; set; }
        public string Content { get; set; }
        public string Locale { get; set; }
        public DateTime? LastUpdateOn { get; set; }
        public Nullable<int> Type { get; set; }
        public int? Ref { get; set; }
        public string PubName { get; set; }
        public string LastUpdateBy { get; set; }
        public string LastUpdateContent { get; set; }
        public string Admins { get; set; }
    }

    public class UserProfileModel
    {
        public int[] LoadedIds;
        public string[] DislikeGroups;
        public string[] DislikeUserNames;
        public string Locale;
        public string Token;
        public string Menu;
        public string Sub;
        public string User;
        public string Keyword;
        public int Type;//1 timeline, others: article
        public int Status;//1 published, 0: draft

        //public Dictionary<string, int> habits;
    }

    public class PubArticle : Article
    {
        public PubArticle() { }

        public string PubName;
        public string Admins;
    }

}