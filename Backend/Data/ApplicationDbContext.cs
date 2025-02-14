using Microsoft.EntityFrameworkCore;
using PortAppointmentAPI.Models;

namespace PortAppointmentAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<UserLogin> UserLogin { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<TruckingCompany> TruckingCompany { get; set; }
        public DbSet<Ship> Ship { get; set; }
        public DbSet<Driver> Driver { get; set; }
        public DbSet<Container> Container { get; set; }
        public DbSet<Terminal> Terminals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Driver)
                .WithMany()
                .HasForeignKey(a => a.DriverId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.TruckingCompany)
                .WithMany()
                .HasForeignKey(a => a.TruckingCompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.UserLogin)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Ship)
                .WithMany()
                .HasForeignKey(a => a.ShipId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Container)
                .WithMany()
                .HasForeignKey(a => a.ContainerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Terminal)
                .WithMany()
                .HasForeignKey(a => a.TerminalId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Driver>()
                .HasIndex(d => d.DriverMobileNumber)
                .IsUnique()
                .HasDatabaseName("IX_Driver_DriverMobileNumber");

            modelBuilder.Entity<Driver>()
                .HasIndex(d => d.LicenseNumber)
                .IsUnique()
                .HasDatabaseName("IX_Driver_LicenseNumber");

            modelBuilder.Entity<Driver>()
                .HasIndex(d => d.VehicleNumber)
                .IsUnique()
                .HasDatabaseName("IX_Driver_VehicleNumber");

            modelBuilder.Entity<Ship>()
                .HasIndex(s => s.ShipNumber)
                .IsUnique()
                .HasDatabaseName("IX_Ship_ShipNumber");

            modelBuilder.Entity<Container>()
                .HasIndex(c => c.ContainerNumber)
                .IsUnique()
                .HasDatabaseName("IX_Container_ContainerNumber");
        }
    }
}
