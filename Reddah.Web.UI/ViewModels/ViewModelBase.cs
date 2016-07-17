namespace Reddah.Web.UI.ViewModels
{
    using System.Web;
    using System.Xml;

    public class ViewModelBase
    {
        protected XmlDocument Doc { get; set; }

        public ViewModelBase(string path)
        {
            Init(path);
        }

        protected void Init(string path)
        {
            Doc = new XmlDocument();
            Doc.Load(HttpContext.Current.Server.MapPath("~/App_Data/" + path + ".xml"));
        }

        //move to a common method later
        protected string GetNodeInnerText(XmlNode node)
        {
            if (node == null)
            {
                return string.Empty;
            }

            return node.InnerText;
        }
    }
}