using System.Web.Http;
using System.Web.Http.Cors;

namespace Reddah.Web.Login.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiBaseController : ApiController
    {
        protected const string SecretKey = "abc1234567@reddahcom";

        protected string GetAzureConnectionString()
        {
            return "DefaultEndpointsProtocol=https;AccountName=reddah;AccountKey=znlDoi1mk5+4JEr6H9eux8FsMUGeB5SOxCCxapHFH0JT/PMFjYlEKC81xVHzC9LGv5V8n1iAs2d4oaQ5zauIxQ==;EndpointSuffix=core.windows.net"; ;
        }
    }    
}
