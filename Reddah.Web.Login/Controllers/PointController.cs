using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/point")]
    public class PointController : ApiBaseController
    {
        [Route("getpointlist")]
        [HttpPost]
        public IHttpActionResult GetPointList()
        {
            IEnumerable<Point> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 20;

                    query = (from p in db.Point
                             where p.To == jwtResult.JwtUser.User
                             orderby p.Id descending
                             select p)
                            .Take(pageCount);

                    return Ok(query.ToList());
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("daily")]
        public IHttpActionResult Daily()
        {
            string jwt = HttpContext.Current.Request["jwt"];

            if (String.IsNullOrWhiteSpace(jwt))
                return Ok(new ApiResult(1, "No Jwt string"));

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            using (var db = new reddahEntities())
            {
                const int AwardPoint = 1;
                var item = db.Point.OrderByDescending(d => d.Id).FirstOrDefault(p => p.To == jwtResult.JwtUser.User);

                if (item != null)
                {
                    //check if cross day

                    var point = new Point()
                    {
                        CreatedOn = DateTime.UtcNow,
                        From = "Reddah",
                        To = jwtResult.JwtUser.User,
                        OldV = item.NewV,
                        V = AwardPoint,
                        NewV = item.NewV + AwardPoint,
                        Reason = "daily"
                    };
                    db.Point.Add(point);
                }
                else
                {
                    var point = new Point()
                    {
                        CreatedOn = DateTime.UtcNow,
                        From = "Reddah",
                        To = jwtResult.JwtUser.User,
                        OldV = 0,
                        V = AwardPoint,
                        NewV = AwardPoint,
                        Reason = "daily"
                    };
                    db.Point.Add(point);
                }

                db.SaveChanges();
                
            }

            return Ok(new ApiResult(0, ""));
        }
    }
}
