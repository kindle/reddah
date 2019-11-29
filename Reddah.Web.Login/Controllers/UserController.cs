using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/user")]
    public class UserController : ApiBaseController
    {
        [Route("updatedeviceinfo")]
        [HttpPost]
        public IHttpActionResult UpdateDeviceInfo()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string info = HttpContext.Current.Request["info"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var user = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                    if (user != null)
                    {
                        if (user.Type==0)
                        {
                            user.Admins = info;
                            db.SaveChanges();
                        }
                    }

                    return Ok(new ApiResult(0, ""));
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        
    }
}
