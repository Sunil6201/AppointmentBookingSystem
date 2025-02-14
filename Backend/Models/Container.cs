using System.ComponentModel.DataAnnotations;

namespace PortAppointmentAPI.Models
{
    public class Container
    {
        public int Id { get; set; }

        [Required] 
        [StringLength(50)] 
        [RegularExpression(@"^[A-Za-z0-9]+$", ErrorMessage = "Container number must be alphanumeric.")]
        public string ContainerNumber { get; set; }

        [Required] 
        public string Type { get; set; }

        [Required] 
        public string Size { get; set; }

        public bool IsDeleted { get; set; }
        public bool Status { get; set; }
    }
}
