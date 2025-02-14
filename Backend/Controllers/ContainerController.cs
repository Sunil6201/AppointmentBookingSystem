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

    public class ContainerController : ControllerBase
    {
        private readonly IContainerService _containerService;
        private readonly ILogger<ContainerController> _logger;

        public ContainerController(IContainerService containerService, ILogger<ContainerController> logger)
        {
            _containerService = containerService;
            _logger = logger;
        }

        // GET: api/Container
        [HttpGet]
        public async Task<IActionResult> GetContainers()
        {
            _logger.LogInformation("Fetching all containers.");
            var containers = await _containerService.GetAllAsync(); // Will fetch only non-deleted containers
            _logger.LogInformation("Fetched {Count} containers.", containers.Count());
            return Ok(containers);
        }

        // GET: api/Container/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContainer(int id)
        {
            _logger.LogInformation("Fetching container with ID: {Id}", id);
            var container = await _containerService.GetByIdAsync(id);
            if (container == null || container.IsDeleted) // Check for deleted
            {
                _logger.LogWarning("Container with ID: {Id} not found.", id);
                return NotFound();
            }
            _logger.LogInformation("Fetched container with ID: {Id}.", id);
            return Ok(container);
        }

        // POST: api/Container
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PostContainer([FromBody] Container container)
        {
            // Check for valid model state
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for container creation.");
                return BadRequest(ModelState);
            }

            try
            {
                await _containerService.AddAsync(container);
                _logger.LogInformation("Container created with ID: {Id}.", container.Id);
                return CreatedAtAction(nameof(GetContainer), new { id = container.Id }, container);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating the container.");
                return StatusCode(500, "An error occurred while creating the container.");
            }
        }

        // PUT: api/Container/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutContainer(int id, [FromBody] Container container)
        {
            // Check if the container object is null
            if (container == null)
            {
                _logger.LogWarning("Received a null container object for update.");
                return BadRequest("Container cannot be null.");
            }

            // Validate ID match
            if (id != container.Id)
            {
                _logger.LogWarning("Container ID mismatch: received ID {Id}, expected ID {ExpectedId}.", id, container.Id);
                return BadRequest("Container ID mismatch.");
            }

            try
            {
                // Check if the container exists before attempting to update
                if (!await _containerService.ExistsAsync(id))
                {
                    _logger.LogWarning("Container with ID: {Id} not found during update.", id);
                    return NotFound();
                }

                // Perform the update
                await _containerService.UpdateAsync(container);
                _logger.LogInformation("Container with ID: {Id} updated successfully.", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Concurrency error occurred while updating container with ID: {Id}.", id);
                return Conflict("Concurrency error: The container was updated by another user.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred while updating container with ID: {Id}.", id);
                return StatusCode(500, "An unexpected error occurred.");
            }

            return NoContent();
        }


        // DELETE: api/Container/5 (Hard delete)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteContainer(int id)
        {
            if (!await _containerService.ExistsAsync(id))
            {
                _logger.LogWarning("Container with ID: {Id} not found for deletion.", id);
                return NotFound();
            }

            await _containerService.DeleteAsync(id);
            _logger.LogInformation("Container with ID: {Id} deleted successfully.", id);
            return NoContent();
        }

        // Soft delete: api/Container/softdelete/5
        [HttpPost("softdelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDeleteContainer(int id)
        {
            var container = await _containerService.GetByIdAsync(id);

            if (container == null || container.IsDeleted)
            {
                _logger.LogWarning("Container with ID: {Id} not found or already deleted.", id);
                return NotFound("Container not found or already deleted.");
            }

            // Call the soft delete method from the service
            await _containerService.SoftDeleteAsync(id);
            _logger.LogInformation("Container with ID: {Id} soft deleted successfully.", id);

            return NoContent();
        }
        // GET: api/Container/paged
        [HttpGet("paged")]
        [Authorize(Roles = "Admin,Operator,User")]
        public async Task<IActionResult> GetContainersPaged([FromQuery] int start = 0, [FromQuery] int limit = 10)
        {
            _logger.LogInformation("Fetching containers with pagination. Start: {Start}, Limit: {Limit}", start, limit);

            // Fetch paginated containers using the service
            var containers = await _containerService.GetPagedAsync(start, limit);

            if (!containers.Any())
            {
                _logger.LogWarning("No containers found for the specified range.");
                return NotFound("No containers found for the specified range.");
            }

            _logger.LogInformation("Fetched {Count} containers for pagination.", containers.Count());
            return Ok(containers);
        }

    }
}
