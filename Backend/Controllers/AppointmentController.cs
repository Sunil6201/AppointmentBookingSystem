using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortAppointmentAPI.Data;
using PortAppointmentAPI.Models;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using PortAppointmentAPI.Services;

namespace PortAppointmentAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AppointmentController> _logger;
        private readonly IAppointmentService<Appointment> _appointmentService; // Add this line

        public AppointmentController(ApplicationDbContext context, ILogger<AppointmentController> logger, IAppointmentService<Appointment> appointmentService) // Update constructor
        {
            _context = context;
            _logger = logger;
            _appointmentService = appointmentService; // Initialize the service
        }



        // GET: api/appointment
        [HttpGet]
        [Authorize(Roles = "Admin,Operator,User")]
        public IActionResult GetAppointments()
        {
            _logger.LogInformation("GetAppointments called.");
            var appointments = _context.Appointments
                .Include(a => a.Driver)
                .Include(a => a.TruckingCompany)
                .Include(a => a.Ship)
                .Include(a => a.Container)
                .Include(a => a.Terminal)


                .ToList();

            _logger.LogInformation("GetAppointments completed successfully with {Count} records.", appointments.Count);
            return Ok(appointments);
        }

        // GET: api/appointment/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Operator")]
        public IActionResult GetAppointmentById(int id)
        {
            _logger.LogInformation("GetAppointmentById called with Id: {Id}.", id);
            var appointment = _context.Appointments
                .Include(a => a.Container)
                .FirstOrDefault(a => a.Id == id);

            if (appointment == null)
            {
                _logger.LogWarning("Appointment with Id: {Id} not found.", id);
                return NotFound("Appointment not found.");
            }

            _logger.LogInformation("GetAppointmentById completed successfully for Id: {Id}.", id);
            return Ok(appointment);
        }

        // POST: api/appointment
        [HttpPost]
        [Authorize(Roles = "Admin,Customer,User")]
        public IActionResult CreateAppointment([FromBody] Appointment appointment)
        {
            _logger.LogInformation("CreateAppointment called.");

            // Retrieve TruckingCompany, Ship, Driver, and Container details from DB
            var truckingCompany = _context.TruckingCompany.Find(appointment.TruckingCompanyId);
            if (truckingCompany == null) return BadRequest("Invalid TruckingCompanyId");

            var ship = _context.Ship.Find(appointment.ShipId);
            if (ship == null) return BadRequest("Invalid ShipId");

            var driver = _context.Driver.Find(appointment.DriverId);
            if (driver == null) return BadRequest("Invalid DriverId");

            // var container = _context.Container.FirstOrDefault(c => c.ContainerNumber == appointment.ContainerNumber);
            // if (container == null) return BadRequest("Invalid ContainerNumber");

            // Generate the unique ticket number
            string ticketNumber = $"{truckingCompany.Name.Substring(0, 3).ToUpper()}{appointment.Port}";
            appointment.TicketNumber = ticketNumber;

            // Add appointment to DB
            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            _logger.LogInformation("CreateAppointment completed successfully with TicketNumber: {TicketNumber}.", ticketNumber);
            return Ok(appointment);
        }

        // PUT: api/appointment/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult UpdateAppointment(int id, [FromBody] Appointment updatedAppointment)
        {
            _logger.LogInformation("UpdateAppointment called for Id: {Id}.", id);

            if (id != updatedAppointment.Id)
            {
                _logger.LogWarning("Appointment ID mismatch for Id: {Id}.", id);
                return BadRequest("Appointment ID mismatch");
            }

            var existingAppointment = _context.Appointments.Find(id);
            if (existingAppointment == null)
            {
                _logger.LogWarning("Appointment with Id: {Id} not found.", id);
                return NotFound("Appointment not found");
            }

            // Update fields
            existingAppointment.AppointmentDate = updatedAppointment.AppointmentDate;
            // existingAppointment.ContainerNumber = updatedAppointment.ContainerNumber;
            existingAppointment.Port = updatedAppointment.Port;
            existingAppointment.UserId = updatedAppointment.UserId;
            existingAppointment.TruckingCompanyId = updatedAppointment.TruckingCompanyId;
            existingAppointment.ShipId = updatedAppointment.ShipId;
            existingAppointment.DriverId = updatedAppointment.DriverId;
            existingAppointment.TicketNumber = updatedAppointment.TicketNumber;

            _context.Appointments.Update(existingAppointment);
            _context.SaveChanges();

            _logger.LogInformation("UpdateAppointment completed successfully for Id: {Id}.", id);
            return Ok(existingAppointment);
        }

        // PATCH: api/appointment/{id}/delete
        [HttpPatch("{id}/delete")] // Ensure this matches your Angular service call
        [Authorize(Roles = "Admin,User")] // Keep the authorization if needed
        public IActionResult SoftDeleteAppointment(int id)
        {
            _logger.LogInformation("SoftDeleteAppointment called for Id: {Id}.", id);

            // Find the appointment
            var appointment = _context.Appointments.Find(id);
            if (appointment == null)
            {
                _logger.LogWarning("Appointment with Id: {Id} not found.", id);
                return NotFound("Appointment not found");
            }

            // Check if already soft deleted
            if (appointment.IsDeleted)
            {
                _logger.LogWarning("Appointment with Id: {Id} is already deleted.", id);
                return BadRequest("Appointment is already deleted");
            }

            // Perform the soft delete
            appointment.IsDeleted = true;
            _context.Appointments.Update(appointment);
            _context.SaveChanges();

            _logger.LogInformation("SoftDeleteAppointment completed successfully for Id: {Id}.", id);
            return NoContent(); // Return 204 No Content if successful

        }

        // GET: api/appointment/download
        [HttpGet]
        [Route("download")]
        [Authorize(Roles = "Admin,Operator")]
        public IActionResult DownloadAppointments()
        {
            _logger.LogInformation("DownloadAppointments called.");
            var appointments = _context.Appointments.Include(a => a.Container).ToList(); // Fetch data from DB with Container

            // Create Excel workbook and worksheet
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Appointments");
                var currentRow = 1;

                // Add headers
                worksheet.Cell(currentRow, 1).Value = "Id";
                worksheet.Cell(currentRow, 2).Value = "AppointmentDate";
                worksheet.Cell(currentRow, 3).Value = "ContainerNumber";
                worksheet.Cell(currentRow, 4).Value = "Port";
                worksheet.Cell(currentRow, 5).Value = "UserId";
                worksheet.Cell(currentRow, 6).Value = "TruckingCompanyId";
                worksheet.Cell(currentRow, 7).Value = "ShipId";
                worksheet.Cell(currentRow, 8).Value = "DriverId";
                worksheet.Cell(currentRow, 12).Value = "TicketNumber";
                worksheet.Cell(currentRow, 13).Value = "ContainerDetails"; // New field for container details

                // Add data rows
                foreach (var appointment in appointments)
                {
                    currentRow++;
                    worksheet.Cell(currentRow, 1).Value = appointment.Id;
                    worksheet.Cell(currentRow, 2).Value = appointment.AppointmentDate;
                    // worksheet.Cell(currentRow, 3).Value = appointment.ContainerNumber;
                    worksheet.Cell(currentRow, 4).Value = appointment.Port;
                    worksheet.Cell(currentRow, 5).Value = appointment.UserId;
                    worksheet.Cell(currentRow, 6).Value = appointment.TruckingCompanyId;
                    worksheet.Cell(currentRow, 7).Value = appointment.ShipId;
                    worksheet.Cell(currentRow, 8).Value = appointment.DriverId;
                    worksheet.Cell(currentRow, 12).Value = appointment.TicketNumber;
                }

                // Save workbook to memory stream
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();

                    _logger.LogInformation("DownloadAppointments completed successfully.");
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "appointments.xlsx");
                }
            }
        }

        // GET: api/appointment/download-logs
        [HttpGet]
        [Route("download-logs")]
        [Authorize(Roles = "Admin,User")]
        public IActionResult DownloadLogs()
        {
            _logger.LogInformation("DownloadLogs called.");

            // Directory for log files
            var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");

            // Get the latest log file with the pattern "port-appointment-*.log"
            var latestLogFile = new DirectoryInfo(logDirectory)
                .GetFiles("port-appointment-*.log") // Pattern matching your log file naming convention
                .OrderByDescending(f => f.LastWriteTime)
                .FirstOrDefault();

            // Check if the log file exists
            if (latestLogFile == null)
            {
                _logger.LogWarning("No log file found in the Logs directory.");
                return NotFound("No log file found.");
            }

            // Open the log file with FileStream to allow shared read access
            try
            {
                using (var logStream = new FileStream(latestLogFile.FullName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    byte[] logBytes;
                    using (var memoryStream = new MemoryStream())
                    {
                        logStream.CopyTo(memoryStream);
                        logBytes = memoryStream.ToArray();
                    }

                    _logger.LogInformation("DownloadLogs completed successfully with file: {FileName}.", latestLogFile.Name);
                    return File(logBytes, "text/plain", "port-appointment-logs.txt");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while reading the log file.");
                return StatusCode(500, "An error occurred while downloading the log file.");
            }
        }
        // POST: api/appointment/{id}/approve
        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveAppointment(int id)
        {
            _logger.LogInformation("ApproveAppointment called for Id: {Id}.", id);
            try
            {
                var appointment = await _appointmentService.ApproveAppointmentAsyncNew(id);
                _logger.LogInformation("ApproveAppointment completed successfully for Id: {Id}.", id);
                return Ok(appointment);
            }
            catch (KeyNotFoundException)
            {
                _logger.LogWarning("Appointment with Id: {Id} not found for approval.", id);
                return NotFound("Appointment not found");
            }
        }

        // POST: api/appointment/{id}/reject
        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectAppointment(int id)
        {
            _logger.LogInformation("RejectAppointment called for Id: {Id}.", id);
            try
            {
                var appointment = await _appointmentService.RejectAppointmentAsync(id);
                _logger.LogInformation("RejectAppointment completed successfully for Id: {Id}.", id);
                return Ok(appointment);
            }
            catch (KeyNotFoundException)
            {
                _logger.LogWarning("Appointment with Id: {Id} not found for rejection.", id);
                return NotFound("Appointment not found");
            }
        }
        [HttpGet("paged")]
        [Authorize(Roles = "Admin,Operator,User")]
        public async Task<IActionResult> GetAppointmentsPaged([FromQuery] int start = 0, [FromQuery] int limit = 10)
        {
            _logger.LogInformation("Fetching appointments with pagination. Start: {Start}, Limit: {Limit}", start, limit);

            // Fetch paginated appointments using the service
            var appointments = await _appointmentService.GetPagedAppointmentsAsync(start, limit);

            if (!appointments.Any())
            {
                _logger.LogWarning("No appointments found for the specified range.");
                return NotFound("No appointments found for the specified range.");
            }

            _logger.LogInformation("Fetched {Count} appointments for pagination.", appointments.Count());
            return Ok(appointments);
        }


    }


}