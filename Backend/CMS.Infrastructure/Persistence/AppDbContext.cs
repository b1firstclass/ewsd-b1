using System;
using System.Collections.Generic;
using CMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Persistence;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ContributionWindow> ContributionWindows { get; set; }

    public virtual DbSet<Faculty> Faculties { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserActivityLog> UserActivityLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ContributionWindow>(entity =>
        {
            entity.HasKey(e => e.ContributionWindowId).HasName("ContributionWindows_pkey");

            entity.Property(e => e.ContributionWindowId).ValueGeneratedNever();
            entity.Property(e => e.IsActive).HasDefaultValue(true);
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
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FacultyMemberShip_UserId_fkey"),
                    l => l.HasOne<Faculty>().WithMany()
                        .HasForeignKey("FacultyId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
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
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Roles_Permissions_PermissionId_fkey"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
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

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "Users_Role",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Users_Roles_RoleId_fkey"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Users_Roles_UserId_fkey"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId").HasName("Users_Roles_pkey");
                        j.ToTable("Users_Roles");
                    });
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
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
