using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PortAppointmentAPI.Models;
using PortAppointmentAPI.Services;
using System.Threading.Tasks;

namespace PortAppointmentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticateController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthenticateController> _logger;

        public AuthenticateController(IAuthService authService, ILogger<AuthenticateController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserLogin model)
        {
            _logger.LogInformation("Register process started for Username: {Username}", model.Username);

            var result = await _authService.RegisterAsync(model);
            if (result == "User registered successfully.")
            {
                _logger.LogInformation("Registration completed successfully for Username: {Username}.", model.Username);
                return Ok(result);
            }
            else
            {
                _logger.LogWarning("Registration failed for Username: {Username}.", model.Username);
                return BadRequest(result);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLogin model)
        {
            _logger.LogInformation("Login process started for Username: {Username}", model.Username);

            var token = await _authService.LoginAsync(model);
            if (token != null)
            {
                _logger.LogInformation("Login completed successfully for Username: {Username}.", model.Username);
                return Ok(new { Token = token });
            }
            else
            {
                _logger.LogWarning("Login failed for Username: {Username}.", model.Username);
                return Unauthorized("Invalid credentials.");
            }
        }
    }
}
