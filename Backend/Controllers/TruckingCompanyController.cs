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
   
    public class TruckingCompanyController : ControllerBase
    {
        private readonly ITruckingCompanyService _truckingCompanyService;
        private readonly ILogger<TruckingCompanyController> _logger;

        public TruckingCompanyController(ITruckingCompanyService truckingCompanyService, ILogger<TruckingCompanyController> logger)
        {
            _truckingCompanyService = truckingCompanyService;
            _logger = logger;
        }

        // GET: api/TruckingCompany
        [HttpGet]
        public async Task<IActionResult> GetTruckingCompanies()
        {
            _logger.LogInformation("Fetching all trucking companies.");
            var truckingCompanies = await _truckingCompanyService.GetAllAsync();
            _logger.LogInformation("Fetched {Count} trucking companies.", truckingCompanies.Count());
            return Ok(truckingCompanies);
        }

        // GET: api/TruckingCompany/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTruckingCompany(int id)
        {
            _logger.LogInformation("Fetching trucking company with ID: {Id}", id);
            var truckingCompany = await _truckingCompanyService.GetByIdAsync(id);
            if (truckingCompany == null || truckingCompany.IsDeleted)
            {
                _logger.LogWarning("Trucking company with ID: {Id} not found or deleted.", id);
                return NotFound();
            }
            _logger.LogInformation("Fetched trucking company with ID: {Id}.", id);
            return Ok(truckingCompany);
        }

        // POST: api/TruckingCompany
        [HttpPost]
         [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PostTruckingCompany([FromBody] TruckingCompany truckingCompany)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for trucking company creation.");
                return BadRequest(ModelState);
            }

            await _truckingCompanyService.AddAsync(truckingCompany);
            _logger.LogInformation("Trucking company created with ID: {Id}.", truckingCompany.Id);
            return CreatedAtAction(nameof(GetTruckingCompany), new { id = truckingCompany.Id }, truckingCompany);
        }

        // PUT: api/TruckingCompany/5
        [HttpPut("{id}")]
         [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutTruckingCompany(int id, [FromBody] TruckingCompany truckingCompany)
        {
            if (id != truckingCompany.Id)
            {
                _logger.LogWarning("Trucking company ID mismatch: received ID {Id}, expected ID {ExpectedId}.", id, truckingCompany.Id);
                return BadRequest();
            }

            try
            {
                await _truckingCompanyService.UpdateAsync(truckingCompany);
                _logger.LogInformation("Trucking company with ID: {Id} updated successfully.", id);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _truckingCompanyService.ExistsAsync(id))
                {
                    _logger.LogWarning("Trucking company with ID: {Id} not found during update.", id);
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/TruckingCompany/5
        [HttpDelete("{id}")]
         [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTruckingCompany(int id)
        {
            if (!await _truckingCompanyService.ExistsAsync(id))
            {
                _logger.LogWarning("Trucking company with ID: {Id} not found for deletion.", id);
                return NotFound();
            }

            await _truckingCompanyService.DeleteAsync(id);
            _logger.LogInformation("Trucking company with ID: {Id} deleted successfully.", id);
            return NoContent();
        }

        // POST: api/TruckingCompany/softdelete/{id}
        [HttpPost("softdelete/{id}")]
         [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDeleteTruckingCompany(int id)
        {
            var truckingCompany = await _truckingCompanyService.GetByIdAsync(id);

            if (truckingCompany == null || truckingCompany.IsDeleted)
            {
                _logger.LogWarning("Trucking company with ID: {Id} not found or already deleted.", id);
                return NotFound("Trucking company not found.");
            }

            // Set IsDeleted to true instead of deleting the record
            truckingCompany.IsDeleted = true;
            await _truckingCompanyService.UpdateAsync(truckingCompany);
            _logger.LogInformation("Trucking company with ID: {Id} soft deleted successfully.", id);

            return NoContent();
        }
    }
}
