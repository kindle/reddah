using System.Web.Http;
using System.Web.Http.Cors;

namespace Reddah.Web.Login.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiBaseController : ApiController
    {
        protected const string SecretKey = "abc1234567@reddahcom";
    }
}
