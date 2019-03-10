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
}