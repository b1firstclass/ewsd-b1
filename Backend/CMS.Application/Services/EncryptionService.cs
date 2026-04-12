using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using System.Security.Cryptography;
using System.Text;

namespace CMS.Application.Services
{
    public class EncryptionService : IEncryptionService
    {
        private const int NonceSizeBytes = 12;
        private const int TagSizeBytes = 16;

        private readonly byte[] _key;

        public EncryptionService(EncryptionSettings encryptionSettings)
        {
            _key = Convert.FromBase64String(encryptionSettings.Key);
            if (_key.Length != 32)
                throw new InvalidOperationException("Encryption key must be 256 bits (32 bytes, Base64-encoded).");
        }

        public string Encrypt(string plainText)
        {
            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var nonce = RandomNumberGenerator.GetBytes(NonceSizeBytes);
            var cipherBytes = new byte[plainBytes.Length];
            var tag = new byte[TagSizeBytes];

            using var aes = new AesGcm(_key, TagSizeBytes);
            aes.Encrypt(nonce, plainBytes, cipherBytes, tag);

            var result = new byte[NonceSizeBytes + cipherBytes.Length + TagSizeBytes];
            nonce.CopyTo(result, 0);
            cipherBytes.CopyTo(result, NonceSizeBytes);
            tag.CopyTo(result, NonceSizeBytes + cipherBytes.Length);

            return Convert.ToBase64String(result);
        }

        public string Decrypt(string cipherText)
        {
            var data = Convert.FromBase64String(cipherText);
            var nonce = data[..NonceSizeBytes];
            var tag = data[^TagSizeBytes..];
            var cipherBytes = data[NonceSizeBytes..^TagSizeBytes];
            var plainBytes = new byte[cipherBytes.Length];

            using var aes = new AesGcm(_key, TagSizeBytes);
            aes.Decrypt(nonce, cipherBytes, tag, plainBytes);

            return Encoding.UTF8.GetString(plainBytes);
        }
    }
}
