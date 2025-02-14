using System.Collections.Generic;
using System.Threading.Tasks;
using PortAppointmentAPI.Models;

public interface ITruckingCompanyService
{
    Task<IEnumerable<TruckingCompany>> GetAllAsync();
    Task<TruckingCompany> GetByIdAsync(int id);
    Task AddAsync(TruckingCompany truckingCompany);
    Task UpdateAsync(TruckingCompany truckingCompany);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
