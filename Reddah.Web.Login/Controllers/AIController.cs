using System;

using System.Linq;
using System.Web.Http;
using System.Web;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using Reddah.Web.Login.Utilities;
using System.Text;
using Newtonsoft.Json;
using System.IO;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/ai")]
    public class AIController : ApiBaseController
    {
        /*****************************************/
        /**************text api***************************/
        /*****************************************/
        [Route("nlp")]
        [HttpPost]
        public async Task<IHttpActionResult> GetNlpChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string text = HttpContext.Current.Request["content"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                /*
                if(locale == "zh-CN"|| locale == "zh-TW")
                {
                    return Ok(new ApiResult(0, await this.QqNlp(
                        locale,
                        jwtResult.JwtUser.User,
                        text)));
                }
                else
                {
                    return Ok(new ApiResult(0, await this.GoogleNlp(
                        locale, 
                        jwtResult.JwtUser.User, 
                        text)));
                }*/
                return Ok(new ApiResult(0, await this.QqNlp(
                        locale,
                        jwtResult.JwtUser.User,
                        text)));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }

        [Route("translate")]
        [HttpPost]
        public async Task<IHttpActionResult> GetQqTranslate()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string url = HttpContext.Current.Request["url"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                return Ok(new ApiResult(0, await this.QqAiTextTask(
                    locale,
                    jwtResult.JwtUser.User,
                    url,
                    "translate")));

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("landetect")]
        [HttpPost]
        public async Task<IHttpActionResult> GetQqLanDetect()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string url = HttpContext.Current.Request["url"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                return Ok(new ApiResult(0, await this.QqAiTextTask(
                    locale,
                    jwtResult.JwtUser.User,
                    url,
                    "detect")));

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        

        [Route("audio")]
        [HttpPost]
        public async Task<IHttpActionResult> GetQqAudio()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string url = HttpContext.Current.Request["url"];

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                return Ok(new ApiResult(0, await this.QqAiTextTask(
                    locale,
                    jwtResult.JwtUser.User,
                    url,
                    "audio")));

            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }


        private async Task<string> GoogleNlp(string locale, string user, string text)
        {
            string serviceUrl = "https://console.dialogflow.com/api-client/demo/embedded";
            string projectId = "ee71c857-1854-433c-84e8-78b53b87fd99";
            
            string sessionId = user + "_" + locale;

            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            var endpointUri = String.Format("{0}/{1}/demoQuery?q={2}&sessionId={3}",
                    serviceUrl, projectId, text, sessionId);

            var response = await client.GetAsync(endpointUri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;

            /*
            string serviceUrl = "https://console.dialogflow.com/api-client/demo/embedded";
            string projectId_en_US = "ee71c857-1854-433c-84e8-78b53b87fd99";
            string projectId_zh_CN = "4d498fad-2a1f-4240-9b67-497b0cdac651";

            string projectId = projectId_en_US;
            if (locale == "zh-CN")
                projectId = projectId_zh_CN;

            string sessionId = jwtResult.JwtUser.User + "_" + locale;

            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            var endpointUri = String.Format("{0}/{1}/demoQuery?q={2}&sessionId={3}",
                    serviceUrl, projectId, text, sessionId);

            var response = await client.GetAsync(endpointUri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();*/
        }

        private async Task<string> QqNlp(string locale, string user, string uri)
        {
            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            
            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "chat";
                log.Level = locale;
                log.Logger = user;
                log.Message = uri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.GetAsync(uri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }


        private async Task<string> QqAiTextTask(string locale, string user, string uri, string topic)
        {
            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = topic;
                log.Level = locale;
                log.Logger = user;
                log.Message = uri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.GetAsync(uri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }



        private async Task<string> QqNlp_obelete(string locale, string user, string text, string timestamp)
        {
            string serviceUrl = "https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat";
            int appId = 2127183732;
            string appKey = "493J0jD8PPeNUHNz";

            string sessionId = user + "_" + locale;

            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            Dictionary<string, string> param = new Dictionary<string, string>();
            param.Add("app_id", appId.ToString());
            param.Add("time_stamp", timestamp);
            param.Add("nonce_str", "20e3408a79");
            param.Add("session", "10001");
            param.Add("question", text);
            param.Add("sign", "");

            //var encoding = System.Text.Encoding.GetEncoding("utf-8");

            var endpointUri = String.Format("{0}?app_id={1}&time_stamp={2}&nonce_str={3}&session={4}&question={5}&sign={6}",
                    serviceUrl,
                    param["app_id"],
                    param["time_stamp"],
                    param["nonce_str"],
                    param["session"],
                    param["question"],
                    this.getReqSign(param, appKey));

            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "";
                log.Level = "";
                log.Logger = "";
                log.Message = endpointUri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.GetAsync(endpointUri);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }

        private string getReqSign(Dictionary<string, string> org, string appKey)
        {
            //ksort
            var param = org.OrderBy(a => a.Key).ToDictionary(o=>o.Key, p=>p.Value);

            string str = "";
            foreach(var key in param.Keys){
                string val = param[key];
                if (!string.IsNullOrWhiteSpace(val))
                {
                    str += key + "=" + HttpUtility.UrlEncode(val) + "&";
                }
            }

            str += "app_key=" + appKey;
            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "";
                log.Level = "";
                log.Logger = "str";
                log.Message = str;
                db.Log.Add(log);

                log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = "";
                log.Level = "";
                log.Logger = "md5";
                log.Message = Helpers.Md5(str).ToUpper();
                db.Log.Add(log);

                db.SaveChanges();


            }

            return Helpers.Md5(str).ToUpper();
        }


        /*****************************************/
        /**************image api***************************/
        /*****************************************/
        [Route("qqmusk")]
        [HttpPost]
        public async Task<IHttpActionResult> GetQqMusk()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string url = HttpContext.Current.Request["url"];
                string image = HttpContext.Current.Request["image"];

                /*var fcontent = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("image", image)
                });*/

                var mContent = new MultipartFormDataContent();
                mContent.Add(new StringContent(image), "image");


                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                return Ok(new ApiResult(0, await this.QqAiTaskLong(
                    locale,
                    jwtResult.JwtUser.User,
                    url,
                    mContent, 
                    "qqmusk")));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }

        [Route("pornimagedetect")]
        [HttpPost]
        public async Task<IHttpActionResult> GetQqPornImageDetect()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string url = HttpContext.Current.Request["url"];
                string image = HttpContext.Current.Request["image"];

                var mContent = new MultipartFormDataContent();
                mContent.Add(new StringContent(image), "image");

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                return Ok(new ApiResult(0, await this.QqAiTaskLong(
                    locale,
                    jwtResult.JwtUser.User,
                    url,
                    mContent,
                    "qqporndetect")));
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }


        [Route("qqread")]
        [HttpPost]
        public async Task<IHttpActionResult> GetQqRead()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string locale = HttpContext.Current.Request["locale"];
                string url = HttpContext.Current.Request["url"];
                string image = HttpContext.Current.Request["image"];

                /*var fcontent = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("image", image)
                });*/
                var mContent = new MultipartFormDataContent();
                mContent.Add(new StringContent(image), "image");

                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

                return Ok(new ApiResult(0, await this.QqAiTaskLong(
                    locale,
                    jwtResult.JwtUser.User,
                    url,
                    mContent,
                    "qqread")));
                
            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }
        }
        /*
        private async Task<string> QqAiTask(string locale, string user, string uri, FormUrlEncodedContent content, string thread)
        {
            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = thread;
                log.Level = locale;
                log.Logger = user;
                log.Message = uri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.PostAsync(uri, content);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }*/

        private async Task<string> QqAiTaskLong(string locale, string user, string uri, MultipartFormDataContent content, string thread)
        {
            var client = new HttpClient();
            var queryString = HttpUtility.ParseQueryString(string.Empty);

            using (var db = new reddahEntities())
            {
                var log = new Log();

                log.Date = DateTime.UtcNow;
                log.Thread = thread;
                log.Level = locale;
                log.Logger = user;
                log.Message = uri;
                db.Log.Add(log);
                db.SaveChanges();
            }

            var response = await client.PostAsync(uri, content);

            var strResponseContent = await response.Content.ReadAsStringAsync();

            string responseText = strResponseContent.ToString();

            return responseText;
        }


    }

    


}
