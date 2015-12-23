namespace Reddah.Web.Core.ABTesting
{
    using System;
    using System.Collections.Generic;

    public class AudienceManager : IAudienceManager
    {
        private readonly Func<IBrowserCapabilityProvider> browserCapabilityProvider;

        public AudienceManager(Func<IBrowserCapabilityProvider> browserCapabilityProvider)
        {
            this.browserCapabilityProvider = browserCapabilityProvider;
        }

        public IEnumerable<string> GetCurrentAudiences()
        {
            var audiences = new List<string>() { "all" };

            if (this.browserCapabilityProvider().IsTablet)
            {
                audiences.Add("Tablet");
            }
            else if (this.browserCapabilityProvider().IsMobile)
            {
                audiences.Add("Mobile");
            }
            else
            {
                audiences.Add("Desktop");
            }

            return audiences;
        }
    }
}
