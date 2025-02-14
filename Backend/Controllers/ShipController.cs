using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace PortAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ShipController : ControllerBase
    {
        private readonly IShipService _shipService;
        private readonly ILogger<ShipController> _logger;

        public ShipController(IShipService shipService, ILogger<ShipController> logger)
        {
            _shipService = shipService;
            _logger = logger;
        }
        // GET: api/Ship/paged
        // GET: api/Ship/paged
        [HttpGet("paged")]
        public async Task<IActionResult> GetPagedShips([FromQuery] int start = 0, [FromQuery] int limit = 10)
        {
            // Validate parameters
            if (start < 0)
            {
                _logger.LogWarning("Invalid start value: {Start}. Start must be non-negative.", start);
                return BadRequest("Start value must be non-negative.");
            }

            if (limit <= 0)
            {
                _logger.LogWarning("Invalid limit value: {Limit}. Limit must be greater than zero.", limit);
                return BadRequest("Limit must be greater than zero.");
            }

            _logger.LogInformation("Fetching ships with pagination. Start: {Start}, Limit: {Limit}", start, limit);

            // Get paginated ships
            var ships = await _shipService.GetPagedAsync(start, limit);

            if (!ships.Any())
            {
                _logger.LogWarning("No ships found for the specified range.");
                return NotFound("No ships found for the specified range.");
            }

            _logger.LogInformation("Fetched {Count} ships for pagination.", ships.Count());
            return Ok(ships);
        }



        // GET: api/Ship
        [HttpGet]
        public async Task<IActionResult> GetShips()
        {
            _logger.LogInformation("Fetching all ships.");
            var ships = await _shipService.GetAllAsync();
            _logger.LogInformation("Fetched {Count} ships.", ships.Count());
            return Ok(ships);
        }

        // GET: api/Ship/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetShip(int id)
        {
            _logger.LogInformation("Fetching ship with ID: {Id}", id);
            var ship = await _shipService.GetByIdAsync(id);
            if (ship == null)
            {
                _logger.LogWarning("Ship with ID: {Id} not found.", id);
                return NotFound();
            }
            _logger.LogInformation("Fetched ship with ID: {Id}.", id);
            return Ok(ship);
        }

        // POST: api/Ship
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PostShip([FromBody] Ship ship)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for ship creation.");
                return BadRequest(ModelState);
            }

            await _shipService.AddAsync(ship);
            _logger.LogInformation("Ship created with ID: {Id}.", ship.Id);
            return CreatedAtAction(nameof(GetShip), new { id = ship.Id }, ship);
        }

        // PUT: api/Ship/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutShip(int id, [FromBody] Ship ship)
        {
            if (id != ship.Id)
            {
                _logger.LogWarning("Ship ID mismatch: received ID {Id}, expected ID {ExpectedId}.", id, ship.Id);
                return BadRequest();
            }

            try
            {
                await _shipService.UpdateAsync(ship);
                _logger.LogInformation("Ship with ID: {Id} updated successfully.", id);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _shipService.ExistsAsync(id))
                {
                    _logger.LogWarning("Ship with ID: {Id} not found during update.", id);
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Ship/5 (Hard delete)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteShip(int id)
        {
            if (!await _shipService.ExistsAsync(id))
            {
                _logger.LogWarning("Ship with ID: {Id} not found for deletion.", id);
                return NotFound();
            }

            await _shipService.DeleteAsync(id);
            _logger.LogInformation("Ship with ID: {Id} deleted successfully.", id);
            return NoContent();
        }

        // Soft delete: api/Ship/softdelete/5
        [HttpPost("softdelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDeleteShip(int id)
        {
            var ship = await _shipService.GetByIdAsync(id);

            if (ship == null || ship.IsDeleted)
            {
                _logger.LogWarning("Ship with ID: {Id} not found or already deleted.", id);
                return NotFound("Ship not found or already deleted.");
            }

            // Call the soft delete method from the service
            await _shipService.SoftDeleteAsync(id);
            _logger.LogInformation("Ship with ID: {Id} soft deleted successfully.", id);

            return NoContent();
        }
    }
}
