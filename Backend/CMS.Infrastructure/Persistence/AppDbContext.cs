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

    public virtual DbSet<Faculty> Faculties { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.HasKey(e => e.FacultyId).HasName("Faculties_pkey");

            entity.HasIndex(e => e.FacultyName, "Faculties_FacultyName_key").IsUnique();

            entity.Property(e => e.FacultyId).HasMaxLength(36);
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.FacultyName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ModifiedBy).HasMaxLength(36);

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
                        j.IndexerProperty<string>("FacultyId").HasMaxLength(36);
                        j.IndexerProperty<string>("UserId").HasMaxLength(36);
                    });
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId).HasName("Permissions_pkey");

            entity.HasIndex(e => new { e.Module, e.Name }, "Permissions_Module_Name_idx").IsUnique();

            entity.HasIndex(e => e.Name, "Permissions_Name_key").IsUnique();

            entity.Property(e => e.PermissionId).HasMaxLength(36);
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ModifiedBy).HasMaxLength(36);
            entity.Property(e => e.Module)
                .HasMaxLength(50)
                .HasComment("user");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasComment("user.create");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("Roles_pkey");

            entity.HasIndex(e => e.Name, "Roles_Name_key").IsUnique();

            entity.Property(e => e.RoleId).HasMaxLength(36);
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ModifiedBy).HasMaxLength(36);
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
                        j.IndexerProperty<string>("RoleId").HasMaxLength(36);
                        j.IndexerProperty<string>("PermissionId").HasMaxLength(36);
                    });
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("Users_pkey");

            entity.HasIndex(e => e.Email, "Users_Email_key").IsUnique();

            entity.HasIndex(e => e.LoginId, "Users_LoginId_key").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.LastLoginDate).HasComment("If this value is null, then this is the first time login");
            entity.Property(e => e.LastLoginIp).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.LoginId).HasMaxLength(50);
            entity.Property(e => e.ModifiedBy).HasMaxLength(36);
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasComment("hashed password");

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
                        j.IndexerProperty<string>("UserId").HasMaxLength(36);
                        j.IndexerProperty<string>("RoleId").HasMaxLength(36);
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
