﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class reddahEntities : DbContext
    {
        public reddahEntities()
            : base("name=reddahEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Article> Article { get; set; }
        public virtual DbSet<Comment> Comment { get; set; }
        public virtual DbSet<Group> Group { get; set; }
        public virtual DbSet<Log> Log { get; set; }
        public virtual DbSet<Message> Message { get; set; }
        public virtual DbSet<Point> Point { get; set; }
        public virtual DbSet<Setting> Setting { get; set; }
        public virtual DbSet<UploadFile> UploadFile { get; set; }
        public virtual DbSet<UserArticle> UserArticle { get; set; }
        public virtual DbSet<UserFriend> UserFriend { get; set; }
        public virtual DbSet<UserProfile> UserProfile { get; set; }
        public virtual DbSet<webpages_Membership> webpages_Membership { get; set; }
        public virtual DbSet<webpages_OAuthMembership> webpages_OAuthMembership { get; set; }
        public virtual DbSet<webpages_Privileges> webpages_Privileges { get; set; }
        public virtual DbSet<webpages_PrivilegesInRoles> webpages_PrivilegesInRoles { get; set; }
        public virtual DbSet<webpages_Roles> webpages_Roles { get; set; }
        public virtual DbSet<webpages_UsersInRoles> webpages_UsersInRoles { get; set; }
    }
}
