﻿CREATE TABLE [dbo].[UserProfile] (
    [UserId] INT IDENTITY (1, 1) NOT NULL,
    [UserName] NVARCHAR (MAX) NULL,
	[Email] NVARCHAR (MAX) NULL,
    PRIMARY KEY CLUSTERED ([UserId] ASC)
);

CREATE TABLE [dbo].[webpages_Membership] (
    [UserId]                                  INT            NOT NULL,
    [CreateDate]                              DATETIME       NULL,
    [ConfirmationToken]                       NVARCHAR (128) NULL,
    [IsConfirmed]                             BIT            DEFAULT ((0)) NULL,
    [LastPasswordFailureDate]                 DATETIME       NULL,
    [PasswordFailuresSinceLastSuccess]        INT            DEFAULT ((0)) NOT NULL,
    [Password]                                NVARCHAR (128) NOT NULL,
    [PasswordChangedDate]                     DATETIME       NULL,
    [PasswordSalt]                            NVARCHAR (128) NOT NULL,
    [PasswordVerificationToken]               NVARCHAR (128) NULL,
    [PasswordVerificationTokenExpirationDate] DATETIME       NULL,
    PRIMARY KEY CLUSTERED ([UserId] ASC)
);

CREATE TABLE [dbo].[webpages_OAuthMembership] (
    [Provider]       NVARCHAR (30)  NOT NULL,
    [ProviderUserId] NVARCHAR (100) NOT NULL,
    [UserId]         INT            NOT NULL,
    PRIMARY KEY CLUSTERED ([Provider] ASC, [ProviderUserId] ASC)
);

CREATE TABLE [dbo].[webpages_Roles] (
    [RoleId]   INT            IDENTITY (1, 1) NOT NULL,
    [RoleName] NVARCHAR (256) NOT NULL,
    PRIMARY KEY CLUSTERED ([RoleId] ASC),
    UNIQUE NONCLUSTERED ([RoleName] ASC)
);

CREATE TABLE [dbo].[webpages_UsersInRoles] (
    [UserId] INT NOT NULL,
    [RoleId] INT NOT NULL,
    PRIMARY KEY CLUSTERED ([UserId] ASC, [RoleId] ASC)
);

CREATE TABLE [dbo].[webpages_Privileges] (
    [PrivilegeId]   INT       IDENTITY (1, 1) NOT NULL,
    [PrivilegeName] NVARCHAR (256) NOT NULL,
    PRIMARY KEY CLUSTERED ([PrivilegeId] ASC),
    UNIQUE NONCLUSTERED ([PrivilegeName] ASC)
);

CREATE TABLE [dbo].[webpages_PrivilegesInRoles] (
    [PrivilegeId] INT NOT NULL,
    [RoleId] INT NOT NULL,
    PRIMARY KEY CLUSTERED ([PrivilegeId] ASC, [RoleId] ASC)
);

CREATE TABLE [dbo].[Log] 
( 
    [Id] [int] IDENTITY (1, 1) NOT NULL, 
    [Date] [datetime] NOT NULL, 
    [Thread] [varchar] (255) NOT NULL, 
    [Level] [varchar] (50) NOT NULL, 
    [Logger] [varchar] (255) NOT NULL, 
    [Message] [varchar] (4000) NOT NULL, 
    [Exception] [varchar] (2000) NULL,
	CONSTRAINT [PK_dbo.Log] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[Group] (
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (MAX) NOT NULL,
	[CreatedOn] DATETIME NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_dbo.Group] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[Article]
(
	[Id] INT IDENTITY(1,1) NOT NULL, 
    [Title] NVARCHAR(MAX) NOT NULL, 
    [Content] NVARCHAR(MAX) NOT NULL, 
	[Abstract] NVARCHAR(200) NOT NULL, 
    [CreatedOn] DATETIME NOT NULL , 
    [Up] INT NULL DEFAULT 0, 
    [Down] INT NULL DEFAULT 0, 
    [Count] INT NOT NULL DEFAULT 0,
	[UserName] NVARCHAR(MAX) NOT NULL,
	[GroupName] NVARCHAR(MAX) NOT NULL,
	CONSTRAINT [PK_dbo.Article] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[Comment]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [ArticleId] INT NOT NULL,
    [ParentId] INT NOT NULL,
    [Content] NVARCHAR (MAX) NOT NULL,
    [CreatedOn] DATETIME NOT NULL ,
    [Up] INT NULL DEFAULT 0,
    [Down] INT NULL DEFAULT 0,
	[Count] INT NOT NULL DEFAULT 0,
    [UserName] NVARCHAR(MAX) NOT NULL,
	[Status] INT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_dbo.Comment] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[Setting] (
    [Id]  INT            IDENTITY (1, 1) NOT NULL,
    [Key]   NVARCHAR (MAX) NULL,
    [Value] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_dbo.Setting] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[UploadFile] 
( 
    [Id] [int] IDENTITY (1, 1) NOT NULL, 
    [Guid] [varchar] (255) NOT NULL, 
	[Format] [varchar] (10) NOT NULL, 
    [UserName] NVARCHAR (MAX) NOT NULL,
    [CreatedOn] DATETIME NOT NULL,
	[GroupName] NVARCHAR(MAX) NOT NULL,
	[Tag] NVARCHAR(MAX) NOT NULL,
	CONSTRAINT [PK_dbo.UploadFile] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[UserArticle]
(
	[Id] INT IDENTITY(1,1) NOT NULL,
	[UserName] NVARCHAR(MAX) NOT NULL,
	[ArticleId] INT NOT NULL,
	[Content] NVARCHAR(MAX) NOT NULL,   --bookmark an image link
	[Type] INT default 0 NOT NULL,       --default 0 as article, 1 as an image link, 2 as an video
	[CreatedOn] DATETIME NOT NULL,
	PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[UserFriend]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserName] NVARCHAR(MAX) NOT NULL,
	[Watch] NVARCHAR(MAX) NOT NULL,
	[Just] NVARCHAR (MAX) NULL,
	[RequestOn] DATETIME NULL,
	[Approve] INT default -1,
	[NoteName] NVARCHAR (MAX) NULL,	
    CONSTRAINT [PK_dbo.UserFriend] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [dbo].[Message]
(
	[Id] INT IDENTITY(1,1) NOT NULL,
	[From] NVARCHAR(MAX) NOT NULL,
	[To] NVARCHAR(MAX) NOT NULL,
	[Msg] NVARCHAR(MAX) NOT NULL, 
	[ArticleId] INT NOT NULL DEFAULT 0,
	[AritclePhoto] NVARCHAR(MAX) NULL,
	[Status] INT NOT NULL DEFAULT 0, --0:unread, 1:read
	[Type] INT NOT NULL DEFAULT 0, --0:like, 1:comment
	[CreatedOn] DATETIME NOT NULL,
	PRIMARY KEY CLUSTERED ([Id] ASC)
);