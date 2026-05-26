using JobTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<ApplicationNote> ApplicationNotes => Set<ApplicationNote>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();

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
    
        modelBuilder.Entity<User>(entity =>
        {
           entity.HasKey(x => x.Id);
           
           entity.Property(x => x.Email).IsRequired().HasMaxLength(255); 

           entity.HasIndex(x => x.Email).IsUnique();

           entity.Property(x => x.PasswordHash).IsRequired();

           entity.Property(x => x.FirstName).IsRequired().HasMaxLength(100);

           entity.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        });
    
        modelBuilder.Entity<JobApplication>()
                    .HasOne(x => x.User)
                    .WithMany(x => x.JobApplications)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
    
        modelBuilder.Entity<ApplicationNote>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Content)
                .IsRequired()
                .HasMaxLength(5000);

            entity.HasOne(x => x.JobApplication)
                .WithMany(x => x.ApplicationNotes)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApplicationStatusHistory>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasOne(x => x.JobApplication)
                .WithMany(x => x.StatusHistory)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Interview>(entity =>
        {
           entity.HasKey(x => x.Id);

           entity.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

            entity.Property(x => x.InterviewerName)
                .HasMaxLength(200);

            entity.Property(x => x.MeetingLink)
                .HasMaxLength(1000);

            entity.Property(x => x.Location)
                .HasMaxLength(200);

            entity.Property(x => x.Notes)
                .HasMaxLength(5000);

            entity.Property(x => x.Notes)
                .HasMaxLength(5000);

            entity.HasOne(x => x.JobApplication)
                .WithMany(x => x.Interviews)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    
        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.HasOne(x => x.JobApplication)
                .WithMany(x => x.Reminders)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.OriginalFileName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(x => x.StoredFileName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(x => x.ContentType)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasOne(x => x.JobApplication)
                .WithMany(x => x.Documents)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    
        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Subject)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(x => x.Body)
                .IsRequired()
                .HasMaxLength(10000);

            entity.HasOne(x => x.User)
                .WithMany(x => x.EmailTemplates)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
