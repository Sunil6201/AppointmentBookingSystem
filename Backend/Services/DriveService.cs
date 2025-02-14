using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;

public class DriverService : IDriverService
{
    private readonly ApplicationDbContext _context;

    public DriverService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Fetch only non-deleted drivers
    public async Task<IEnumerable<Driver>> GetAllAsync()
    {
        return await _context.Driver.Where(d => !d.IsDeleted).ToListAsync(); // Filter out deleted drivers
    }

    public async Task<Driver> GetByIdAsync(int id)
    {
        return await _context.Driver.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted); // Ensure only non-deleted driver is fetched
    }

    public async Task AddAsync(Driver driver)
    {
        if (await IsDuplicate(driver))
        {
            throw new DbUpdateException("Driver with the same mobile number, license number, or vehicle number already exists.");
        }

        await _context.Driver.AddAsync(driver);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Driver driver)
    {
        if (await IsDuplicate(driver))
        {
            throw new DbUpdateException("Driver with the same mobile number, license number, or vehicle number already exists.");
        }

        _context.Entry(driver).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    // Soft delete method implementation
    public async Task SoftDeleteAsync(int id)
    {
        var driver = await GetByIdAsync(id);
        if (driver != null)
        {
            driver.IsDeleted = true; // Set IsDeleted to true
            _context.Driver.Update(driver);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Driver.AnyAsync(e => e.Id == id && !e.IsDeleted); // Check existence considering IsDeleted
    }
    public async Task<IEnumerable<Driver>> GetPagedAsync(int start, int limit)
    {
        return await _context.Driver
            .Where(d => !d.IsDeleted) // Only non-deleted drivers
            .OrderBy(d => d.Id)       // Order by ID
            .Skip(start)              // Skip the starting point
            .Take(limit)              // Take the specified number of records
            .ToListAsync();
    }
    private async Task<bool> IsDuplicate(Driver driver)
    {
        
        return await _context.Driver.AnyAsync(d =>
            (d.DriverMobileNumber == driver.DriverMobileNumber && d.Id != driver.Id && !d.IsDeleted) ||
            (d.LicenseNumber == driver.LicenseNumber && d.Id != driver.Id && !d.IsDeleted) ||
            (d.VehicleNumber == driver.VehicleNumber && d.Id != driver.Id && !d.IsDeleted));
    }
}
