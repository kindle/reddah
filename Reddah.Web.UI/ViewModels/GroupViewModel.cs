namespace Reddah.Web.UI.ViewModels
{
    using System.Linq;

    public class GroupViewModel
    {
        public Group Group { get; set; }
        
        public GroupViewModel(string groupName)
        {
            Group = GetGroup(groupName);
        }

        private Group GetGroup(string groupName)
        {
            Group result = null;
            using (var db = new reddahEntities1())
            {
                result = db.Groups.FirstOrDefault(x => x.Name.Equals(groupName));
            }

            return result;
        }
    }
}