using System.Linq;
using System.Collections.Generic;
using System.Web.Http;

namespace Reddah.Web.Login.Controllers
{
    [RoutePrefix("api/values")]
    public class ValuesController : ApiController
    {
        Product[] products = new Product[]
        {
            new Product { Id = 1, Name = "Tomato Soup", Category = "Groceries", Price = 1 },
            new Product { Id = 2, Name = "Yo-yo", Category = "Toys", Price = 3.75M },
            new Product { Id = 3, Name = "Hammer", Category = "Hardware", Price = 16.99M }
        };

        [Route("test")]
        public IEnumerable<Product> GetAllProducts()
        {
            return products;
        }

        [Route("check")]
        [Authorize]
        public IEnumerable<Product> GetAllProductsCheck()
        {
            return products;
        }

        public IHttpActionResult GetProduct(int id)
        {
            var product = products.FirstOrDefault((p) => p.Id == id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }
    }
}
