using Microsoft.EntityFrameworkCore;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PortAppointmentAPI.Services
{
    public class AppointmentService : IAppointmentService<Appointment>
    {
        private readonly ApplicationDbContext _context;

        public AppointmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Appointment>> GetAllAsync()
        {
            return await _context.Appointments
                .Include(a => a.Driver)
                .Include(a => a.TruckingCompany)
                .Include(a => a.Ship)
                .Include(a => a.Container)
                .ToListAsync();
        }

        public async Task<Appointment> GetByIdAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Container)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            var truckingCompany = await _context.TruckingCompany.FindAsync(appointment.TruckingCompanyId);
            if (truckingCompany == null) throw new ArgumentException("Invalid TruckingCompanyId");

            var ship = await _context.Ship.FindAsync(appointment.ShipId);
            if (ship == null) throw new ArgumentException("Invalid ShipId");

            var driver = await _context.Driver.FindAsync(appointment.DriverId);
            if (driver == null) throw new ArgumentException("Invalid DriverId");

            var container = await _context.Container.FirstOrDefaultAsync(c => c.Id == appointment.ContainerId);
            if (container == null) throw new ArgumentException("Invalid ContainerNumber");

            appointment.TicketNumber = $"{truckingCompany.Name.Substring(0, 3).ToUpper()}{appointment.Port}";

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<Appointment> UpdateAsync(int id, Appointment updatedAppointment)
        {
            if (id != updatedAppointment.Id)
            {
                throw new ArgumentException("Appointment ID mismatch");
            }

            var existingAppointment = await _context.Appointments.FindAsync(id);
            if (existingAppointment == null)
            {
                throw new KeyNotFoundException("Appointment not found");
            }

            existingAppointment.AppointmentDate = updatedAppointment.AppointmentDate;
            existingAppointment.ContainerId = updatedAppointment.ContainerId;
            existingAppointment.Port = updatedAppointment.Port;
            existingAppointment.UserId = updatedAppointment.UserId;
            existingAppointment.TruckingCompanyId = updatedAppointment.TruckingCompanyId;
            existingAppointment.ShipId = updatedAppointment.ShipId;
            existingAppointment.DriverId = updatedAppointment.DriverId;
            existingAppointment.TicketNumber = updatedAppointment.TicketNumber;

            _context.Appointments.Update(existingAppointment);
            await _context.SaveChangesAsync();
            return existingAppointment;
        }

        public async Task DeleteAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                throw new KeyNotFoundException("Appointment not found");
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
        }
        public async Task<Appointment> ApproveAppointmentAsyncNew(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                throw new KeyNotFoundException("Appointment not found");
            }

            appointment.AppointmentStatus = "Approved";
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<Appointment> RejectAppointmentAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                throw new KeyNotFoundException("Appointment not found");
            }

            appointment.AppointmentStatus = "Rejected";
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public Task ApproveAppointmentAsync(int id)
        {
            throw new NotImplementedException();
        }
        public async Task<List<Appointment>> GetPagedAppointmentsAsync(int start, int limit)
        {
            // Use skip and take for pagination
            return await _context.Appointments
                .Include(a => a.Driver)
                .Include(a => a.TruckingCompany)
                .Include(a => a.Ship)
                .Include(a => a.Container)
                .Include(a => a.Terminal)
                .OrderBy(a => a.AppointmentDate) // Optional: Sorting by a specific column
                .Skip(start)   // Skipping the specified number of records
                .Take(limit)   // Fetching the specified number of records
                .ToListAsync();
        }

    }

}
