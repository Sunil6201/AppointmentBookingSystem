using System.Collections.Generic;
using System.Threading.Tasks;
using PortAppointmentAPI.Models;

public interface IDriverService
{
    Task<IEnumerable<Driver>> GetAllAsync();
    Task<Driver> GetByIdAsync(int id);
    Task AddAsync(Driver driver);
    Task UpdateAsync(Driver driver);
    // Task DeleteAsync(int id); // Removed delete method
    Task SoftDeleteAsync(int id); // Added method for soft delete
    Task<bool> ExistsAsync(int id);
    public Task<IEnumerable<Driver>> GetPagedAsync(int start, int limit);
}
