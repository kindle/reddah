using System;
using System.Collections.Generic;
using System.Web.Mvc;
using CaptchaMvc.Infrastructure;
using CaptchaMvc.Interface;
using CaptchaMvc.Models;
using JetBrains.Annotations;

namespace CaptchaMvc.HtmlHelpers
{
    public static class CaptchaHelper
    {
        #region Public methods

        public static ICaptcha Captcha(this HtmlHelper htmlHelper, int length, params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.LengthAttribute, length));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha Captcha(this HtmlHelper htmlHelper, string refreshText, string inputText,
                                       int length, params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.InputTextAttribute, inputText));
            list.Add(new ParameterModel(DefaultCaptchaManager.RefreshTextAttribute, refreshText));
            list.Add(new ParameterModel(DefaultCaptchaManager.LengthAttribute, length));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha Captcha(this HtmlHelper htmlHelper, string refreshText, string inputText,
                                       int length, string requiredMessageText, bool addValidationSpan = false,
                                       params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.InputTextAttribute, inputText));
            list.Add(new ParameterModel(DefaultCaptchaManager.RefreshTextAttribute, refreshText));
            list.Add(new ParameterModel(DefaultCaptchaManager.LengthAttribute, length));
            list.Add(new ParameterModel(DefaultCaptchaManager.IsRequiredAttribute, true));
            list.Add(new ParameterModel(DefaultCaptchaManager.RequiredMessageAttribute, requiredMessageText));
            list.Add(new ParameterModel(DefaultCaptchaManager.IsNeedValidationSpanAttribute, addValidationSpan));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha Captcha(this HtmlHelper htmlHelper, int length,
                                       [AspMvcPartialView] string partialViewName,
                                       ViewDataDictionary viewData = null, params ParameterModel[] parameters)
        {
            Validate.ArgumentNotNullOrEmpty(partialViewName, "partialViewName");
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.LengthAttribute, length));
            list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewNameAttribute, partialViewName));
            if (viewData != null)
                list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewDataAttribute, viewData));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha Captcha(this HtmlHelper htmlHelper, int length,
                                       [AspMvcPartialView] string partialViewName,
                                       [AspMvcPartialView] string scriptPartialViewName,
                                       ViewDataDictionary viewData = null, params ParameterModel[] parameters)
        {
            Validate.ArgumentNotNullOrEmpty(partialViewName, "partialViewName");
            Validate.ArgumentNotNullOrEmpty(scriptPartialViewName, "scriptPartialViewName");
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.LengthAttribute, length));
            list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewNameAttribute, partialViewName));
            list.Add(new ParameterModel(DefaultCaptchaManager.ScriptPartialViewNameAttribute, scriptPartialViewName));
            if (viewData != null)
                list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewDataAttribute, viewData));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha MathCaptcha(this HtmlHelper htmlHelper, params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.MathCaptchaAttribute, true));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha MathCaptcha(this HtmlHelper htmlHelper, string refreshText, string inputText,
                                           params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.InputTextAttribute, inputText));
            list.Add(new ParameterModel(DefaultCaptchaManager.RefreshTextAttribute, refreshText));
            list.Add(new ParameterModel(DefaultCaptchaManager.MathCaptchaAttribute, true));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha MathCaptcha(this HtmlHelper htmlHelper, string refreshText, string inputText,
                                           string requiredMessageText, bool addValidationSpan = false,
                                           params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.InputTextAttribute, inputText));
            list.Add(new ParameterModel(DefaultCaptchaManager.RefreshTextAttribute, refreshText));
            list.Add(new ParameterModel(DefaultCaptchaManager.MathCaptchaAttribute, true));
            list.Add(new ParameterModel(DefaultCaptchaManager.IsRequiredAttribute, true));
            list.Add(new ParameterModel(DefaultCaptchaManager.RequiredMessageAttribute, requiredMessageText));
            list.Add(new ParameterModel(DefaultCaptchaManager.IsNeedValidationSpanAttribute, addValidationSpan));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha MathCaptcha(this HtmlHelper htmlHelper, [AspMvcPartialView] string partialViewName,
                                           ViewDataDictionary viewData = null, params ParameterModel[] parameters)
        {
            Validate.ArgumentNotNullOrEmpty(partialViewName, "partialViewName");
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.MathCaptchaAttribute, true));
            list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewNameAttribute, partialViewName));
            if (viewData != null)
                list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewDataAttribute, viewData));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static ICaptcha MathCaptcha(this HtmlHelper htmlHelper, [AspMvcPartialView] string partialViewName,
                                           [AspMvcPartialView] string scriptPartialViewName,
                                           ViewDataDictionary viewData = null,
                                           params ParameterModel[] parameters)
        {
            Validate.ArgumentNotNullOrEmpty(partialViewName, "partialViewName");
            Validate.ArgumentNotNullOrEmpty(scriptPartialViewName, "scriptPartialViewName");
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.MathCaptchaAttribute, true));
            list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewNameAttribute, partialViewName));
            list.Add(new ParameterModel(DefaultCaptchaManager.ScriptPartialViewNameAttribute, scriptPartialViewName));
            if (viewData != null)
                list.Add(new ParameterModel(DefaultCaptchaManager.PartialViewDataAttribute, viewData));
            return CaptchaUtils.GenerateCaptcha(htmlHelper, list);
        }

        public static bool IsCaptchaValid(this ControllerBase controllerBase, string errorText,
                                          params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.ErrorAttribute, errorText));
            return CaptchaUtils.ValidateCaptcha(controllerBase, list);
        }

        public static ICaptchaManager GetCaptchaManager(this ControllerBase controllerBase)
        {
            return CaptchaUtils.CaptchaManagerFactory(
                new RequestParameterContainer(controllerBase.ControllerContext.HttpContext.Request));
        }

        public static ICaptchaBuilderProvider GetCaptchaBuilderProvider(this ControllerBase controllerBase)
        {
            return CaptchaUtils.BuilderProviderFactory(
                new RequestParameterContainer(controllerBase.ControllerContext.HttpContext.Request));
        }

        public static IUpdateInfoModel GenerateCaptchaValue(this ControllerBase controller, int length, params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.LengthAttribute, length));
            var container = new CombinedParameterContainer(new ParameterModelContainer(list), new RequestParameterContainer(controller.ControllerContext.HttpContext.Request));
            return controller.GetCaptchaManager().GenerateNew(controller, container);
        }

        public static IUpdateInfoModel GenerateMathCaptchaValue(this ControllerBase controller, params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            list.Add(new ParameterModel(DefaultCaptchaManager.MathCaptchaAttribute, true));
            var container = new CombinedParameterContainer(new ParameterModelContainer(list), new RequestParameterContainer(controller.ControllerContext.HttpContext.Request));
            return controller.GetCaptchaManager().GenerateNew(controller, container);
        }

        public static ICaptcha AsIntelligent(this ICaptcha captcha, params ParameterModel[] parameters)
        {
            List<ParameterModel> list = CaptchaUtils.GetParameters(parameters);
            var container = new CombinedParameterContainer(new ParameterModelContainer(list), captcha.BuildInfo.ParameterContainer);
            var captchaManager = CaptchaUtils.CaptchaManagerFactory(container);
            if (captchaManager.IntelligencePolicy == null)
                throw new NullReferenceException("The IntelligencePolicy property is null.");
            return captchaManager.IntelligencePolicy.MakeIntelligent(captchaManager, captcha, container);
        }

        #endregion
    }
}