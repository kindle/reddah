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
}