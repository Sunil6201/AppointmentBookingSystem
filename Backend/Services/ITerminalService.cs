using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PortAppointmentAPI.Services
{
    public interface ITerminalService
    {
        Task<IEnumerable<Terminal>> GetAllAsync();
        Task<Terminal> GetByIdAsync(int id);
        Task<Terminal> CreateAsync(Terminal terminal);
        Task<Terminal> UpdateAsync(int id, Terminal updatedTerminal);
        Task DeleteAsync(int id);
    }
}
