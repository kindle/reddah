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

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/article")]
    public class ArticleController : ApiBaseController
    {
        [Route("getcomments")]
        [HttpPost]
        public IHttpActionResult GetComments([FromBody]CommentQuery query)
        {
            SeededComments seededComments;
            using (var db = new reddahEntities())
            {
                var comments = (from c in db.Comment
                                join u in db.UserProfile on c.UserName equals u.UserName
                                where c.ArticleId == query.ArticleId && c.Status!=-1
                                orderby c.CreatedOn ascending
                                select new AdvancedComment
                                {
                                    Id = c.Id,
                                    ArticleId = c.ArticleId,
                                    ParentId = c.ParentId,
                                    Content = c.Content,
                                    CreatedOn = c.CreatedOn,
                                    Up = c.Up,
                                    Down = c.Down,
                                    Count = c.Count,
                                    UserName = c.UserName,
                                    Status = c.Status,
                                    UserNickName = u.NickName,
                                    UserPhoto = u.Photo,
                                    UserSex = u.Sex,
                                    Type=c.Type,
                                    Duration=c.Duration
                                });

                seededComments = new SeededComments { Seed = -1, Comments = comments.ToList() };
                
            }
            return Ok(seededComments);

        }

        [Route("addcomments")]
        [HttpPost]
        public IHttpActionResult AddComments([FromBody]NewComment data)
        {
            if (data.ArticleId < 0)
                return Ok(new ApiResult(1, "Invalid Article Id"));

            JwtResult jwtResult = AuthController.ValidJwt(data.Jwt);

            if(jwtResult.Success!=0)
                return Ok(new ApiResult(2, "Jwt invalid"+jwtResult.Message));

            try
            {
                using (var db = new reddahEntities())
                {
                    data.Content = data.Content.Replace("\n", "<br>");

                    db.Comment.Add(new Comment()
                    {
                        ArticleId = data.ArticleId,
                        ParentId = data.ParentId,
                        Content = HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content))),
                        CreatedOn = DateTime.UtcNow,
                        UserName = jwtResult.JwtUser.User,
                        Uid = data.Uid
                    });


                    var article = db.Article.FirstOrDefault(a => a.Id == data.ArticleId);
                    if (article != null)
                    {
                        article.Count++;
                    }

                    if (data.ParentId != -1)
                    {
                        var parentComment = db.Comment.FirstOrDefault(c => c.Id == data.ParentId);
                        if (parentComment != null)
                        {
                            parentComment.Count++;
                        }
                    }

                    var chatItem = db.Article.FirstOrDefault(a => a.Id == data.ArticleId);
                    if (chatItem!=null)
                    {
                        chatItem.LastUpdateBy = jwtResult.JwtUser.User;
                        chatItem.LastUpdateOn = DateTime.UtcNow;
                        article.LastUpdateContent = System.Web.HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(data.Content)));
                        article.LastUpdateType = 0;
                    }

                    db.SaveChanges();

                }
            }
            catch(Exception ex)
            {
                Ok(new ApiResult(3, "Excepion:"+ex.Message.ToString()));
            }

            return Ok(new ApiResult(0, "New Comment Added"));

        }

        [Route("addtimeline")]
        [HttpPost]
        public IHttpActionResult AddTimeline()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string thoughts = HttpContext.Current.Request["thoughts"];
                string location = HttpContext.Current.Request["location"];
                string shareTitle = HttpContext.Current.Request["abstract"];
                string shareImageUrl = HttpContext.Current.Request["content"];
                //this is actually fileurl array
                string rorder = HttpContext.Current.Request["order"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                int feedbackType = js.Deserialize<int>(HttpContext.Current.Request["feedbackType"]);
                int type = js.Deserialize<int>(HttpContext.Current.Request["type"]);
                int refArticleId = js.Deserialize<int>(HttpContext.Current.Request["ref"]);


                Dictionary<string, string> imageUrls = new Dictionary<string, string>();

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                if (String.IsNullOrWhiteSpace(thoughts) && hfc.Count == 0 && shareTitle==null)
                    return Ok(new ApiResult(1, "No thoughts and photos"));

                if (hfc.Count == 0 && type==5)
                    return Ok(new ApiResult(1010, "No materials uploaded"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    string[] order = rorder.Split(',');
                    
                    using (var db = new reddahEntities())
                    {
                        Dictionary<string, string> dict = new Dictionary<string, string>();
                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string uploadedImagePath = "/uploadPhoto/";
                            string uploadImageServerPath = "~" + uploadedImagePath;

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];
                            var fileNameKey = rfilename.Replace("_reddah_preview", "");
                            if (!dict.Keys.Contains(fileNameKey))
                            {
                                dict.Add(fileNameKey, guid);
                            }
                            else
                            {
                                guid = dict[fileNameKey];
                            }
                            if (upload.FileName.Contains("_reddah_preview"))
                            {
                                guid += "_reddah_preview";
                            }

                            try
                            {
                                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                                var fileName = Path.GetFileName(guid + "." + fileFormat);
                                var filePhysicalPath = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileName);
                                if (!Directory.Exists(HostingEnvironment.MapPath(uploadImageServerPath)))
                                {
                                    Directory.CreateDirectory(HostingEnvironment.MapPath(uploadImageServerPath));
                                }
                                upload.SaveAs(filePhysicalPath);
                                var url = uploadedImagePath + fileName;


                                UploadFile file = new UploadFile();
                                file.Guid = guid;
                                file.Format = fileFormat;
                                file.UserName = jwtResult.JwtUser.User;
                                file.CreatedOn = DateTime.UtcNow;
                                file.GroupName = "";
                                file.Tag = "";
                                db.UploadFile.Add(file);
                                if (upload.FileName.Contains("_reddah_preview."))
                                {
                                    if (!imageUrls.Values.Contains("///login.reddah.com" + url))
                                    {
                                        imageUrls.Add(guid.Replace("_reddah_preview", ""), "///login.reddah.com" + url);
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                return Ok(new ApiResult(1, ex.Message));
                            }
                        }
                        
                        //deal with photo order
                        List<string> articleContentList = new List<string>();
                        foreach(string key in order)
                        {
                            if (dict.ContainsKey(key))
                            {
                                string targetGuid = dict[key];
                                if(imageUrls.ContainsKey(targetGuid))
                                    articleContentList.Add(imageUrls[targetGuid]);
                            }
                        }

                        //add timeline article
                        db.Article.Add(new Article()
                        {
                            Title = HttpUtility.HtmlEncode(Helpers.HideSensitiveWords(Helpers.HideXss(thoughts.Replace("\n", "<br>")))),
                            Content = shareImageUrl!=null?shareImageUrl:string.Join("$$$", articleContentList),
                            CreatedOn = DateTime.UtcNow,
                            Count = 0,
                            GroupName = "",
                            Location = location,
                            UserName = jwtResult.JwtUser.User,
                            Type = type,
                            Ref = refArticleId,
                            Abstract = refArticleId > 0 ? shareTitle : feedbackType.ToString()
                            //when type=9, insert feedbacktype else if share article insert title else insert empty

                        });

                        db.SaveChanges();

                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }
                

                return Ok(new ApiResult(0, "New Timeline Added"));

            }
            catch(Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }
        }

        [Route("getmytimeline")]
        [HttpPost]
        public IHttpActionResult GetMyTimeline()
        {
            IEnumerable<Article> query = null;
            
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                //string thoughts = HttpContext.Current.Request["thoughts"];

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
                             where b.Type == 1 && b.Status!=-1 && (b.UserName == jwtResult.JwtUser.User || 
                             (from f in db.UserFriend where f.UserName == jwtResult.JwtUser.User && f.Approve==1 select f.Watch).ToList().Contains(b.UserName)) 
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
                                 UserSex = u.Sex
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

        [Route("gettimeline")]
        [HttpPost]
        public IHttpActionResult GetTimeline()
        {
            IEnumerable<Article> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);
                //string thoughts = HttpContext.Current.Request["thoughts"];

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
                             where b.Type == 1 && b.UserName == targetUser && b.Status!=-1 &&
                                     !(loaded).Contains(b.Id)
                             orderby b.Id descending
                             select b)
                            .Take(pageCount);

                    return Ok(query.ToList());

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("like")]
        [HttpPost]
        public IHttpActionResult Like()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                
                string action = HttpContext.Current.Request["action"];
                int id = int.Parse(HttpContext.Current.Request["id"]);
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));
                
                using (var db = new reddahEntities())
                {

                    var article = db.Article.FirstOrDefault(a => a.Id == id);
                    if(article != null)
                    {
                        if (action.Equals("add"))
                        {
                            if (!article.GroupName.Split(',').ToList().Contains(jwtResult.JwtUser.User))
                            {
                                if(string.IsNullOrWhiteSpace(article.GroupName))
                                    article.GroupName += jwtResult.JwtUser.User;
                                else 
                                    article.GroupName += "," + jwtResult.JwtUser.User;

                                var msg = new Message()
                                {
                                    From = jwtResult.JwtUser.User,
                                    To = article.UserName,
                                    Msg = "like",
                                    ArticleId = article.Id,
                                    AritclePhoto = article.Content.Length>0?article.Content.Split(new[] { "$$$" }, StringSplitOptions.None)[0]:null,
                                    Type = 0,
                                    CreatedOn = DateTime.UtcNow,
                                    Status = 0
                                };
                                db.Message.Add(msg);
                            }
                            else
                                return Ok(new ApiResult(1, "already add like"));
                        }

                        if (action.Equals("remove"))
                        {
                            if (article.GroupName.Split(',').ToList().Contains(jwtResult.JwtUser.User))
                            {
                                var list = article.GroupName.Split(',').ToList();
                                list.Remove(jwtResult.JwtUser.User);
                                article.GroupName = string.Join(",", list);
                            }
                            else
                                return Ok(new ApiResult(2, "already remove like"));
                        }

                        db.SaveChanges();
                    }
                    else
                        return Ok(new ApiResult(3, "Article not found"));

                    return Ok(new ApiResult(0, "success"+ jwtResult.JwtUser.User));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getarticlebyid")]
        [HttpPost]
        public IHttpActionResult GetArticleById()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                int articleId = int.Parse(HttpContext.Current.Request["ArticleId"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {

                    var article = db.Article.FirstOrDefault(a => a.Id == articleId);
                    if (article != null)
                    {
                        var advancedArticle = new AdvancedArticle(article);
                        advancedArticle.ImageUrl = Helpers.GetFirstImageSrc(article.Content);
                        return Ok(new ApiResult(0, advancedArticle));
                    }
                    else
                    {
                        return Ok(new ApiResult(3, "Article not found"));
                    }

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getuser")]
        [HttpPost]
        public IHttpActionResult GetUser()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var user = db.UserProfile.FirstOrDefault(u => u.UserName == targetUser);
                    userInfo.UserName = user.UserName;
                    userInfo.NickName = user.NickName??user.UserName;
                    userInfo.Sex = user.Sex??0;
                    userInfo.Photo = user.Photo;
                    userInfo.Location = user.Location;
                    userInfo.Admins = user.Admins;
                    userInfo.Point = user.Point;
                    userInfo.Signature = user.Signature;
                    userInfo.Cover = user.Cover;
                    userInfo.Type = user.Type;
                    userInfo.Email = user.Email;
                    userInfo.HideLocation = (user.PrivacyShowLocation == 1);
                    userInfo.AllowTenTimeline = (user.PrivacyViewTs == 1);

                    if (user.Type == 0)
                    {
                        var findFriends = db.UserFriend.FirstOrDefault(f => (f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser && f.Approve == 1) ||
                        (f.UserName == targetUser && f.Watch == jwtResult.JwtUser.User && f.Approve == 1));
                        userInfo.IsFriend = findFriends != null;

                        if (userInfo.IsFriend)
                            userInfo.NoteName = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser && f.Approve == 1).NoteName;
                    }
                    else
                    {
                        var findPubFocus = db.Article.FirstOrDefault(a => a.Type == 22 &&
                        (a.GroupName.StartsWith(targetUser + ",") ||
                        a.GroupName.EndsWith("," + targetUser))
                        &&
                        (a.GroupName.StartsWith(jwtResult.JwtUser.User + ",") ||
                        a.GroupName.EndsWith("," + jwtResult.JwtUser.User)));
                        userInfo.IsFriend = findPubFocus != null;
                    }
                    
                    return Ok(userInfo);

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("searchuser")]
        [HttpPost]
        public IHttpActionResult SearchUser()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //userset status 0: can be searched by username
                    //sys status 0: normal user, others: forbidden user
                    var user = db.UserProfile.FirstOrDefault(u=>u.UserName == targetUser && u.SystemStatus==0 && u.UserSetStatus==0);
                    if (user != null)
                    {
                        return Ok(new ApiResult(0, "success"));
                    }
                    else
                    {
                        return Ok(new ApiResult(404, "user not found"));
                    }
                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changeprivacy")]
        [HttpPost]
        public IHttpActionResult ChangePrivacy()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetType = HttpContext.Current.Request["targetType"];
                string targetValue = HttpContext.Current.Request["targetValue"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                    if(targetType=="location")
                    {
                        target.PrivacyShowLocation = (targetValue == "True" ? 1 : 0);
                        db.SaveChanges();
                    }
                    if (targetType == "timeline")
                    {
                        target.PrivacyViewTs = (targetValue == "True" ? 1 : 0);
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changenotename")]
        [HttpPost]
        public IHttpActionResult ChangeNoteName()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                string targetNoteName = HttpContext.Current.Request["targetNoteName"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.UserFriend.FirstOrDefault(uf => uf.UserName == jwtResult.JwtUser.User && uf.Watch == targetUser&& uf.Approve==1);
                    target.NoteName = targetNoteName;
                    db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changelocation")]
        [HttpPost]
        public IHttpActionResult ChangeLocation()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string location = HttpContext.Current.Request["location"];
                string tag = HttpContext.Current.Request["tag"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                decimal lat = js.Deserialize<decimal>(HttpContext.Current.Request["lat"]);
                decimal lng = js.Deserialize<decimal>(HttpContext.Current.Request["lng"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    if (!string.IsNullOrWhiteSpace(location))
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);

                        if (target != null)
                        {
                            target.Location = location;
                            target.Lat = lat;
                            target.Lng = lng;
                            if (tag == "shake")
                            {
                                target.LastShakeOn = DateTime.UtcNow;
                            }
                               
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(2, "user not exist:" + jwtResult.JwtUser.User));
                        }
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getusersbylocation")]
        [HttpPost]
        public IHttpActionResult GetUsersByLocation()
        {
            IEnumerable<UserProfile> query = null;

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                
                JavaScriptSerializer js = new JavaScriptSerializer();
                int type = js.Deserialize<int>(HttpContext.Current.Request["type"]);
                decimal latCenter = js.Deserialize<decimal>(HttpContext.Current.Request["latCenter"]);
                decimal lngCenter = js.Deserialize<decimal>(HttpContext.Current.Request["lngCenter"]);
                decimal latLow = js.Deserialize<decimal>(HttpContext.Current.Request["latLow"]);
                decimal latHigh = js.Deserialize<decimal>(HttpContext.Current.Request["latHigh"]);
                decimal lngLow = js.Deserialize<decimal>(HttpContext.Current.Request["lngLow"]);
                decimal lngHigh = js.Deserialize<decimal>(HttpContext.Current.Request["lngHigh"]);
                int min = js.Deserialize<int>(HttpContext.Current.Request["min"]);


                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var pageCount = 100;

                    if (min == 0)
                    {
                        query = (from u in db.UserProfile
                                 where (type==-1 || u.Sex == type)
                                    && u.SystemStatus == 0 && u.PrivacyShowLocation==0 && u.Lat != null && u.Lng != null && u.UserName != jwtResult.JwtUser.User &&
                                    u.Lat < latHigh && u.Lat > latLow &&
                                    u.Lng < lngHigh && u.Lng > lngLow //has bug in the middle across 0 degree
                                 select new AdvancedUserProfile
                                 {
                                     UserName = u.UserName,
                                     Email = u.Email,
                                     Sex = u.Sex,
                                     Signature = u.Signature,
                                     Photo = u.Photo,
                                     NickName = u.NickName,
                                     Cover = u.Cover,
                                     Location = u.Location,
                                     Lat = u.Lat,
                                     Lng = u.Lng,
                                     Distance = (u.Lat - latCenter) > 0 ? (u.Lat - latCenter) : (u.Lat - latCenter) * -1 +
                                        (u.Lng - lngCenter) > 0 ? (u.Lng - lngCenter) : (u.Lng - lngCenter) * -1,
                                 })
                            .Take(pageCount).OrderBy(n => n.Distance);
                    }
                    else
                    {
                        var limit = DateTime.UtcNow.AddMinutes(-min);
                        query = (from u in db.UserProfile
                                 where (type == -1 || u.Sex == type) 
                                    && u.SystemStatus == 0 && u.PrivacyShowLocation == 0 && u.Lat != null && u.Lng != null && u.UserName != jwtResult.JwtUser.User &&
                                    u.LastShakeOn >= limit &&
                                    u.Lat < latHigh && u.Lat > latLow &&
                                    u.Lng < lngHigh && u.Lng > lngLow //has bug in the middle across 0 degree
                                 select new AdvancedUserProfile
                                 {
                                     UserName = u.UserName,
                                     Email = u.Email,
                                     Sex = u.Sex,
                                     Signature = u.Signature,
                                     Photo = u.Photo,
                                     NickName = u.NickName,
                                     Cover = u.Cover,
                                     Location = u.Location,
                                     Lat = u.Lat,
                                     Lng = u.Lng,
                                     Distance = (u.Lat - latCenter) > 0 ? (u.Lat - latCenter) : (u.Lat - latCenter) * -1 +
                                        (u.Lng - lngCenter) > 0 ? (u.Lng - lngCenter) : (u.Lng - lngCenter) * -1,
                                 })
                            .Take(pageCount).OrderBy(n => n.Distance);
                    }
                    

                    return Ok(new ApiResult(0, query.ToList()));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changesignature")]
        [HttpPost]
        public IHttpActionResult ChangeSignature()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetSignature = HttpContext.Current.Request["targetSignature"];
                string targetUserName = HttpContext.Current.Request["targetUserName"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    if (!string.IsNullOrWhiteSpace(targetUserName))
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == targetUserName && u.Type != 0
                            && (u.CreatedBy == jwtResult.JwtUser.User ||
                                (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                        u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                        u.Admins.EndsWith("," + jwtResult.JwtUser.User))
                         ));

                        if (target != null)
                        {
                            target.Signature = targetSignature;
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(2, "Can't perform this action:target:" + targetUserName + "current:" + jwtResult.JwtUser.User));
                        }
                    }
                    else
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                        target.Signature = targetSignature;
                        db.SaveChanges();
                    }
                    

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changenickname")]
        [HttpPost]
        public IHttpActionResult ChangeNickName()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetNickName = HttpContext.Current.Request["targetNickName"];
                string targetUserName = HttpContext.Current.Request["targetUserName"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    if (!string.IsNullOrWhiteSpace(targetUserName))
                    {
                        var nickNameExist = db.UserProfile.FirstOrDefault(u => 
                            (u.NickName == targetNickName || u.NickName.Contains(targetNickName)) 
                            && u.Type==1);
                        if (nickNameExist != null)
                            return Ok(new ApiResult(3, "nickname exist"));

                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == targetUserName && u.Type != 0
                            && (u.CreatedBy == jwtResult.JwtUser.User ||
                                (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                        u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                        u.Admins.EndsWith("," + jwtResult.JwtUser.User))
                         ));

                        if (target != null)
                        {
                            target.NickName = targetNickName;
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(2, "Can't perform this action:target:"+targetNickName+"current:"+jwtResult.JwtUser.User));
                        }

                        
                    }
                    else
                    {
                        var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                        target.NickName = targetNickName;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("changesex")]
        [HttpPost]
        public IHttpActionResult ChangeSex()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                JavaScriptSerializer js = new JavaScriptSerializer();
                int userSex = js.Deserialize<int>(HttpContext.Current.Request["UserSex"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {

                    var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);

                    if (target != null)
                    {
                        target.Sex = userSex;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("addfriend")]
        [HttpPost]
        public IHttpActionResult AddFriend()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                string targetNoteName = HttpContext.Current.Request["targetNoteName"];
                string message = HttpContext.Current.Request["message"];
                bool hasPermisson = HttpContext.Current.Request["permission"].Equals("Allow", StringComparison.OrdinalIgnoreCase);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var item = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser);
                    if (item == null)
                    {
                        var uf = new UserFriend();
                        uf.UserName = jwtResult.JwtUser.User;
                        uf.Watch = targetUser;
                        uf.Just = message;
                        uf.RequestOn = DateTime.UtcNow;
                        uf.NoteName = targetNoteName;
                        db.UserFriend.Add(uf);
                    }
                    else
                    {
                        item.Just = item.Just==null?message:item.Just+"\r\n"+message;
                        item.RequestOn = DateTime.UtcNow;
                        item.NoteName = targetNoteName;
                    }

                    db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("removefriend")]
        [HttpPost]
        public IHttpActionResult RemoveFriend()
        {
            UserInfo userInfo = new UserInfo();

            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string targetUser = HttpContext.Current.Request["targetUser"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var itemMe = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == targetUser && f.Approve==1);
                    if(itemMe!=null)
                        db.UserFriend.Remove(itemMe);
                    var itemIt = db.UserFriend.FirstOrDefault(f => f.Watch == jwtResult.JwtUser.User && f.UserName == targetUser && f.Approve == 1);
                    if (itemIt != null)
                        db.UserFriend.Remove(itemIt);

                    if(itemMe!=null&&itemIt!=null)
                        db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("friends")]
        [HttpPost]
        public IHttpActionResult GetFriends()
        {
            IEnumerable<UserFriend> query = null;

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
                    query =  from f in db.UserFriend
                             join u in db.UserProfile on f.Watch equals u.UserName
                             where f.UserName == jwtResult.JwtUser.User && f.Approve==1
                             orderby f.RequestOn descending
                             select new AdvancedUserFriend
                             {
                                 Id = f.Id,
                                 UserName = f.UserName,
                                 Watch = f.Watch,
                                 Just = f.Just,
                                 RequestOn = f.RequestOn,
                                 Approve = f.Approve,
                                 NoteName = f.NoteName,
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex,
                                 Signature = u.Signature,
                             };

                    return Ok(query.ToList());   
                }

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("friendrequests")]
        [HttpPost]
        public IHttpActionResult GetFriendRequests()
        {
            IEnumerable<UserFriend> query = null;

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
                    var pageCount = 100;

                    query = (from f in db.UserFriend
                             join u in db.UserProfile on f.UserName equals u.UserName
                             where f.Watch == jwtResult.JwtUser.User
                             orderby f.RequestOn descending
                             select new AdvancedUserFriend
                             {
                                 Id = f.Id,
                                 UserName = f.UserName,
                                 Watch = f.Watch,
                                 Just = f.Just,
                                 RequestOn = f.RequestOn,
                                 Approve = f.Approve,
                                 NoteName = f.NoteName,
                                 UserNickName = u.NickName,
                                 UserPhoto = u.Photo,
                                 UserSex = u.Sex,
                                 Signature = u.Signature,
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

        [Route("approvefriend")]
        [HttpPost]
        public IHttpActionResult ApproveFriend()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string requestUserName = HttpContext.Current.Request["requestUserName"];
                
                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var item = db.UserFriend.FirstOrDefault(f => f.UserName == requestUserName && f.Watch == jwtResult.JwtUser.User);
                    if (item == null)
                    {
                        return Ok(new ApiResult(3, "Request not found"));
                    }
                    else
                    {
                        item.Approve = 1;
                        
                        var verse = db.UserFriend.FirstOrDefault(f => f.UserName == jwtResult.JwtUser.User && f.Watch == requestUserName);
                        if (verse == null)
                        {
                            var uf = new UserFriend();
                            uf.UserName = jwtResult.JwtUser.User;
                            uf.Watch = requestUserName;
                            uf.Just = "confirmed";
                            uf.RequestOn = DateTime.UtcNow;
                            uf.NoteName = requestUserName;
                            uf.Approve = 1;
                            db.UserFriend.Add(uf);
                        }
                        else
                        {
                            verse.Just = "confirmed";
                            verse.RequestOn = DateTime.UtcNow;
                            verse.NoteName = requestUserName;
                            verse.Approve = 1;
                        }
                    }

                    db.SaveChanges();

                    return Ok(new ApiResult(0, "success"));

                }


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("updateuserphoto")]
        [HttpPost]
        public IHttpActionResult UpdateUserPhoto()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string tag = HttpContext.Current.Request["tag"];//cover|portrait
                string targetUserName = HttpContext.Current.Request["targetUserName"];

                List<string> imageUrls = new List<string>();

                HttpFileCollection hfc = HttpContext.Current.Request.Files;

                if (String.IsNullOrWhiteSpace(tag))
                    return Ok(new ApiResult(1, "No tag"));

                if (hfc.Count == 0)
                    return Ok(new ApiResult(1, "No photo"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                try
                {
                    using (var db = new reddahEntities())
                    {
                        var fileName = "";

                        foreach (string rfilename in HttpContext.Current.Request.Files)
                        {
                            //upload image first
                            string guid = Guid.NewGuid().ToString().Replace("-", "");
                            string uploadedImagePath = "/uploadPhoto/";
                            string uploadImageServerPath = "~" + uploadedImagePath;

                            HttpPostedFile upload = HttpContext.Current.Request.Files[rfilename];

                            try
                            {
                                var fileFormat = upload.FileName.Substring(upload.FileName.LastIndexOf('.')).Replace(".", "");
                                fileName = Path.GetFileName(guid + "." + fileFormat);
                                var filePhysicalPath = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileName);
                                if (!Directory.Exists(HostingEnvironment.MapPath(uploadImageServerPath)))
                                {
                                    Directory.CreateDirectory(HostingEnvironment.MapPath(uploadImageServerPath));
                                }
                                upload.SaveAs(filePhysicalPath);
                                var fileNameUserName = Path.GetFileName(jwtResult.JwtUser.User + "." + fileFormat);
                                var filePhysicalPathUserName = HostingEnvironment.MapPath(uploadImageServerPath + "/" + fileNameUserName);
                                upload.SaveAs(filePhysicalPathUserName);
                                var url = uploadedImagePath + fileName;


                                UploadFile file = new UploadFile();
                                file.Guid = guid;
                                file.Format = fileFormat;
                                file.UserName = jwtResult.JwtUser.User;
                                file.CreatedOn = DateTime.UtcNow;
                                file.GroupName = "";
                                file.Tag = tag;
                                db.UploadFile.Add(file);
                                imageUrls.Add("https://login.reddah.com" + url);
                            }
                            catch (Exception ex)
                            {

                            }
                        }

                        if (!string.IsNullOrWhiteSpace(targetUserName))
                        {
                            var target = db.UserProfile.FirstOrDefault(u => u.UserName == targetUserName && u.Type != 0
                                && (u.CreatedBy == jwtResult.JwtUser.User ||
                                    (u.Admins.StartsWith(jwtResult.JwtUser.User + ",") ||
                                            u.Admins.Contains("," + jwtResult.JwtUser.User + ",") ||
                                            u.Admins.EndsWith("," + jwtResult.JwtUser.User))
                             ));

                            if (target != null)
                            {
                                if (tag.Equals("cover", StringComparison.InvariantCultureIgnoreCase))
                                {
                                    target.Cover = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                                }
                                else
                                {
                                    //portrait
                                    target.Photo = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                                }
                                db.SaveChanges();
                            }
                            else
                            {
                                return Ok(new ApiResult(2, "Can't perform this action:target:" + targetUserName + "current:" + jwtResult.JwtUser.User));
                            }
                        }
                        else
                        {
                            var target = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                            if (tag.Equals("cover", StringComparison.InvariantCultureIgnoreCase))
                            {
                                target.Cover = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                            }
                            else
                            {
                                //portrait
                                target.Photo = string.Format("///login.reddah.com/uploadPhoto/{0}", fileName);
                            }

                            db.SaveChanges();
                        }
            
                    }
                }
                catch (Exception ex)
                {
                    Ok(new ApiResult(3, "Excepion:" + ex.Message.ToString()));
                }


                return Ok(new ApiResult(0, "User "+tag+" photo updated"));

            }
            catch (Exception ex1)
            {
                return Ok(new ApiResult(4, ex1.Message));
            }



        }

        [Route("commentlike")]
        [HttpPost]
        public IHttpActionResult CommentLike()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["id"]);
                bool type = js.Deserialize<bool>(HttpContext.Current.Request["type"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Comment.FirstOrDefault(c => c.Id==id);

                    if (target != null)
                    {
                        if (target.Up == null)
                            target.Up = 0;
                        target.Up += (type ? 1 : -1);
                        if (target.Up < 0)
                            target.Up = 0;
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        /// <summary>
        /// --default 0 as article, 1 as an image link, 2 as an video
        /// --bookmark an image link in content
        /// </summary>
        /// <returns></returns>
        [Route("bookmark")]
        [HttpPost]
        public IHttpActionResult Bookmark()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                
                JavaScriptSerializer js = new JavaScriptSerializer();
                int articleId = js.Deserialize<int>(HttpContext.Current.Request["ArticleId"]);

                string content = HttpContext.Current.Request["Content"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = articleId>0? db.UserArticle.FirstOrDefault(ua => ua.ArticleId==articleId && ua.Type==0)
                        : db.UserArticle.FirstOrDefault(ua => ua.Content==content && ua.Type==1);
                    if(target==null)
                    {
                        db.UserArticle.Add(new UserArticle {
                            UserName = jwtResult.JwtUser.User,
                            ArticleId = articleId,
                            Content =content==null?string.Empty:content,
                            Type = articleId>0?0:1,
                            CreatedOn =DateTime.UtcNow
                        });
                        if (articleId > 0)
                        {
                            var article = db.Article.FirstOrDefault(a => a.Id == articleId);
                            if (article != null)
                            {
                                if (article.Down != null)
                                    article.Down += 1;
                                else
                                    article.Down = 1;
                            }
                        }
                            
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch(DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("deletearticle")]
        [HttpPost]
        public IHttpActionResult DeleteArticle()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.Article.FirstOrDefault(a => a.Id == id);

                    if (target != null)
                    {
                        bool canDelete = false;
                        
                        var pub = db.UserProfile.FirstOrDefault(u => u.UserName == target.UserName);
                        if (pub.Admins.Split(',').Contains(jwtResult.JwtUser.User))
                        {
                            canDelete = true;
                            //log...
                        }
                        var user = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);
                        var query = (from ur in db.webpages_UsersInRoles
                                         join pr in db.webpages_PrivilegesInRoles on ur.RoleId equals pr.RoleId
                                         where ur.UserId == user.UserId && pr.PrivilegeId ==2 //2:delete post permission
                                     select pr.PrivilegeId);
                        if (query.ToList().Count>0) 
                        {
                            canDelete = true;
                            //log...
                        }


                        if(canDelete)
                        {
                            target.Status = -1;
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(1011, "No permission"));
                        }
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("deletecomment")]
        [HttpPost]
        public IHttpActionResult DeleteComment()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var comment = db.Comment.FirstOrDefault(c => c.Id == id);
                    var article = db.Article.FirstOrDefault(a => a.Id == comment.ArticleId);

                    if (comment != null&& article!=null)
                    {
                        var pub = db.UserProfile.FirstOrDefault(u => u.UserName == article.UserName);
                        bool canDelete = false;
                        if (pub.Admins.Split(',').Contains(jwtResult.JwtUser.User))
                        {
                            canDelete = true;
                            //log...
                        }

                        if (comment.UserName == jwtResult.JwtUser.User)
                        {
                            canDelete = true;
                            //log ...
                        }

                        var user = db.UserProfile.FirstOrDefault(u => u.UserName == jwtResult.JwtUser.User);

                        var query = (from ur in db.webpages_UsersInRoles
                                     join pr in db.webpages_PrivilegesInRoles on ur.RoleId equals pr.RoleId
                                     where ur.UserId == user.UserId && pr.PrivilegeId== 3 //3:delete comment permission
                                     select pr.PrivilegeId);
                        if (query.ToList().Count>0) 
                        {
                            canDelete = true;
                            //log...
                        }


                        if(canDelete)
                        {
                            comment.Status = -1;
                            article.Count--;
                            if(comment.ParentId != -1)
                            {
                                var parentComment = db.Comment.FirstOrDefault(c => c.Id == comment.ParentId);
                                if (parentComment != null)
                                {
                                    parentComment.Count--;
                                }
                            }
                            db.SaveChanges();
                        }
                        else
                        {
                            return Ok(new ApiResult(1012, "No permission"));
                        }
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("deletebookmark")]
        [HttpPost]
        public IHttpActionResult DeleteBookmark()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int id = js.Deserialize<int>(HttpContext.Current.Request["Id"]);

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    var target = db.UserArticle.FirstOrDefault(ua => ua.Id == id);
                        
                    if (target != null)
                    {
                        db.UserArticle.Remove(target);
                        if (target.ArticleId > 0)
                        {
                            var article = db.Article.FirstOrDefault(a => a.Id == target.ArticleId);
                            if (article != null)
                            {
                                if (article.Down != null&&article.Down>0)
                                    article.Down -= 1;
                                else
                                    article.Down = 0;
                            }
                        }
                        db.SaveChanges();
                    }

                    return Ok(new ApiResult(0, "success"));
                }
            }
            catch (DbEntityValidationException ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("getbookmarks")]
        [HttpPost]
        public IHttpActionResult GetBookmarks()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];

                JavaScriptSerializer js = new JavaScriptSerializer();
                int[] loadedIds = js.Deserialize<int[]>(HttpContext.Current.Request["loadedIds"]);

                string content = HttpContext.Current.Request["Content"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                using (var db = new reddahEntities())
                {
                    //type:0 article, 1: image, 2: video
                    IEnumerable<AdvancedUserArticle> query = null;
                    int pageCount = 10;
                    query = (from b in db.UserArticle
                             join a in db.Article on b.ArticleId equals a.Id into temp
                             from tt in temp.DefaultIfEmpty()
                             where b.UserName==jwtResult.JwtUser.User &&
                                !(loadedIds).Contains(b.Id)
                             orderby b.Id descending
                             select new AdvancedUserArticle
                             {
                                 Id = b.Id,
                                 UserName = b.UserName,
                                 ArticleId = b.ArticleId,
                                 Title = (b.Type == 0 ? tt.Title : ""),
                                 OrgUserName = (b.Type == 0 ? tt.UserName : ""),
                                 PreviewPhoto = (b.Type == 0 ? tt.Content : b.Content),
                                 article = (b.Type == 0 ? tt : null),
                                 Content= (b.Type==0 ? "" : b.Content),
                                 Type = b.Type,
                                 CreatedOn = b.CreatedOn
                             })
                            .Take(pageCount);
                    
                    var list = query.ToList();
                    foreach(var item in list)
                    {
                        item.PreviewPhoto = Helpers.GetFirstImageSrc(item.PreviewPhoto);
                    }

                    return Ok(new ApiResult(0, list));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("messageunread")]
        [HttpPost]
        public IHttpActionResult MessageUnread()
        {
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
                    return Ok(new ApiResult(0, db.Message.Where(x => x.Status == 0 && x.To == jwtResult.JwtUser.User 
                        //&& x.From!=jwtResult.JwtUser.User//self like/comment not notify self
                    ).ToList()));

                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("messagesetread")]
        [HttpPost]
        public IHttpActionResult MessageSetRead()
        {
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
                    var messages = db.Message.Where(x => x.To == jwtResult.JwtUser.User&&x.Status==0);
                    foreach(var msg in messages)
                    {
                        msg.Status = 1;
                    }
                    db.SaveChanges();

                    return Ok(new ApiResult(0, "Success"));
                }
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

    }
}
