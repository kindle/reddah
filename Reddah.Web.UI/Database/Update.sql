alter table article add 
  [Locale] VARCHAR(10) default 'en-us'

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

select * from userprofile



        