using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Reddah.Encryption
{
    public class AesProvider
    {
        /// <summary>
        /// Encrypts the specified text info.
        /// </summary>
        /// <param name="text">The plain text.</param>
        /// <param name="key">The key.</param>
        /// <param name="iv">The iv.</param>
        /// <returns></returns>
        public static string Encrypt(string text, byte[] key, byte[] iv)
        {
            if (String.IsNullOrEmpty(text))
                return String.Empty;

            byte[] encryptedText;

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
                            encryptedText = msEncrypt.ToArray();
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                return String.Empty;
            }

            // Return the encrypted bytes from the memory stream.
            return Convert.ToBase64String(encryptedText);
        }

        /// <summary>
        /// Decrypts the specified text cipher.
        /// </summary>
        /// <param name="textCipher">The text cipher.</param>
        /// <param name="key">The key.</param>
        /// <param name="iv">The iv.</param>
        /// <returns></returns>
        public static string Decrypt(string textCipher, byte[] key, byte[] iv)
        {
            // Declare the string used to hold the decrypted text.
            string textString = String.Empty;

            if (String.IsNullOrEmpty(textCipher))
                return textString;

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
                            textString = srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
            return textString;
        }
    }
}
