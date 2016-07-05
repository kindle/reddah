using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Web.WebPages.OAuth;
using Reddah.Web.UI.Models;

namespace Reddah.Web.UI
{
    public static class AuthConfig
    {
        public static void RegisterAuth()
        {
            // To let users of this site log in using their accounts from other sites such as Microsoft, Facebook, and Twitter,
            // you must update this site. For more information visit http://go.microsoft.com/fwlink/?LinkID=252166

            OAuthWebSecurity.RegisterMicrosoftClient(
                clientId: "5fdcd60d-94ed-41c6-9504-b39084d10e94",
                clientSecret: "2qLfgS3pzSdUGPsUzJkxcHS");

            OAuthWebSecurity.RegisterTwitterClient(
                consumerKey: "2",
                consumerSecret: "2");

            OAuthWebSecurity.RegisterFacebookClient(
                appId: "502631609934876",
                appSecret: "5a99d9537b74a7b5afbed2d75eced0e6");

            OAuthWebSecurity.RegisterGoogleClient();
        }
    }
}
