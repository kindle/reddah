namespace Reddah.Web.Core.ABTesting
{
    using System.Collections.Generic;

    public interface ITargetingTagResolver
    {
        List<string> GetTargetingTags();
    }
}
