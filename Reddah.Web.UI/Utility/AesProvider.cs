namespace Reddah.Web.UI.Utility
{
    using System;
    using System.IO;
    using System.Security.Cryptography;

    public class AesProvider
    {
        public static string Encrypt(string text, byte[] key, byte[] iv)
        {
            if (String.IsNullOrEmpty(text))
                return String.Empty;

            byte[] encryptedUserInfo;

            try
            {
                // Create an AesCryptoServiceProvider object with the specified key and IV.
                using (var aesAlg = new AesCryptoServiceProvider())
                {
                    aesAlg.Key = key;
                    aesAlg.IV = iv;

                    // Create a decrytor to perform the stream transform.
                    ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                    // Create the streams used for encryption.
                    using (var msEncrypt = new MemoryStream())
                    {
                        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                        {
                            using (var swEncrypt = new StreamWriter(csEncrypt))
                            {
                                //Write all data to the stream.
                                swEncrypt.Write(text);
                            }
                            encryptedUserInfo = msEncrypt.ToArray();
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                return String.Empty;
            }

            // Return the encrypted bytes from the memory stream.
            return Convert.ToBase64String(encryptedUserInfo);
        }

        public static string Decrypt(string textCipher, byte[] key, byte[] iv)
        {
            // Declare the string used to hold the decrypted text.
            string userInfoString = String.Empty;

            if (String.IsNullOrEmpty(textCipher))
                return userInfoString;

            // Create an AesCryptoServiceProvider object with the specified key and IV.
            using (var aesAlg = new AesCryptoServiceProvider())
            {
                aesAlg.Key = key;
                aesAlg.IV = iv;

                // Create a decrytor to perform the stream transform.
                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for decryption.
                using (var msDecrypt = new MemoryStream(Convert.FromBase64String(textCipher)))
                {
                    using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (var srDecrypt = new StreamReader(csDecrypt))
                        {
                            // Read the decrypted bytes from the decrypting stream and place them in a string.
                            userInfoString = srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
            return userInfoString;
        }
    }
}
