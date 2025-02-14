using System;
using System.ComponentModel.DataAnnotations;

namespace PortAppointmentAPI.Models
{
    public class Ship
    {
        [Key] 
        public int Id { get; set; }

        [Required] 
        [StringLength(50)] 
        [RegularExpression(@"^[A-Za-z0-9]+$", ErrorMessage = "Ship number must be alphanumeric.")]
        public string ShipNumber { get; set; }

        [Required] 
        public TimeSpan TimeSlot { get; set; } 
        public bool IsDeleted { get; set; }
        public bool Status { get; set; }      
    }
}
