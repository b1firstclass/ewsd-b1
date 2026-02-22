using System;
using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Identity;

namespace CMS.Application.Utilities
{
    public class Argon2PasswordHasher<T> : IPasswordHasher<T>  where T : class
    {
        private const int SaltSize = 16; // 128-bit
        private const int Iterations = 3;
        private const int MemorySize = 65536; // 64MB in KB
        private const int HashSize = 32; // 256-bit hash

        public string HashPassword(T user, string password)
        {
            var salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            var hash = Hash(password, salt);
            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        public PasswordVerificationResult VerifyHashedPassword(T user, string hashedPassword, string providedPassword)
        {
            var parts = hashedPassword.Split(':');
            if (parts.Length != 2)
                return PasswordVerificationResult.Failed;

            var salt = Convert.FromBase64String(parts[0]);
            var hash = Convert.FromBase64String(parts[1]);
            var providedHash = Hash(providedPassword, salt);

            if (CryptographicOperations.FixedTimeEquals(hash, providedHash))
                return PasswordVerificationResult.Success;
            else
                return PasswordVerificationResult.Failed;
        }

        private byte[] Hash(string password, byte[] salt)
        {
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = Environment.ProcessorCount,
                Iterations = Iterations,
                MemorySize = MemorySize
            };
            return argon2.GetBytes(HashSize);
        }
    }
}
