using System;
using System.Collections.Generic;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using Reddah.Web.Login.Utilities;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;
using System.Data.Entity.Validation;
using Azure.Storage.Blobs;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/miao")]
    public class MiaoController : ApiBaseController
    {
        [Route("getfindtopic")]
        [HttpPost]
        public IHttpActionResult GetFindTopic()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                string targetUserName = HttpContext.Current.Request["abstract"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 10;

                    int[] loaded = loadedIds == null ? new int[] { } : loadedIds;

                    query = (from b in db.Article
                             join u in db.UserProfile on b.UserName equals u.UserName
                             where b.Type == 6 && b.Status != -1 //&& b.Abstract.Contains("cat")
                             && !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedTimeline
                             {
                                 Id = b.Id,
                                 Title = b.Title,
                                 Content = b.Content,
                                 Abstract = b.Abstract,
                                 CreatedOn = b.CreatedOn,
                                 Up = b.Up,
                                 Down = b.Down,
                                 Count = b.Count,
                                 UserName = b.UserName,
                                 GroupName = b.GroupName,
                                 Locale = b.Locale,
                                 LastUpdateOn = b.LastUpdateOn,
                                 Type = b.Type,
                                 Ref = b.Ref,
                                 Location = b.Location,
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex,
                                 LastUpdateBy = b.LastUpdateBy,
                                 LastUpdateContent = b.LastUpdateContent,
                             })
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }
    }
}
