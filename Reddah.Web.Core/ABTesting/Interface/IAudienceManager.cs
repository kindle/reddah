﻿namespace Reddah.Web.Core.ABTesting
{
    using System.Collections.Generic;

    public interface IAudienceManager
    {
        IEnumerable<string> GetCurrentAudiences();
    }
}