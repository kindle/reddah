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
    
    public partial class Article
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Abstract { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public Nullable<int> Up { get; set; }
        public Nullable<int> Down { get; set; }
        public int Count { get; set; }
        public string UserName { get; set; }
        public string GroupName { get; set; }
        public string Locale { get; set; }
        public Nullable<System.DateTime> LastUpdateOn { get; set; }
        public Nullable<int> Type { get; set; }
        public Nullable<int> Ref { get; set; }
        public string Location { get; set; }
        public string CreatedBy { get; set; }
        public string LastUpdateBy { get; set; }
        public int Status { get; set; }
    }
}
