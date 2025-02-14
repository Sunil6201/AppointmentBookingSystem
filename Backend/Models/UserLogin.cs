using System.ComponentModel.DataAnnotations;

namespace PortAppointmentAPI.Models
{
    public class UserLogin
    {
        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

         [Required]
        public string Password { get; set; } 
        
         [Required] 
        public string Role { get; set; }      
    }

}