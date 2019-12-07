using System;

using System.Web.Http;
using System.Web;
using System.Net.Http;
using System.Threading.Tasks;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/ai")]
    public class AIController : ApiBaseController
    {
        [Route("nlp")]
        [HttpPost]
        public async Task<IHttpActionResult> GetNlpChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string text = HttpContext.Current.Request["content"];
                string locale = HttpContext.Current.Request["locale"];


                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));

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

                string responseText = strResponseContent.ToString();

                return Ok(new ApiResult(0, responseText));


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }


    }

    
}
