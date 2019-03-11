using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Reddah.Web.Login
{
    public class CommentQuery
    {
        public string Jwt { get; set; }
        public int ArticleId { get; set; }
    }

    public class NewComment
    {
        public string Jwt { get; set; }
        public int ArticleId { get; set; }
        public int ParentId { get; set; }
        public string Content { get; set; }
    }

    public class SeededComments
    {
        public int Seed { get; set; }
        public IList<Comment> Comments { get; set; }
    }
}