namespace PortAppointmentAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Port { get; set; }
        public int UserId { get; set; }
        public int TruckingCompanyId { get; set; }
        public int ShipId { get; set; }
        public int DriverId { get; set; }
        public int ContainerId { get; set; }
        public int TerminalId { get; set; } // New foreign key for Terminal
        public string TicketNumber { get; set; }
        public bool IsDeleted { get; set; }
        public string AppointmentStatus { get; set; } = "Pending"; // New status field

        // Navigation properties
        public virtual Driver? Driver { get; set; }
        public virtual TruckingCompany? TruckingCompany { get; set; }
        public virtual UserLogin? UserLogin { get; set; }
        public virtual Ship? Ship { get; set; }
        public virtual Container? Container { get; set; }
        public virtual Terminal? Terminal { get; set; } // Navigation property for Terminal
    }
}
