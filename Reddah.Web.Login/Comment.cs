//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Reddah.Web.Login
{
    using System;
    using System.Collections.Generic;
    
    public partial class Comment
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
        public int Type { get; set; }
        public int Duration { get; set; }
        public string Abstract { get; set; }
    }
}
