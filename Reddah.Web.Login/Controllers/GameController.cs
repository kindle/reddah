using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.Web.Script.Serialization;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/game")]
    public class GameController : ApiBaseController
    {
        [Route("globalrank")]
        public IHttpActionResult GlobalRank()
        {
            IEnumerable<Rank> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string appId = HttpContext.Current.Request["appId"];
                string appSub = HttpContext.Current.Request["appSub"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                if (String.IsNullOrWhiteSpace(appId))
                    return Ok(new ApiResult(1, "No appId"));

                if (String.IsNullOrWhiteSpace(appSub))
                    return Ok(new ApiResult(1, "No appSub"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 20;

                    query = (from r in db.Rank
                             where r.AppId == appId && r.Sub == appSub
                             orderby r.Score descending
                             select r)
                            .Take(pageCount);

                    return Ok(query.ToList());
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("friendrank")]
        public IHttpActionResult FriendRank()
        {
            IEnumerable<Rank> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string appId = HttpContext.Current.Request["appId"];
                string appSub = HttpContext.Current.Request["appSub"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                if (String.IsNullOrWhiteSpace(appId))
                    return Ok(new ApiResult(1, "No appId"));

                if (String.IsNullOrWhiteSpace(appSub))
                    return Ok(new ApiResult(1, "No appSub"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 20;

                    query = (from r in db.Rank
                             where r.AppId == appId && r.Sub == appSub
                             orderby r.Score descending
                             select r)
                            .Take(pageCount);

                    return Ok(query.ToList());
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("updatemyrank")]
        public IHttpActionResult UpdateMyRank()
        {
            string jwt = HttpContext.Current.Request["jwt"];

            string appId = HttpContext.Current.Request["appId"];
            string appSub = HttpContext.Current.Request["appSub"];
            JavaScriptSerializer js = new JavaScriptSerializer();
            int score = js.Deserialize<int>(HttpContext.Current.Request["Score"]);

            if (String.IsNullOrWhiteSpace(appId))
                return Ok(new ApiResult(1, "No appId"));

            if (String.IsNullOrWhiteSpace(appSub))
                return Ok(new ApiResult(1, "No appSub"));

            if (score<=0)
                return Ok(new ApiResult(1, "Invalid score"));

            if (String.IsNullOrWhiteSpace(jwt))
                return Ok(new ApiResult(1, "No Jwt string"));

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            using (var db = new reddahEntities())
            {
                var item = db.Rank.FirstOrDefault(r => r.AppId == appId && r.Sub == appSub && r.UserName == jwtResult.JwtUser.User);
                if (item != null)
                {
                    item.Score = score;
                    item.CreatedOn = DateTime.UtcNow;
                }
                else
                {
                    var rank = new Rank()
                    {
                        AppId = appId,
                        Sub = appSub,
                        UserName = jwtResult.JwtUser.User,
                        Score = score,
                        CreatedOn = DateTime.UtcNow
                    };
                    db.Rank.Add(rank);
                }

                db.SaveChanges();
                
            }

            return Ok(new ApiResult(0, ""));
        }

    }
}
