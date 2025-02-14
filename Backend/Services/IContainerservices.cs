using System.Collections.Generic;
using System.Threading.Tasks;
using PortAppointmentAPI.Models;

public interface IContainerService
{
    Task<IEnumerable<Container>> GetAllAsync();
    Task<Container> GetByIdAsync(int id);
    Task AddAsync(Container container);
    Task UpdateAsync(Container container);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    
    // New method for soft deleting a container
    Task SoftDeleteAsync(int id);
    Task<IEnumerable<Container>> GetPagedAsync(int start, int limit);

}
