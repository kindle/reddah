﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
namespace Reddah.Web.UI.Models
{
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
    }

    public class VoteModel {

        [Required]
        [Display(Name = "Article Id")]
        public int ArticleId { get; set; }

        [Required]
        [Display(Name = "Vote Value")]
        public string Value { get; set; }
    }

    public class ArticleComment 
    { 
        public int Id { get; set; }
        public int ParentId { get; set; }
        public string Content{get;set;}
        public string UserName {get;set;}
        public int Count { get; set; }
        public int Up { get; set; }
        public int Down { get; set; }
    }

    public class SeededComments
    {
        public int Seed { get; set; }
        public IList<Comment> Comments { get; set; }
    }

    public class CommentModel
    {
        [Required]
        [Display(Name = "Article ID")]
        public int ArticleId { get; set; }

        [Required]
        [Display(Name = "Parent Id")]
        public int ParentId { get; set; }
        [Required]
        [Display(Name = "Comment Content")]
        public string Content { get; set; }
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

    public class JsonGroup
    {
        public string Name;
        public string Locale;
        public string Desc;
    }

    public class PubArticle : Article
    {
        public PubArticle() { }

        public string PubName;
    }
}