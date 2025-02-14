using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace PortAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class DriverController : ControllerBase
    {
        private readonly IDriverService _driverService;
        private readonly ILogger<DriverController> _logger;

        public DriverController(IDriverService driverService, ILogger<DriverController> logger)
        {
            _driverService = driverService;
            _logger = logger;
        }

        
        [HttpGet]
        public async Task<IActionResult> GetDrivers()
        {
            _logger.LogInformation("Fetching all drivers.");
            var drivers = await _driverService.GetAllAsync();
            _logger.LogInformation("Fetched {Count} drivers.", drivers.Count());
            return Ok(drivers);
        }

      
        [HttpGet("paged")]
        public async Task<IActionResult> GetDriversPaged([FromQuery] int start = 0, [FromQuery] int limit = 10)
        {
            _logger.LogInformation("Fetching drivers with pagination. Start: {Start}, Limit: {Limit}", start, limit);

            // Get paginated drivers
            var drivers = await _driverService.GetPagedAsync(start, limit);

            if (!drivers.Any())
            {
                _logger.LogWarning("No drivers found for the specified range.");
                return NotFound("No drivers found for the specified range.");
            }

            _logger.LogInformation("Fetched {Count} drivers for pagination.", drivers.Count());
            return Ok(drivers);
        }

        

        // GET: api/Driver/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDriver(int id)
        {
            _logger.LogInformation("Fetching driver with ID: {Id}", id);
            var driver = await _driverService.GetByIdAsync(id);
            if (driver == null || driver.IsDeleted)
            {
                _logger.LogWarning("Driver with ID: {Id} not found or already deleted.", id);
                return NotFound("Driver not found or already deleted.");
            }
            _logger.LogInformation("Fetched driver with ID: {Id}.", id);
            return Ok(driver);
        }

        // POST: api/Driver
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PostDriver([FromBody] Driver driver)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for driver creation.");
                return BadRequest(ModelState);
            }

            try
            {
                await _driverService.AddAsync(driver);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogWarning("Failed to create driver: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }

            _logger.LogInformation("Driver created with ID: {Id}.", driver.Id);
            return CreatedAtAction(nameof(GetDriver), new { id = driver.Id }, driver);
        }

        // PUT: api/Driver/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutDriver(int id, [FromBody] Driver driver)
        {
            if (id != driver.Id)
            {
                _logger.LogWarning("Driver ID mismatch: received ID {Id}, expected ID {ExpectedId}.", id, driver.Id);
                return BadRequest();
            }

            try
            {
                await _driverService.UpdateAsync(driver);
                _logger.LogInformation("Driver with ID: {Id} updated successfully.", id);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _driverService.ExistsAsync(id))
                {
                    _logger.LogWarning("Driver with ID: {Id} not found during update.", id);
                    return NotFound();
                }
                throw;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogWarning("Failed to update driver: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }

            return NoContent();
        }

        // POST: api/Driver/softdelete/{id}
        [HttpPost("softdelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDeleteDriver(int id)
        {
            var driver = await _driverService.GetByIdAsync(id);

            if (driver == null || driver.IsDeleted)
            {
                _logger.LogWarning("Driver with ID: {Id} not found or already deleted.", id);
                return NotFound("Driver not found or already deleted.");
            }

            // Call the soft delete method from the service
            await _driverService.SoftDeleteAsync(id);
            _logger.LogInformation("Driver with ID: {Id} soft deleted successfully.", id);

            return NoContent();
        }
    }
}
