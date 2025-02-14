using System.Threading.Tasks;
using PortAppointmentAPI.Models;

namespace PortAppointmentAPI.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(UserLogin model);
        Task<string> LoginAsync(UserLogin model);
    }
}
