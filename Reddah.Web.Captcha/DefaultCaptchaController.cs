using System;
using System.Web.Mvc;
using CaptchaMvc.Infrastructure;
using CaptchaMvc.Interface;

namespace CaptchaMvc.Controllers
{
    public class DefaultCaptchaController : Controller
    {
        #region Action methods

        public virtual void Generate()
        {
            var parameterContainer = new RequestParameterContainer(Request);
            try
            {
                if (Request.UrlReferrer.AbsolutePath == Request.Url.AbsolutePath)
                    throw new InvalidOperationException();

                IDrawingModel drawingModel =
                    CaptchaUtils.CaptchaManagerFactory(parameterContainer).GetDrawingModel(parameterContainer);
                CaptchaUtils.BuilderProviderFactory(parameterContainer).WriteCaptchaImage(Response, drawingModel);
            }
            catch (Exception)
            {
                CaptchaUtils.BuilderProviderFactory(parameterContainer).WriteErrorImage(Response);
            }
        }

        public virtual ActionResult Refresh()
        {
            var parameterContainer = new RequestParameterContainer(Request);
            if (Request.IsAjaxRequest())
            {
                IUpdateInfoModel updateInfoModel =
                    CaptchaUtils.CaptchaManagerFactory(parameterContainer).Update(parameterContainer);
                return CaptchaUtils.BuilderProviderFactory(parameterContainer).RefreshCaptcha(updateInfoModel);
            }
            return Redirect(Request.UrlReferrer.AbsolutePath);
        }

        #endregion
    }
}