using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace PortAppointmentAPI.Services
{
    public class TerminalService
    {
        private readonly ApplicationDbContext _context;

        public TerminalService(ApplicationDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Terminal> GetAllTerminals()
        {
            // Return only non-deleted terminals
            return _context.Terminals.Where(t => !t.IsDeleted).ToList();
        }

        public Terminal GetTerminalById(int id)
        {
            return _context.Terminals.Find(id);
        }

        public void CreateTerminal(Terminal terminal)
        {
            _context.Terminals.Add(terminal);
            _context.SaveChanges();
        }

        public void UpdateTerminal(Terminal terminal)
        {
            _context.Terminals.Update(terminal);
            _context.SaveChanges();
        }

        public void DeleteTerminal(int id)
        {
            var terminal = _context.Terminals.Find(id);
            if (terminal != null)
            {
                // Remove terminal from the context
                _context.Terminals.Remove(terminal);
                _context.SaveChanges();
            }
        }

        // New method for soft delete
        public void SoftDeleteTerminal(int id)
        {
            var terminal = _context.Terminals.Find(id);
            if (terminal != null)
            {
                // Set IsDeleted to true instead of deleting the record
                terminal.IsDeleted = true;
                _context.SaveChanges();
            }
        }
    }
}
