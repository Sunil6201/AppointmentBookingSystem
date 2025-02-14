using System.ComponentModel.DataAnnotations;

namespace PortAppointmentAPI.Models
{
    public class Terminal
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Terminal Name is required")]
        public string TerminalName { get; set; }

        [Required(ErrorMessage = "Location is required")]
        public string Location { get; set; }
        
        public bool IsDeleted { get; set; } 
        public Terminal()
        {
            IsDeleted = false; 
        }

        public bool IsActive() => !IsDeleted; 
    }
}
