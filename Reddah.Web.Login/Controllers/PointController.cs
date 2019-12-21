using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web;
using System.Web.Script.Serialization;
using Reddah.Web.Login.Utilities;

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
                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 20;

                    if(id==0)
                    {
                        query = (from p in db.Point
                                 where p.To == jwtResult.JwtUser.User
                                 orderby p.Id descending
                                 select p)
                            .Take(pageCount);
                    }
                    else
                    {
                        query = (from p in db.Point
                                 where p.To == jwtResult.JwtUser.User && p.Id < id
                                 orderby p.Id descending
                                 select p)
                            .Take(pageCount);
                    }
                    

                    return Ok(new ApiResult(0, query.ToList()));
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("punchclock")]
        public IHttpActionResult PunchClock()
        {
            string jwt = HttpContext.Current.Request["jwt"];
            JavaScriptSerializer js = new JavaScriptSerializer();
            int minitesOffset = js.Deserialize<int>(HttpContext.Current.Request["offset"]);
            
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
                var userCurrentPoint = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User).Point;
                

                if (punchClockList.Count == 0)
                {
                    var point = new Point()
                    {
                        CreatedOn = DateTime.UtcNow,
                        From = "Reddah",
                        To = jwtResult.JwtUser.User,
                        OldV = userCurrentPoint,
                        V = AwardPoint,
                        NewV = userCurrentPoint+AwardPoint,
                        Reason = "punchclock"
                    };
                    db.Point.Add(point);
                    db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User).Point = point.NewV;
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

                        var point = new Point()
                        {
                            CreatedOn = DateTime.UtcNow,
                            From = "Reddah",
                            To = jwtResult.JwtUser.User,
                            OldV = userCurrentPoint,
                            V = AwardPoint,
                            NewV = userCurrentPoint + AwardPoint,
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

        [Route("login")]
        public IHttpActionResult Login()
        {
            string jwt = HttpContext.Current.Request["jwt"];
            JavaScriptSerializer js = new JavaScriptSerializer();
            int minitesOffset = js.Deserialize<int>(HttpContext.Current.Request["offset"]);
            
            if (String.IsNullOrWhiteSpace(jwt))
                return Ok(new ApiResult(1, "No Jwt string"));

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            int AwardPoint = 1;
            PointInfo pointInfo = new PointInfo();

            using (var db = new reddahEntities())
            {
                var punchClockList = db.Point.Where(p => p.To == jwtResult.JwtUser.User && p.Reason == "login")
                    .OrderByDescending(d => d.Id).Take(1).ToList();
                
                var lastDay = DateTime.UtcNow.AddMinutes(-1 * minitesOffset);
                var userCurrentPoint = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User).Point;

                if (punchClockList.Count == 0)
                {
                    var point = new Point()
                    {
                        CreatedOn = DateTime.UtcNow,
                        From = "Reddah",
                        To = jwtResult.JwtUser.User,
                        OldV = userCurrentPoint,
                        V = AwardPoint,
                        NewV = userCurrentPoint+AwardPoint,
                        Reason = "login"
                    };
                    db.Point.Add(point);
                    db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User).Point = point.NewV;
                    db.SaveChanges();

                    pointInfo.GotPoint = AwardPoint;
                    pointInfo.UserPoint = point.NewV;
                    pointInfo.History = new List<Point> { point };
                }
                else
                {
                    if (punchClockList[0].CreatedOn.AddMinutes(-1 * minitesOffset).Day == lastDay.Day)
                    {
                        //already award login today
                        pointInfo.GotPoint = punchClockList[0].V;
                        pointInfo.UserPoint = punchClockList[0].NewV;
                        pointInfo.History = punchClockList;

                        return Ok(new ApiResult(3, pointInfo));
                    }
                    else
                    {
                        var point = new Point()
                        {
                            CreatedOn = DateTime.UtcNow,
                            From = "Reddah",
                            To = jwtResult.JwtUser.User,
                            OldV = userCurrentPoint,
                            V = AwardPoint,
                            NewV = userCurrentPoint + AwardPoint,
                            Reason = "login"
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

        private IHttpActionResult MaxPoint(string reason, int awardPoint, int maxPoint)
        {
            string jwt = HttpContext.Current.Request["jwt"];
            JavaScriptSerializer js = new JavaScriptSerializer();
            int minitesOffset = js.Deserialize<int>(HttpContext.Current.Request["offset"]);

            if (String.IsNullOrWhiteSpace(jwt))
                return Ok(new ApiResult(1, "No Jwt string"));

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            string userName = jwtResult.JwtUser.User;

            PointInfo pointInfo = new PointInfo();

            using (var db = new reddahEntities())
            {
                var pointList = db.Point.Where(p => p.To == userName && p.Reason == reason)
                    .OrderByDescending(d => d.Id).Take(maxPoint).ToList();
                int count = 0;
                var lastDay = DateTime.UtcNow.AddMinutes(-1 * minitesOffset);
                var userCurrentPoint = db.UserProfile.FirstOrDefault(u => u.UserName == userName).Point;

                if (pointList.Count == 0)
                {
                    var point = new Point()
                    {
                        CreatedOn = DateTime.UtcNow,
                        From = "Reddah",
                        To = userName,
                        OldV = userCurrentPoint,
                        V = awardPoint,
                        NewV = userCurrentPoint + awardPoint,
                        Reason = reason
                    };
                    db.Point.Add(point);
                    db.UserProfile.FirstOrDefault(u => u.UserName == userName).Point = point.NewV;
                    db.SaveChanges();

                    pointInfo.GotPoint = awardPoint;
                    pointInfo.UserPoint = point.NewV;
                    pointInfo.History = new List<Point> { point };
                }
                else
                {

                    for (int i = 0; i < pointList.Count; i++)
                    {
                        var pcLocalTime = pointList[i].CreatedOn.AddMinutes(-1 * minitesOffset);
                        if (lastDay.Day == pcLocalTime.Day)
                        {
                            count++;
                        }
                    }

                    if (count < maxPoint)
                    {
                        var point = new Point()
                        {
                            CreatedOn = DateTime.UtcNow,
                            From = "Reddah",
                            To = userName,
                            OldV = userCurrentPoint,
                            V = awardPoint,
                            NewV = userCurrentPoint + awardPoint,
                            Reason = reason
                        };
                        db.Point.Add(point);
                        db.UserProfile.FirstOrDefault(u => u.UserName == userName).Point = point.NewV;

                        db.SaveChanges();

                        pointInfo.GotPoint = count + 1;
                        pointInfo.UserPoint = point.NewV;
                        pointList.Add(point);
                        pointInfo.History = pointList;
                    }
                    else
                    {
                        //already read full today
                        pointInfo.GotPoint = pointList[0].V;
                        pointInfo.UserPoint = pointList[0].NewV;
                        pointInfo.History = pointList;

                        return Ok(new ApiResult(3, pointInfo));
                    }
                }
            }

            return Ok(new ApiResult(0, pointInfo));
        }


        [Route("read")]
        public IHttpActionResult Read()
        {
            int awardPoint = 1;
            int maxPoint = 6;
            return MaxPoint("read", awardPoint, maxPoint);
        }

        [Route("mark")]
        public IHttpActionResult Mark()
        {
            int awardPoint = 1;
            int maxPoint = 2;
            return MaxPoint("mark", awardPoint, maxPoint);
        }

        [Route("share")]
        public IHttpActionResult Share()
        {
            int awardPoint = 1;
            int maxPoint = 2;
            return MaxPoint("share", awardPoint, maxPoint);
        }

        [Route("comment")]
        public IHttpActionResult Comment()
        {
            int awardPoint = 1;
            int maxPoint = 3;
            return MaxPoint("comment", awardPoint, maxPoint);
        }

        [Route("checkonce")]
        public IHttpActionResult CheckOnce()
        {
            string jwt = HttpContext.Current.Request["jwt"];
            JavaScriptSerializer js = new JavaScriptSerializer();
            int minitesOffset = js.Deserialize<int>(HttpContext.Current.Request["offset"]);

            if (String.IsNullOrWhiteSpace(jwt))
                return Ok(new ApiResult(1, "No Jwt string"));

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            PointCheckOnce result = new PointCheckOnce();
            result.TodayTotalPoint = 0;

            using (var db = new reddahEntities())
            {
                result.Photo = db.Point.FirstOrDefault(p=>p.To==jwtResult.JwtUser.User&&p.Reason=="photo")!=null;
                result.Signature = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "signature") != null;
                result.Timeline = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "timeline") != null;
                result.Mini = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "mini") != null;
                result.Friend = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "friend") != null;
                result.Shake = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "shake") != null;
                result.Email = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Reason == "email") != null;

                var today = DateTime.UtcNow.AddMinutes(-1 * minitesOffset);
                var todayPoints = db.Point.Where(p => p.To == jwtResult.JwtUser.User).OrderByDescending(p=>p.Id).Take(100).ToList();
                foreach(var p in todayPoints)
                {
                    if(p.CreatedOn.AddMinutes(-1 * minitesOffset).Date == today.Date)
                    {
                        result.TodayTotalPoint += p.V;
                        if (p.Reason == "read")
                        {
                            result.TodayRead += p.V;
                        }
                        else if (p.Reason == "mark")
                        {
                            result.TodayMark += p.V;
                        }
                        else if (p.Reason == "share")
                        {
                            result.TodayShare += p.V;
                        }
                        else if (p.Reason == "comment")
                        {
                            result.TodayComment += p.V;
                        }
                        else if (p.Reason == "punchclock")
                        {
                            result.PunchToday = p.V;
                        }
                    }
                }

            }

            return Ok(new ApiResult(0, result));
        }

        [Route("reportaward")]
        public IHttpActionResult ReportAward()
        {
            string jwt = HttpContext.Current.Request["jwt"];
            string content = HttpContext.Current.Request["content"];

            JavaScriptSerializer js = new JavaScriptSerializer();
            
            int articleId = js.Deserialize<int>(HttpContext.Current.Request["id"]);
            int dataType = js.Deserialize<int>(HttpContext.Current.Request["data"]);

            if (String.IsNullOrWhiteSpace(jwt))
                return Ok(new ApiResult(1, "No Jwt string"));

            JwtResult jwtResult = AuthController.ValidJwt(jwt);

            if (jwtResult.Success != 0)
                return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

            
            using (var db = new reddahEntities())
            {
                var item = db.Point.FirstOrDefault(p => p.To == jwtResult.JwtUser.User && p.Ref == articleId);
                if (item != null)
                {
                    return Ok(new ApiResult(3, "already award"));
                }
                else
                {
                    const int AwardPoint = 30;
                    var reporter = db.Article.FirstOrDefault(a => a.Id == articleId);
                    if (reporter != null)
                    {
                        var userCurrentPoint = db.UserProfile.FirstOrDefault(u => u.UserName == reporter.UserName).Point;

                        //award
                        if (dataType == 1)
                        {
                            var point = new Point()
                            {
                                CreatedOn = DateTime.UtcNow,
                                From = jwtResult.JwtUser.User,
                                To = reporter.UserName,
                                OldV = userCurrentPoint,
                                V = AwardPoint,
                                NewV = userCurrentPoint + AwardPoint,
                                Reason = "report"
                            };
                            db.Point.Add(point);
                            db.UserProfile.FirstOrDefault(u => u.UserName == reporter.UserName).Point = point.NewV;

                            db.Comment.Add(new Comment()
                            {
                                ArticleId = articleId,
                                ParentId = -1,
                                Content = HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(content+" +"+AwardPoint))),
                                CreatedOn = DateTime.UtcNow,
                                UserName = jwtResult.JwtUser.User,
                                Uid = ""
                            });

                        }
                        else
                        {
                            db.Comment.Add(new Comment()
                            {
                                ArticleId = articleId,
                                ParentId = -1,
                                Content = HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(content))),
                                CreatedOn = DateTime.UtcNow,
                                UserName = jwtResult.JwtUser.User,
                                Uid = ""
                            });
                        }

                        //close article
                        //reporter.Status = -1;

                        db.SaveChanges();
                    }
                    else
                    {
                        return Ok(new ApiResult(3, "report article missing"));
                    }
                    
                }

            }

            return Ok(new ApiResult(0, ""));
        }
    }
}
