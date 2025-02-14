using Microsoft.EntityFrameworkCore;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class ShipService : IShipService
{
    private readonly ApplicationDbContext _context;

    public ShipService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Ship>> GetAllAsync()
    {
        // Fetch all ships (only non-deleted)
        return await _context.Ship.Where(s => !s.IsDeleted).ToListAsync();
    }

    public async Task<Ship> GetByIdAsync(int id)
    {
        return await _context.Ship.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted); // Check if not deleted
    }

    public async Task AddAsync(Ship ship)
    {
        await _context.Ship.AddAsync(ship);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Ship ship)
    {
        _context.Entry(ship).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var ship = await GetByIdAsync(id);
        if (ship != null)
        {
            _context.Ship.Remove(ship); // This is a hard delete
            await _context.SaveChangesAsync();
        }
    }

    // New method for soft delete
    public async Task SoftDeleteAsync(int id)
    {
        var ship = await GetByIdAsync(id);
        if (ship != null)
        {
            ship.IsDeleted = true; // Mark as deleted
            _context.Ship.Update(ship); // Update the ship status
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Ship.AnyAsync(e => e.Id == id && !e.IsDeleted); // Check for existence considering soft delete
    }
     public async Task<IEnumerable<Ship>> GetPagedAsync(int pageNumber, int pageSize)
    {
        // Skip the ships based on the page number and fetch only the required number of ships per page
        return await _context.Ship
            .Where(s => !s.IsDeleted)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
}
