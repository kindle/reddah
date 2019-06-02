using System.Data.Entity;

namespace Reddah.Web.Login
{
    public class ApiResult
    {
        public int Success { get; set; }
        public object Message { get; set; }

        public ApiResult() {}

        public ApiResult(int success, object message)
        {
            this.Success = success;
            this.Message = message;
        }
    }

    public class JwtResult : ApiResult
    {
        public JwtUser JwtUser { get; set; }

        public JwtResult() { }

        public JwtResult(int success, string message, JwtUser jwtUser)
        {
            this.Success = success;
            this.Message = message;
            this.JwtUser = jwtUser;
        }
    }
}