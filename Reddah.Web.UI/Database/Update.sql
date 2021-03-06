﻿alter table article add 
  [Locale] VARCHAR(10) default 'en-us'

-- normal post from website: 0, friends see only:1.
alter table article add 
  [Type] int default 0

alter table article add 
  [LastUpdateOn] DATETIME NULL 

alter table [dbo].[Group] add
  [Desc] NVARCHAR (MAX) NULL, 
  [ParentId] INT default -1,
  [Relation] NVARCHAR (MAX) default 'isa',
  [Path] NVARCHAR (MAX) NULL

alter table article alter column
  [Abstract] NVARCHAR(MAX) 

insert into webpages_privileges (PrivilegeName)values('edit post')
insert into webpages_privileges (PrivilegeName)values('delete post')
insert into webpages_privileges (PrivilegeName)values('delete comment')

insert into webpages_roles (RoleName)values('admin')

insert into webpages_privilegesInRoles (PrivilegeId,RoleId)values(1,1)
insert into webpages_privilegesInRoles (PrivilegeId,RoleId)values(2,1)
insert into webpages_privilegesInRoles (PrivilegeId,RoleId)values(3,1)

insert into webpages_UsersInRoles (UserId, RoleId)values(50,1)


update userprofile set username=N'辟毒' where userid=3
update userprofile set username=N'赤声' where userid=4
update userprofile set username=N'紫贤' where userid=5
update userprofile set username=N'金刚手' where userid=6
update userprofile set username=N'妙吉祥' where userid=7
update userprofile set username=N'虚空' where userid=8
update userprofile set username=N'广目' where userid=9
update userprofile set username=N'多闻' where userid=10
update userprofile set username=N'匿名用户' where userid=2

alter table [dbo].[UserProfile] add
  [Sex] INT default 0, 
  [Signature] NVARCHAR (MAX) NULL,
  [Photo] VARCHAR (MAX) NULL

update userprofile set sex=1 where userid in(3,4,6,8,9,10)
update userprofile set sex=0 where userid in(5,7)
update userprofile set signature=N'悲莫悲生离别，乐莫乐新相识' where userid=3

--20190423
alter table [dbo].[UserProfile] add
  [NickName] NVARCHAR (MAX) NULL,
  [Location] VARCHAR (MAX) NULL

--20190426
alter table [dbo].[UserProfile] add
  [Cover] VARCHAR (MAX) NULL

--20190526
alter table [dbo].[UserProfile] add
  [SysStatus] INT default 0 NOT NULL,  --limit or disable this user 
  [UserStatus] INT default 0 NOT NULL  --do not want to be searched by username, cell number
  

--20190607
--re-create userarticle

--20190609
--default 0:text, 1:audio 2:image 3:video 4:link
alter table [dbo].[Comment] add
  [Type] INT NOT NULL DEFAULT 0,
  [Duration]  INT NOT NULL DEFAULT -1

--20190704
alter table article add 
  [Ref] int default 0

--20190708
alter table [dbo].[UserProfile] add
  [Type] INT default 0 NOT NULL,  --0 normal user, 1 subscriber, 2 service
  [limit] INT default 1 NOT NULL  --default limit 1 post per day

alter table [dbo].[UserProfile] add
  [CreatedBy] NVARCHAR (MAX) NULL, 
  [Admins] NVARCHAR (MAX) NULL 

alter table article add
  [Location] NVARCHAR(MAX) NULL


--20190714
alter table article add
  [CreatedBy] NVARCHAR(MAX) NULL,
  [LastUpdateBy] NVARCHAR(MAX) NULL,
  [Status] INT NOT NULL DEFAULT 0  --0: draft, 1: published, -1 deleted

--20190802
alter table article add
  [LastUpdateContent] NVARCHAR(MAX) NULL,
  [LastUpdateType] INT NOT NULL DEFAULT 0 

--20190805
ALTER TABLE [userprofile]
ALTER COLUMN [Location] nvarchar(MAX) null

ALTER TABLE [userprofile]
ALTER COLUMN [Cover] nvarchar(MAX) null

alter table [dbo].[UserProfile] add
  [Lat] Decimal(20,16) NULL,
  [Lng] Decimal(20,16) NULL

--20190809
alter table [dbo].[UserProfile] add 
  [LastShakeOn] DATETIME NULL 


--20190813
alter table comment add 
  [Abstract] NVARCHAR(MAX) NULL

--20190823 if not set NOT NULL default value is null
alter table userprofile add 
  [PrivacyShowLocation] int NOT NULL default 0,
  [PrivacyViewTs] int NOT NULL default 1

alter table comment add
  [Uid] NVARCHAR(MAX) NULL

--remove column
--alter table userprofile drop constraint DF__UserProfi__Priva__336AA144
--alter table userprofile drop column privacystragerview

--20190913
CREATE TABLE [dbo].[Point]
(
	[Id] INT IDENTITY(1,1) NOT NULL, 
    [CreatedOn] DATETIME NOT NULL, 
	[From] NVARCHAR(MAX) NOT NULL, 
    [To] NVARCHAR(MAX) NOT NULL, 
	[OldV] INT NOT NULL DEFAULT 0, 
	[V] INT NOT NULL DEFAULT 0, 
    [NewV] INT NOT NULL DEFAULT 0,
	[Reason] NVARCHAR(MAX) NOT NULL,
	CONSTRAINT [PK_dbo.Point] PRIMARY KEY CLUSTERED ([Id] ASC)
);

alter table userprofile add 
    [Point] int NOT NULL default 0

--20191115 add leaderboard for games
CREATE TABLE [dbo].[Rank]
(
	[Id] INT IDENTITY(1,1) NOT NULL, 
	[AppId] NVARCHAR(MAX) NOT NULL, 
	[Sub] NVARCHAR(MAX) NOT NULL,
    [UserName] NVARCHAR(MAX) NOT NULL, 
	[Score] INT NOT NULL DEFAULT 0,
	[CreatedOn] DATETIME NOT NULL, 
	CONSTRAINT [PK_dbo.Rank] PRIMARY KEY CLUSTERED ([Id] ASC)
);

--20191122 
alter table userprofile add 
	[UsedMini] NVARCHAR(MAX) NULL, 
	[LastUsedOn] DATETIME NULL, 
	[LastLocale] VARCHAR(10) NULL

--20191216
alter table point add 
	[Ref] INT NULL DEFAULT 0 

--20191222
alter table userprofile add 
	[Lan] VARCHAR(10) NULL, 
	[Lan1] NVARCHAR(MAX) NULL 

--20200111
alter table [dbo].[article] add
  [Lat] Decimal(20,16) NULL,
  [Lng] Decimal(20,16) NULL