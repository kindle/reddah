namespace Reddah.Web.UI
{
    using System.Web.Optimization;

    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            // Clear all items from the default ignore list to allow minified CSS and JavaScript files to be included in debug mode
            bundles.IgnoreList.Clear();
            bundles.IgnoreList.Ignore("*.min.js", OptimizationMode.WhenEnabled);

            //BundleTable.EnableOptimizations = true;

            // Add back the default ignore list rules sans the ones which affect minified files and debug mode
            //bundles.IgnoreList.Ignore("*.intellisense.js");
            //bundles.IgnoreList.Ignore("*-vsdoc.js");
            //bundles.IgnoreList.Ignore("*-min.js");
            //bundles.IgnoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/GridLayout").Include("~/Content/GridLayout.css"));
            bundles.Add(new StyleBundle("~/Content/Shell").Include("~/Content/ShellStyle.css"));
            bundles.Add(new StyleBundle("~/Content/Css").Include("~/Content/site.css"));
            bundles.Add(new StyleBundle("~/Content/ContactSupport").Include("~/Content/ContactSupport.css"));
            bundles.Add(new StyleBundle("~/Content/Wizard").Include("~/Content/Wizard.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/jquery.ui.core.css",
                        "~/Content/themes/base/jquery.ui.resizable.css",
                        "~/Content/themes/base/jquery.ui.selectable.css",
                        "~/Content/themes/base/jquery.ui.accordion.css",
                        "~/Content/themes/base/jquery.ui.autocomplete.css",
                        "~/Content/themes/base/jquery.ui.button.css",
                        "~/Content/themes/base/jquery.ui.dialog.css",
                        "~/Content/themes/base/jquery.ui.slider.css",
                        "~/Content/themes/base/jquery.ui.tabs.css",
                        "~/Content/themes/base/jquery.ui.datepicker.css",
                        "~/Content/themes/base/jquery.ui.progressbar.css",
                        "~/Content/themes/base/jquery.ui.theme.css"));

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));
            //bundles.Add(new ScriptBundle("~/bundles/vsdoc").Include(
            //            "~/Scripts/jquery-{version}-vsdoc.js"));
            bundles.Add(new ScriptBundle("~/bundles/min").Include(
                        "~/Scripts/jquery-{version}.min.js"));
            bundles.Add(new ScriptBundle("~/bundles/angularjs").Include(
                        "~/Scripts/angular-{version}.js"));
            bundles.Add(new ScriptBundle("~/bundles/silverlight").Include(
                        "~/Content/js/Silverlight.js"));
            bundles.Add(new ScriptBundle("~/bundles/videoplayer").Include(
                        "~/Content/js/Videoplayer.js"));
            bundles.Add(new ScriptBundle("~/bundles/common").Include(
                        "~/Content/js/Common.js"));
            bundles.Add(new ScriptBundle("~/bundles/contactus").Include(
                        "~/Content/js/ContactUs.js"));
            bundles.Add(new ScriptBundle("~/bundles/contactus.displaymodule").Include(
                        "~/Content/js/ContactUs.DisplayModule.js"));
            bundles.Add(new ScriptBundle("~/bundles/wizard").Include(
                        "~/Content/js/wizard.js"));
            
        }
    }
}