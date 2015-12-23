namespace Reddah.Web.Core
{
    public interface IBrowserCapabilityProvider
    {
        bool IsMobile { get; set; }
        bool IsTablet { get; set; }
        bool IsDesktop { get; set; }
    }
}
