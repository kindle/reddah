namespace Reddah.Web.UI.Utility
{
    using System;
    using System.Linq;
    using System.Net.Mail;

    using log4net;

    public static class EmailHelper
    {
        private static readonly ILog log = log4net.LogManager.GetLogger("EmailHelper");

        public static void Send(
            MailAddress from,
            MailAddress to,
            string subject,
            string body
            )
        {
            
            try
            {
                var verifyEmailPassword = string.Empty;
                using (var context = new reddahEntities1())
                {
                    verifyEmailPassword = context.Settings.FirstOrDefault(s => s.Key == "VerifyEmailPassword").Value;
                }
                SmtpClient client = new SmtpClient();
                client.Host = "smtp.reddah.com";
                client.Credentials = new System.Net.NetworkCredential(from.Address, verifyEmailPassword);
                client.EnableSsl = false;
                MailMessage message = new MailMessage(from, to);
                message.Subject = subject;
                message.Body = body; 
                client.Send(message);
            }
            catch (Exception e)
            {
                log.Error(e.Message);
            }
        }
    }
}