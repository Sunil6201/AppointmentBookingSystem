using System.ComponentModel.DataAnnotations;

namespace PortAppointmentAPI.Models
{
    public class Driver
    {
        [Required]
        public string DriverName { get; set; } 
        public int Id { get; set; }
        
        [Required]
        [MaxLength(15)]
        [RegularExpression(@"^\+?[1-9]\d{1,14}$", ErrorMessage = "Invalid mobile number format.")]
        public string DriverMobileNumber { get; set; }
        
        
        [Required]
        public string LicenseNumber { get; set; } 
        
        [Required]
        public string VehicleNumber { get; set; } 
        
        public bool IsDeleted { get; set; } = false; 
        
        public bool Status { get; set; } 
    }
}
