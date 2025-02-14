using System.Collections.Generic;
using System.Threading.Tasks;
using PortAppointmentAPI.Models;

namespace PortAppointmentAPI.Services
{
    public interface IAppointmentService<T>
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> GetByIdAsync(int id);
        Task<T> CreateAsync(T appointment);
        Task<T> UpdateAsync(int id, T updatedAppointment);
        Task DeleteAsync(int id);
        Task ApproveAppointmentAsync(int id);
         // New method signatures for approval and rejection
        Task<T> ApproveAppointmentAsyncNew(int id);
        Task<T> RejectAppointmentAsync(int id);
         public Task<List<Appointment>> GetPagedAppointmentsAsync(int start, int limit);
        
    }
}
