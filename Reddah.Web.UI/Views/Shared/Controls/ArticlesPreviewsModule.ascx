<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<%@ Import Namespace="System.Globalization" %>
<%@ Import Namespace="Reddah.Web.UI.Models" %>
<div class="BrowsePreviewsContent">
    <div id="DeflectionGlobalContainer" style="width:745px;">
    <%--@{
        //DeflectionModule dm = Model.Deflection;

        //if (dm.Visible)
        //{
        //    Html.RenderPartial("~/views/Shared/Controls/DeflectionModule.cshtml", dm);
        //}
    }--%>
    </div>
    <%foreach (var article in ViewData.Model as List<ArticlePreview>)
    {
        if (!String.IsNullOrEmpty(article.Title) && !String.IsNullOrEmpty(article.Description) && !String.IsNullOrEmpty(article.ArticleUrl))
        {%>
            <div class="BrowsePreview">
                <div class="BrowsePreviewTitle">
                <a href="/<%=CultureInfo.CurrentUICulture.Name%>/articles/<%=@article.ArticleUrl%>"><%=Html.Raw(article.Title)%></a>
                </div>
                <%if (!String.IsNullOrEmpty(article.ImageUrl))
                {%>
                    <div style="float: left;">                
                        <a href="/<%=CultureInfo.CurrentUICulture.Name%>/articles/<%=@article.ArticleUrl%>">
                            <img class="BrowsePreviewImage" src="<%=@article.ImageUrl%>" alt="picture">
                        </a>
                    </div>
                <%}%>
                    <div>
                        <%=Html.Raw(article.Description)%>
                    </div>

                <div class="StartModuleLiner" style="width: 100%;"></div>
            </div>
        <%}
    }%>
</div>