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

    public partial class AdvancedComment
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public int ParentId { get; set; }
        public string Content { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public Nullable<int> Up { get; set; }
        public Nullable<int> Down { get; set; }
        public int Count { get; set; }
        public string UserName { get; set; }
        public int Status { get; set; }
        public string UserNickName { get; set; }
        public string UserPhoto { get; set; }
        public Nullable<int> UserSex { get; set; }
    }
}