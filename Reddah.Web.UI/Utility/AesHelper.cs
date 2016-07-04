namespace Reddah.Web.UI.Utility
{
    using System;
    using System.Text;

    public static class AesHelper
    {
        public static string Encrypt(string text, string aesKey, string aesIV)
        {
            return AesProvider.Encrypt(text, Encoding.UTF8.GetBytes(aesKey), Encoding.UTF8.GetBytes(aesIV));
        }

        public static string Decrypt(string textCipher, string aesKey, string aesIV)
        {
            return AesProvider.Decrypt(textCipher, Encoding.UTF8.GetBytes(aesKey), Encoding.UTF8.GetBytes(aesIV));
        }
    }
}