using System.Web.Http;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/values")]
    public class ValuesController : ApiController
    {
        [Route("healthcheck")]
        public IHttpActionResult HealthCheck()
        {
            return Ok("live");
        }
    }
}
