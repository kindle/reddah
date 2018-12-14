alter table article add 
  "Locale" VARCHAR(10) default 'en-us'

alter table article add 
  "LastUpdateOn" DATETIME NULL 

insert into webpages_privileges (PrivilegeName)values('edit post')
insert into webpages_privileges (PrivilegeName)values('delete post')
insert into webpages_privileges (PrivilegeName)values('delete comment')

insert into webpages_roles (RoleName)values('admin')

insert into webpages_privilegesInRoles (PrivilegeId,RoleId)values(1,1)
insert into webpages_privilegesInRoles (PrivilegeId,RoleId)values(2,1)
insert into webpages_privilegesInRoles (PrivilegeId,RoleId)values(3,1)

insert into webpages_UsersInRoles (UserId, RoleId)values(50,1)