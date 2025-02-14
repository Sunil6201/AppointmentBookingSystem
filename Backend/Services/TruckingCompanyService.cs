using Microsoft.EntityFrameworkCore;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public class TruckingCompanyService : ITruckingCompanyService
{
    private readonly ApplicationDbContext _context;

    public TruckingCompanyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TruckingCompany>> GetAllAsync()
    {
        // Fetch only non-deleted trucking companies
        return await _context.TruckingCompany
            .Where(tc => !tc.IsDeleted)
            .ToListAsync();
    }

    public async Task<TruckingCompany> GetByIdAsync(int id)
    {
        return await _context.TruckingCompany.FindAsync(id);
    }

    public async Task AddAsync(TruckingCompany truckingCompany)
    {
        await _context.TruckingCompany.AddAsync(truckingCompany);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TruckingCompany truckingCompany)
    {
        _context.Entry(truckingCompany).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var truckingCompany = await GetByIdAsync(id);
        if (truckingCompany != null)
        {
            _context.TruckingCompany.Remove(truckingCompany);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.TruckingCompany.AnyAsync(e => e.Id == id);
    }
}
