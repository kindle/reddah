using System;
using System.Collections.Generic;
using System.Data.Entity;

namespace Reddah.Web.UI.Models
{
    public class AritcleProfile
    {
        public int Id { get; set; }
        public string LastName { get; set; }
        public string Title { get; set; }
        public string ImageLink { get; set; }
        public string ContentLink { get; set; }
        public string Description { get; set; }
    }

    public class Label
    {
        public int LabelId { get; set; }
        public string Name { get; set; }

        public virtual List<Post> Posts { get; set; }
    }

    public class Post
    {
        public int PostId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }

        public int LabelId { get; set; }
        public virtual Label Label { get; set; }
    }
}
