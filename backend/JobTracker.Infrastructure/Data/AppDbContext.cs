using JobTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.CompanyName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.JobTitle)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Location)
                .HasMaxLength(200);

            entity.Property(x => x.JobUrl)
                .HasMaxLength(1000);

            entity.Property(x => x.SalaryRange)
                .HasMaxLength(100);

            entity.Property(x => x.Notes)
                .HasMaxLength(5000);
        });
    }
}
