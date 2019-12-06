using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;

using System.Web.Http;
using System.Linq;
using System.Data.Entity;
using System.Web.Http.Cors;
using Reddah.Web.Login.Utilities;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Web.Script.Serialization;
using System.Data.Entity.Validation;

namespace Reddah.Web.Login.Controllers
{
    /// <summary>
    /// 0 normal
    /// 1 timeline
    /// 2 two chat
    /// 3 group chat 
    /// 4 feedback
    /// 22 two chat pub
    /// </summary>
    [RoutePrefix("api/ai")]
    public class AIController : ApiBaseController
    {
        [Route("nlp")]
        [HttpPost]
        public IHttpActionResult GetNlpChat()
        {
            try
            {
                string jwt = HttpContext.Current.Request["jwt"];
                string content = HttpContext.Current.Request["content"];
                string locale = HttpContext.Current.Request["locale"];


                if (String.IsNullOrWhiteSpace(jwt))
                    return Ok(new ApiResult(1, "No Jwt string"));

                JwtResult jwtResult = AuthController.ValidJwt(jwt);

                if (jwtResult.Success != 0)
                    return Ok(new ApiResult(2, "Jwt invalid" + jwtResult.Message));


                string text = "Hi, I'm a robot";

                return Ok(new ApiResult(0, text));


            }
            catch (Exception ex)
            {
                return Ok(new ApiResult(4, ex.Message));
            }

        }


    }

    
}
