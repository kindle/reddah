using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.Web.Script.Serialization;

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

                    return Ok(new ApiResult(0, query.ToList()));
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
            JavaScriptSerializer js = new JavaScriptSerializer();
            int minitesOffset = js.Deserialize<int>(HttpContext.Current.Request["offset"]);
            //return Ok(new ApiResult(0, DateTime.UtcNow.AddMinutes(-1*minitesOffset)));
            if (String.IsNullOrWhiteSpace(jwt))
                return Ok(new ApiResult(1, "No Jwt string"));

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            int AwardPoint = 1;
            PointInfo pointInfo = new PointInfo();

            using (var db = new reddahEntities())
            {
                var punchClockList = db.Point.Where(p => p.To == jwtResult.JwtUser.User && p.Reason=="punchclock")
                    .OrderByDescending(d => d.Id).Take(31).ToList();
                int count = 0;
                var lastDay = DateTime.UtcNow.AddMinutes(-1 * minitesOffset);

                if (punchClockList.Count == 0)
                {
                    var point = new Point()
                    {
                        CreatedOn = DateTime.UtcNow,
                        From = "Reddah",
                        To = jwtResult.JwtUser.User,
                        OldV = 0,
                        V = AwardPoint,
                        NewV = AwardPoint,
                        Reason = "punchclock"
                    };
                    db.Point.Add(point);

                    db.SaveChanges();

                    pointInfo.GotPoint = AwardPoint;
                    pointInfo.UserPoint = point.NewV;
                    pointInfo.History = new List<Point> { point };
                }
                else
                {
                    if(punchClockList[0].CreatedOn.AddMinutes(-1 * minitesOffset).Day == lastDay.Day)
                    {
                        //already punch clock today
                        pointInfo.GotPoint = punchClockList[0].V;
                        pointInfo.UserPoint = punchClockList[0].NewV;
                        pointInfo.History = punchClockList;

                        return Ok(new ApiResult(3, pointInfo));
                    }
                    else
                    {
                        for (int i = 0; i < punchClockList.Count; i++)
                        {
                            var pcLocalTime = punchClockList[i].CreatedOn.AddMinutes(-1 * minitesOffset);
                            if (lastDay.Day - pcLocalTime.Day == 1)
                            {
                                lastDay = pcLocalTime;
                                count++;
                            }
                            else
                            {
                                break;
                            }
                        }

                        if (count+1 == 3)
                            AwardPoint = 5;
                        else if (count+1 == 7)
                            AwardPoint = 15;
                        else if (count+1 == 14)
                            AwardPoint = 20;
                        else if (count+1 >= 21)
                            AwardPoint = 25;


                        
                        var item = punchClockList[0];
                        var point = new Point()
                        {
                            CreatedOn = DateTime.UtcNow,
                            From = "Reddah",
                            To = jwtResult.JwtUser.User,
                            OldV = item.NewV,
                            V = AwardPoint,
                            NewV = item.NewV + AwardPoint,
                            Reason = "punchclock"
                        };
                        db.Point.Add(point);
                        db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User).Point = point.NewV;

                        db.SaveChanges();

                        pointInfo.GotPoint = AwardPoint;
                        pointInfo.UserPoint = point.NewV;
                        punchClockList.Add(point);
                        pointInfo.History = punchClockList;
                        
                    }
                }

                    
                
            }

            return Ok(new ApiResult(0, pointInfo));
        }
    }
}
