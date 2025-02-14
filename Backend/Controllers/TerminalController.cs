using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace PortAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TerminalController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TerminalController> _logger;

        public TerminalController(ApplicationDbContext context, ILogger<TerminalController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/terminal
        [HttpGet]
        public IActionResult GetTerminals()
        {
            _logger.LogInformation("GetTerminals called.");
            var terminals = _context.Terminals.Where(t => !t.IsDeleted).ToList(); // Return only non-deleted terminals
            return Ok(terminals);
        }

        // GET: api/terminal/{id}
        [HttpGet("{id}")]
        public IActionResult GetTerminalById(int id)
        {
            var terminal = _context.Terminals.Find(id);
            if (terminal == null || terminal.IsDeleted) return NotFound("Terminal not found.");
            return Ok(terminal);
        }

        // POST: api/terminal
        [HttpPost]
         [Authorize(Roles = "Admin")]
        public IActionResult CreateTerminal([FromBody] Terminal terminal)
        {
            _context.Terminals.Add(terminal);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetTerminalById), new { id = terminal.Id }, terminal);
        }

        // PUT: api/terminal/{id}
        [HttpPut("{id}")]
         [Authorize(Roles = "Admin")]
        public IActionResult UpdateTerminal(int id, [FromBody] Terminal updatedTerminal)
        {
            if (id != updatedTerminal.Id) return BadRequest("Terminal ID mismatch");

            var existingTerminal = _context.Terminals.Find(id);
            if (existingTerminal == null || existingTerminal.IsDeleted) return NotFound("Terminal not found.");

            existingTerminal.TerminalName = updatedTerminal.TerminalName;
            existingTerminal.Location = updatedTerminal.Location;

            _context.Terminals.Update(existingTerminal);
            _context.SaveChanges();

            return NoContent();
        }

        // DELETE: api/terminal/{id}
        [HttpDelete("{id}")]
         [Authorize(Roles = "Admin")]

        public IActionResult DeleteTerminal(int id)
        {
            var terminal = _context.Terminals.Find(id);
            if (terminal == null) return NotFound("Terminal not found.");

            _context.Terminals.Remove(terminal);
            _context.SaveChanges();

            return NoContent();
        }

        // PATCH: api/terminal/soft-delete/{id}
        [HttpPatch("soft-delete/{id}")]
         [Authorize(Roles = "Admin")]

        public IActionResult SoftDeleteTerminal(int id)
        {
            var terminal = _context.Terminals.Find(id);
            if (terminal == null) return NotFound("Terminal not found.");

            // Set IsDeleted to true instead of deleting the record
            terminal.IsDeleted = true;
            _context.SaveChanges();

            return NoContent(); // Return 204 No Content on success
        }
    }
}
