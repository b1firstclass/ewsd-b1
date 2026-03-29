using System;
using System.Collections.Generic;
using CMS.Domain.Entities;
using CMS.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Persistence;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Contribution> Contributions { get; set; }

    public virtual DbSet<ContributionWindow> ContributionWindows { get; set; }

    public virtual DbSet<Document> Documents { get; set; }

    public virtual DbSet<Faculty> Faculties { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserActivityLog> UserActivityLogs { get; set; }

    public virtual DbSet<vw_BrowserList> vw_BrowserLists { get; set; }

    public virtual DbSet<vw_ContributionCountByFacultyAcademicYear> vw_ContributionCountByFacultyAcademicYears { get; set; }

    public virtual DbSet<vw_ContributionPercentageByFacultyAcademicYear> vw_ContributionPercentageByFacultyAcademicYears { get; set; }

    public virtual DbSet<vw_ContributionsWithoutComment> vw_ContributionsWithoutComments { get; set; }

    public virtual DbSet<vw_ContributionsWithoutCommentAfter14Day> vw_ContributionsWithoutCommentAfter14Days { get; set; }

    public virtual DbSet<vw_PageAccessCount> vw_PageAccessCounts { get; set; }

    public virtual DbSet<vw_UserActivityCount> vw_UserActivityCounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("Categories_pkey");

            entity.HasIndex(e => e.Name, "Categories_Name_key").IsUnique();

            entity.Property(e => e.CategoryId).ValueGeneratedNever();
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("Comments_pkey");

            entity.Property(e => e.CommentId).ValueGeneratedNever();
            entity.Property(e => e.Comment1)
                .HasMaxLength(500)
                .HasColumnName("Comment");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Poster).HasMaxLength(200);

            entity.HasOne(d => d.Contribution).WithMany(p => p.Comments)
                .HasForeignKey(d => d.ContributionId)
                .HasConstraintName("Comments_ContributionId_fkey");
        });

        modelBuilder.Entity<Contribution>(entity =>
        {
            entity.HasKey(e => e.ContributionId).HasName("Contributions_pkey");

            entity.Property(e => e.ContributionId).ValueGeneratedNever();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Subject).HasMaxLength(100);

            entity.HasOne(d => d.Category).WithMany(p => p.Contributions)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Contributions_CategoryId_fkey");

            entity.HasOne(d => d.ContributionWindow).WithMany(p => p.Contributions)
                .HasForeignKey(d => d.ContributionWindowId)
                .HasConstraintName("Contributions_ContributionWindowId_fkey");

            entity.HasOne(d => d.Faculty).WithMany(p => p.Contributions)
                .HasForeignKey(d => d.FacultyId)
                .HasConstraintName("Contributions_FacultyId_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Contributions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("Contributions_UserId_fkey");
        });

        modelBuilder.Entity<ContributionWindow>(entity =>
        {
            entity.HasKey(e => e.ContributionWindowId).HasName("ContributionWindows_pkey");

            entity.Property(e => e.ContributionWindowId).ValueGeneratedNever();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.DocumentId).HasName("Documents_pkey");

            entity.HasIndex(e => e.FileName, "Documents_FileName_key").IsUnique();

            entity.Property(e => e.DocumentId).ValueGeneratedNever();
            entity.Property(e => e.Extension).HasMaxLength(100);
            entity.Property(e => e.FileName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Contribution).WithMany(p => p.Documents)
                .HasForeignKey(d => d.ContributionId)
                .HasConstraintName("Documents_ContributionId_fkey");
        });

        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.HasKey(e => e.FacultyId).HasName("Faculties_pkey");

            entity.HasIndex(e => e.FacultyName, "Faculties_FacultyName_key").IsUnique();

            entity.Property(e => e.FacultyId).ValueGeneratedNever();
            entity.Property(e => e.FacultyName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasMany(d => d.Users).WithMany(p => p.Faculties)
                .UsingEntity<Dictionary<string, object>>(
                    "FacultyMemberShip",
                    r => r.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .HasConstraintName("FacultyMemberShip_UserId_fkey"),
                    l => l.HasOne<Faculty>().WithMany()
                        .HasForeignKey("FacultyId")
                        .HasConstraintName("FacultyMemberShip_FacultyId_fkey"),
                    j =>
                    {
                        j.HasKey("FacultyId", "UserId").HasName("FacultyMemberShip_pkey");
                        j.ToTable("FacultyMemberShip");
                    });
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId).HasName("Permissions_pkey");

            entity.HasIndex(e => new { e.Module, e.Name }, "Permissions_Module_Name_idx").IsUnique();

            entity.HasIndex(e => e.Name, "Permissions_Name_key").IsUnique();

            entity.Property(e => e.PermissionId).ValueGeneratedNever();
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Module).HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("Roles_pkey");

            entity.HasIndex(e => e.Name, "Roles_Name_key").IsUnique();

            entity.Property(e => e.RoleId).ValueGeneratedNever();
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "Roles_Permission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .HasConstraintName("Roles_Permissions_PermissionId_fkey"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .HasConstraintName("Roles_Permissions_RoleId_fkey"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("Roles_Permissions_pkey");
                        j.ToTable("Roles_Permissions");
                    });
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("Users_pkey");

            entity.HasIndex(e => e.Email, "Users_Email_key").IsUnique();

            entity.HasIndex(e => e.LoginId, "Users_LoginId_key").IsUnique();

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LastLoginIp).HasMaxLength(50);
            entity.Property(e => e.LoginId).HasMaxLength(50);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.RefreshToken).HasMaxLength(200);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("Users_RoleId_fkey");
        });

        modelBuilder.Entity<UserActivityLog>(entity =>
        {
            entity.HasKey(e => e.ActivityId).HasName("UserActivityLogs_pkey");

            entity.Property(e => e.ActivityId).ValueGeneratedNever();
            entity.Property(e => e.Browser).HasMaxLength(100);
            entity.Property(e => e.BrowserVersion).HasMaxLength(50);
            entity.Property(e => e.Device).HasMaxLength(100);
            entity.Property(e => e.EventType).HasMaxLength(20);
            entity.Property(e => e.HttpMethod).HasMaxLength(50);
            entity.Property(e => e.IpAddress).HasMaxLength(100);
            entity.Property(e => e.OS).HasMaxLength(50);
            entity.Property(e => e.OsVersion).HasMaxLength(50);
            entity.Property(e => e.Resource).HasMaxLength(200);
            entity.Property(e => e.StatusCode).HasMaxLength(10);
            entity.Property(e => e.UserAgent).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.UserActivityLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("UserActivityLogs_UserId_fkey");
        });

        modelBuilder.Entity<vw_BrowserList>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_BrowserList");

            entity.Property(e => e.Browser).HasMaxLength(100);
        });

        modelBuilder.Entity<vw_ContributionCountByFacultyAcademicYear>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ContributionCountByFacultyAcademicYear");

            entity.Property(e => e.FacultyName).HasMaxLength(200);
        });

        modelBuilder.Entity<vw_ContributionPercentageByFacultyAcademicYear>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ContributionPercentageByFacultyAcademicYear");

            entity.Property(e => e.FacultyName).HasMaxLength(200);
        });

        modelBuilder.Entity<vw_ContributionsWithoutComment>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ContributionsWithoutComments");

            entity.Property(e => e.FacultyName).HasMaxLength(200);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.Subject).HasMaxLength(100);
        });

        modelBuilder.Entity<vw_ContributionsWithoutCommentAfter14Day>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ContributionsWithoutCommentAfter14Days");

            entity.Property(e => e.FacultyName).HasMaxLength(200);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.Subject).HasMaxLength(100);
        });

        modelBuilder.Entity<vw_PageAccessCount>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_PageAccessCount");

            entity.Property(e => e.Resource).HasMaxLength(200);
        });

        modelBuilder.Entity<vw_UserActivityCount>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_UserActivityCount");

            entity.Property(e => e.FullName).HasMaxLength(200);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
