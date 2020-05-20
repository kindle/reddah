using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.Xml.Linq;
using System.Xml;
using System.Web.Script.Serialization;
using Reddah.Web.Login.Utilities;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/user")]
    public class UserController : ApiBaseController
    {
        [Route("getactiveusers")]
        [HttpPost]
        public IHttpActionResult GetActiveUsers()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                string[] loadedIds = js.Deserialize<string[]>(HttpContext.Current.Request["loadedIds"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    IEnumerable<string> query = null;
                    int pageCount = 10;
                    query = (from u in db.UserProfile
                             where u.Type==0 && !(loadedIds).Contains(u.UserName) 
                             && !u.UserName.Contains("test") && u.Point>10
                             orderby u.UserId descending, u.Photo descending
                             select u.UserName)
                            .Take(pageCount);

                    return Ok(new ApiResult(0, query.ToList()));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

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
                        if (user.Type == 0)
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
