using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace PortAppointmentAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AuthService(IConfiguration configuration, ApplicationDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public async Task<string> RegisterAsync(UserLogin model)
        {
            // Check if user already exists
            if (_context.UserLogin.Any(u => u.Username == model.Username))
            {
                throw new ConflictException("User already exists.");
            }

            // Hash the password
            model.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);

            // Save user to the database
            _context.UserLogin.Add(model);
            await _context.SaveChangesAsync();

            return "User registered successfully.";
        }

        public async Task<string> LoginAsync(UserLogin model)
        {
            // Validate user credentials
            var user = await _context.UserLogin.SingleOrDefaultAsync(u => u.Username == model.Username && u.Role == model.Role);
            if (user == null || !VerifyPasswordHash(model.Password, user.Password))
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }

            // Create JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, model.Username),
                    new Claim(ClaimTypes.Role, user.Role), // Use role from the database
                    new Claim("UserId", user.Id.ToString()) // Add UserId claim to the token
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
    }

    [Serializable]
    internal class ConflictException : Exception
    {
        public ConflictException()
        {
        }

        public ConflictException(string? message) : base(message)
        {
        }

        public ConflictException(string? message, Exception? innerException) : base(message, innerException)
        {
        }
    }
}
