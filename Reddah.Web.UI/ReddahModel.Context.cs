﻿

//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------


namespace Reddah.Web.UI
{

using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;


public partial class reddahEntities1 : DbContext
{
    public reddahEntities1()
        : base("name=reddahEntities1")
    {

    }

    protected override void OnModelCreating(DbModelBuilder modelBuilder)
    {
        throw new UnintentionalCodeFirstException();
    }


    public DbSet<Article> Articles { get; set; }

    public DbSet<Comment> Comments { get; set; }

    public DbSet<Group> Groups { get; set; }

    public DbSet<Log> Logs { get; set; }

    public DbSet<Message> Messages { get; set; }

    public DbSet<Point> Points { get; set; }

    public DbSet<Setting> Settings { get; set; }

    public DbSet<UploadFile> UploadFiles { get; set; }

    public DbSet<UserArticle> UserArticles { get; set; }

    public DbSet<UserFriend> UserFriends { get; set; }

    public DbSet<UserProfile> UserProfiles { get; set; }

    public DbSet<webpages_Membership> webpages_Membership { get; set; }

    public DbSet<webpages_OAuthMembership> webpages_OAuthMembership { get; set; }

    public DbSet<webpages_Privileges> webpages_Privileges { get; set; }

    public DbSet<webpages_PrivilegesInRoles> webpages_PrivilegesInRoles { get; set; }

    public DbSet<webpages_Roles> webpages_Roles { get; set; }

    public DbSet<webpages_UsersInRoles> webpages_UsersInRoles { get; set; }

}

}

