namespace Reddah.Web.UI.Models
{
    using System.Collections.Generic;

    public class DeflectionModule
    {
        // common
        public string Id { get; set; }
        public string Type { get; set; }
        public bool Visible { get; set; }
        public string Title { get; set; }

        // Hard deflection properties
        public string ButtonText { get; set; }
        public string ButtonLink { get; set; }
        public string Description { get; set; }

        // Soft deflection properties
        public Dictionary<string, string> Articles { get; set; }

        public DeflectionModule()
        {
            Articles = new Dictionary<string, string>();
        }
    }

}