using System;
using System.Web;
using System.Web.Optimization;
using System.Web.Routing;

using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;

namespace SupportWebRole
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AuthConfig.RegisterOpenAuth();
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            //string configValue = RoleEnvironment.GetConfigurationSettingValue("DataConnectionString");
            //var account = CloudStorageAccount.Parse(configValue);
            

            const string accountName = "reachusersubsms";
            const string accountKey = "mZsE1v3NLbnUI74Lsd3Z9ffgneZelmAEZXPxID5kYzH/JfZN1oZxPFKV3Fc25MiDqZMTxWkIfzqiiijZWcZctQ==";
            var account = new CloudStorageAccount(new StorageCredentialsAccountAndKey(accountName, accountKey), false);

            CloudTableClient tableClient = account.CreateCloudTableClient();
            tableClient.CreateTableIfNotExist("NotificationBoard");
        }

        void Application_End(object sender, EventArgs e)
        {
            //  Code that runs on application shutdown

        }

        void Application_Error(object sender, EventArgs e)
        {
            // Code that runs when an unhandled error occurs

        }
    }
}
