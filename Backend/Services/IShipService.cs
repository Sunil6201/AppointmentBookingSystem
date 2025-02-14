using System.Collections.Generic;
using System.Threading.Tasks;
using PortAppointmentAPI.Models;

public interface IShipService
{
    Task<IEnumerable<Ship>> GetAllAsync();
    Task<Ship> GetByIdAsync(int id);
    Task AddAsync(Ship ship);
    Task UpdateAsync(Ship ship);
    Task DeleteAsync(int id);
    Task SoftDeleteAsync(int id); // Add soft delete method
    Task<bool> ExistsAsync(int id);
    Task<IEnumerable<Ship>> GetPagedAsync(int pageNumber, int pageSize); 
}
