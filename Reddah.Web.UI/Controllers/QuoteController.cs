using System.Web.Mvc;
using System.Linq;
using System.Text;
using System.Net;
using System;
using System.Collections.Generic;

namespace Reddah.Web.UI.Controllers
{
    public class FXModel
    {
        public string FromCurrency;
        public string ToCurrency;
        public string Rate;
        public string Date;
        public string Time;
    }
    public class QuoteController : Controller
    {
        private readonly log4net.ILog log = log4net.LogManager.GetLogger("QuoteController");

        public ActionResult Index() 
        {
            var currencies = new List<FXModel>();
            string[] rates = null;

            StringBuilder codes = new StringBuilder();
            codes.Append("s=USDCNY=X");
            codes.Append(",USDAUD=X");
            codes.Append(",USDEUR=X");
            codes.Append(",USDCAD=X");
            codes.Append(",USDGBP=X");
            codes.Append(",USDJPY=X");
            codes.Append(",USDCHF=X");
            codes.Append(",USDILS=X");

            WebClient wc = new WebClient();
            var response = wc.DownloadString(string.Format("http://finance.yahoo.com/d/quotes.csv?e=.csv&f=sl1d1t1&{0}", codes));

            rates = response.Replace(@"""", "").Replace("=X", "").Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (string rate in rates)
            {
                var split = rate.Split(',');

                currencies.Add(new FXModel
                {
                    FromCurrency = split[0].Substring(0, 3),
                    ToCurrency = split[0].Substring(3, 3),
                    Rate = split[1],
                    Date = split[2],
                    Time = split[3]
                });
            }

            ViewBag.CR = currencies;

            return View("~/Views/Finance/quote.cshtml", currencies);
        }        
    }
}
