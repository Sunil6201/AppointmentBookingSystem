using Microsoft.EntityFrameworkCore;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class ContainerService : IContainerService
{
    private readonly ApplicationDbContext _context;

    public ContainerService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Container>> GetAllAsync()
    {
        // Fetch all containers (only non-deleted)
        return await _context.Container.Where(c => !c.IsDeleted).ToListAsync();
    }

    public async Task<Container> GetByIdAsync(int id)
    {
        // Fetch the container by ID (considering soft delete)
        return await _context.Container.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
    }

    public async Task AddAsync(Container container)
    {
        await _context.Container.AddAsync(container);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Container container)
    {
        _context.Entry(container).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var container = await GetByIdAsync(id);
        if (container != null)
        {
            _context.Container.Remove(container); // This is a hard delete
            await _context.SaveChangesAsync();
        }
    }

    // New method for soft delete
    public async Task SoftDeleteAsync(int id)
    {
        var container = await GetByIdAsync(id);
        if (container != null)
        {
            container.IsDeleted = true; // Mark as deleted
            _context.Container.Update(container); // Update the container status
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        // Check for existence considering soft delete
        return await _context.Container.AnyAsync(e => e.Id == id && !e.IsDeleted);
    }
    public async Task<IEnumerable<Container>> GetPagedAsync(int start, int limit)
{
    // Use skip and take for pagination and fetch only non-deleted containers
    return await _context.Container
        .Where(c => !c.IsDeleted)
        .OrderBy(c => c.Id) // Optional: you can change sorting criteria
        .Skip(start)
        .Take(limit)
        .ToListAsync();
}

}
