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
    
    public partial class UserProfile
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public Nullable<int> Sex { get; set; }
        public string Signature { get; set; }
        public string Photo { get; set; }
        public string NickName { get; set; }
        public string Location { get; set; }
        public string Cover { get; set; }
        public int SystemStatus { get; set; }
        public int UserSetStatus { get; set; }
        public int Type { get; set; }
        public int limit { get; set; }
        public string CreatedBy { get; set; }
        public string Admins { get; set; }
        public Nullable<decimal> Lat { get; set; }
        public Nullable<decimal> Lng { get; set; }
        public Nullable<System.DateTime> LastShakeOn { get; set; }
    }
}
