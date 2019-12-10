using System.Collections.Generic;
using System.Data.Entity;

namespace Reddah.Web.Login
{
    public class UsersContext : DbContext
    {
        public UsersContext()
            : base("reddahEntities")
        {
        }

        public DbSet<UserProfile> UserProfiles { get; set; }
    }

    public class UserModel
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class JwtUser
    {
        public string User { get; set; }
        public string Allow { get; set; }
    }

    public class UserInfo
    {
        public int UserId { get; set; }
        public int Type { get; set; }
        public string UserName { get; set; }
        public string NickName { get; set; }
        public int Sex { get; set; }
        public string Photo { get; set; }
        public string Location { get; set; }
        public string Admins { get; set; }
        public int Point { get; set; }
        public string Signature { get; set; }
        public string Cover { get; set; }
        public string Email { get; set; }

        public string NoteName { get; set; }
        public bool IsFriend { get; set; }
        public bool HideLocation { get; set; }
        public bool AllowTenTimeline { get; set; }
    }

    public class PointInfo
    {
        public int GotPoint { get; set; }
        public int UserPoint { get; set; }
        public List<Point> History { get; set; }
    }
}