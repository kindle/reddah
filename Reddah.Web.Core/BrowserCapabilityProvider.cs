namespace Reddah.Web.Core
{
    using Reddah.Core.IoC;
    public delegate string GetUserAgentDelegate();

    [PerWebRequestInstance]
    public class BrowserCapabilityProvider : IBrowserCapabilityProvider
    {
        public bool IsMobile
        {
            get { return false; }
            set {  }
        }

        public bool IsTablet
        {
            get { return false; }
            set { }
        }

        public bool IsDesktop
        {
            get { return true; }
            set { }
        }
    }
}
