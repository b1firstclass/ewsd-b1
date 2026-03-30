-- =====================================================
-- EWSD Database Setup - Fixed and Aligned with Backend Authentication System
-- =====================================================
-- This file contains insert statements to populate database
-- with test data that aligns with backend security constants
-- and authentication/authorization system

-- =====================================================
-- 1. ROLES TABLE - Aligned with SecurityConstants.cs
-- =====================================================
INSERT INTO public."Roles" ("RoleId", "Name", "Description", "IsActive", "CreatedDate", "ModifiedDate") VALUES
-- Core system roles (matching SecurityConstants.RoleNames)
('550e8400-e29b-41d4-a716-446655440001', 'Admin', 'System administrator with full access', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Coordinator', 'Faculty review coordinator', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Manager', 'Marketing department manager', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Student', 'Student contributor', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Guest', 'Guest user with limited access', true, NOW(), NOW());

-- =====================================================
-- 2. PERMISSIONS TABLE - Aligned with SecurityConstants.PermissionNames
-- =====================================================
INSERT INTO "Permissions" ("PermissionId", "Name", "Module", "Description", "IsActive", "CreatedDate", "ModifiedDate") VALUES
-- User management permissions
('660e8400-e29b-41d4-a716-446655440001', 'User.Read', 'User', 'View user profiles', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'User.Create', 'User', 'Create new users', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'User.Update', 'User', 'Edit user information', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'User.Delete', 'User', 'Delete users', true, NOW(), NOW()),

-- Permission management permissions
('660e8400-e29b-41d4-a716-446655440005', 'Permission.Read', 'Permission', 'View permissions', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440006', 'Permission.Create', 'Permission', 'Create permissions', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440007', 'Permission.Update', 'Permission', 'Update permissions', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440008', 'Permission.Delete', 'Delete permissions', true, NOW(), NOW()),

-- Role management permissions
('660e8400-e29b-41d4-a716-446655440009', 'Role.Read', "Role", 'View roles', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440010', 'Role.Create', "Role", 'Create roles', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440011', 'Role.Update', "Role", 'Update roles', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440012', 'Role.Delete', "Role", 'Delete roles', true, NOW(), NOW()),

-- Faculty management permissions
('660e8400-e29b-41d4-a716-446655440013', 'Faculty.Create', "Faculty", 'Create faculties', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440014', 'Faculty.Read', "Faculty", 'View faculties', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440015', 'Faculty.Update', "Faculty", 'Update faculties', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440016', 'Faculty.Delete', "Faculty", 'Delete faculties', true, NOW(), NOW()),

-- Contribution window permissions
('660e8400-e29b-41d4-a716-446655440017', 'ContributionWindow.Create', "ContributionWindow", 'Create contribution windows', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440018', 'ContributionWindow.Read', "ContributionWindow", 'View contribution windows', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440019', 'ContributionWindow.Update', "ContributionWindow", 'Update contribution windows', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440020', 'ContributionWindow.Delete', "ContributionWindow", 'Delete contribution windows', true, NOW(), NOW()),

-- Contribution permissions
('660e8400-e29b-41d4-a716-446655440021', 'Contribution.Create', "Contribution", 'Create contributions', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440022', 'Contribution.Read', "Contribution", 'View contributions', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440023', 'Contribution.Update', "Contribution", 'Edit contributions', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440024', 'Contribution.Delete', "Contribution", 'Delete contributions', true, NOW(), NOW()),

-- Comment permissions
('660e8400-e29b-41d4-a716-446655440025', 'Comment.Create', "Comment", 'Create comments', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440026', 'Comment.Read', "Comment", 'View comments', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440027', 'Comment.Update', "Comment", 'Edit comments', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440028', 'Comment.Delete', "Comment", 'Delete comments', true, NOW(), NOW()),

-- Activity log permissions
('660e8400-e29b-41d4-a716-446655440029', 'ActivityLog.Create', "ActivityLog", 'Create activity logs', true, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440030', 'ActivityLog.Read', "ActivityLog", 'View activity logs', true, NOW(), NOW()),

-- Report permissions
('660e8400-e29b-41d4-a716-446655440031', 'Report.Read', "Report", 'View system reports and analytics', true, NOW(), NOW());

-- =====================================================
-- 3. ROLES_PERMISSIONS TABLE - Role-Permission Mappings
-- =====================================================
INSERT INTO public."Roles_Permissions" ("RoleId", "PermissionId") VALUES
-- Admin permissions (full system access)
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'), -- User.Read
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002'), -- User.Create
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003'), -- User.Update
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004'), -- User.Delete
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005'), -- Permission.Read
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440006'), -- Permission.Create
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440007'), -- Permission.Update
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440008'), -- Permission.Delete
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440009'), -- Role.Read
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440010'), -- Role.Create
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440011'), -- Role.Update
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440012'), -- Role.Delete
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440017'), -- ContributionWindow.Create
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440018'), -- ContributionWindow.Read
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440019'), -- ContributionWindow.Update
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440020'), -- ContributionWindow.Delete
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440029'), -- ActivityLog.Create
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440030'), -- ActivityLog.Read
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440031'), -- Report.Read

-- Coordinator permissions (faculty-specific: review contributions, comment, view guests)
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001'), -- User.Read (view guest list)
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440014'), -- Faculty.Read
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440018'), -- ContributionWindow.Read
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440021'), -- Contribution.Create
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440022'), -- Contribution.Read
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440023'), -- Contribution.Update
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440024'), -- Contribution.Delete
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440025'), -- Comment.Create
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440026'), -- Comment.Read
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440027'), -- Comment.Update
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440028'), -- Comment.Delete
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440031'), -- Report.Read

-- Manager permissions (cross-faculty read-only oversight, view reports/statistics)
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440014'), -- Faculty.Read
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440018'), -- ContributionWindow.Read
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440022'), -- Contribution.Read
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440031'), -- Report.Read

-- Student permissions (own contributions, read feedback/deadlines)
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440018'), -- ContributionWindow.Read
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440021'), -- Contribution.Create
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440022'), -- Contribution.Read
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440023'), -- Contribution.Update
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440025'), -- Comment.Create
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440026'), -- Comment.Read
('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440031');

-- Guest permissions (read-only selected contributions in assigned faculty)
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440022'); -- Contribution.Read

-- =====================================================
-- 4. FACULTIES TABLE - University faculties
-- =====================================================
INSERT INTO "Faculties" ("FacultyId", "FacultyName", "IsActive", "CreatedDate", "ModifiedDate") VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Business School', true, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', 'Engineering', true, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', 'Arts & Humanities', true, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', 'Science', true, NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440005', 'Medicine', true, NOW(), NOW());

-- =====================================================
-- 5. CONTRIBUTION_WINDOWS TABLE - Academic year windows
-- =====================================================
INSERT INTO "ContributionWindows" (
    "ContributionWindowId", 
    "SubmissionOpenDate", 
    "SubmissionEndDate", 
    "ClosureDate", 
    "AcademicYearStart", 
    "AcademicYearEnd", 
    "IsActive", 
    "CreatedDate", 
    "ModifiedDate"
) VALUES
-- Current academic year 2026-2027
('990e8400-e29b-41d4-a716-446655440001', 
    '2026-01-15 00:00:00', 
    '2026-04-30 23:59:59', 
    '2026-05-31 23:59:59', 
    2026, 
    2027, 
    true, 
    NOW(), 
    NOW());

-- =====================================================
-- 6. USERS TABLE - Test users for all roles
-- =====================================================
-- Note: Passwords should be hashed in production. Using 'password123' for testing
INSERT INTO "Users" (
    "UserId", 
    "LoginId", 
    "Password", 
    "Email", 
    "FullName", 
    "RoleId", 
    "IsActive", 
    "CreatedDate", 
    "ModifiedDate",
    "LastLoginDate"
) VALUES
-- Admin user
('aa0e8400-e29b-41d4-a716-446655440001', 
    'admin', 
    'gA+d0gx3simyp+TpBLIxOQ==:KRRJtaa33pYDo5sEYFy2LZNIs7GFk22uKLHCu7cBlO4=', 
    'admin@university.edu', 
    'System Administrator', 
    '550e8400-e29b-41d4-a716-446655440001', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

-- Marketing Coordinator users
('aa0e8400-e29b-41d4-a716-446655440002', 
    'coordinator1', 
    '6Iaemidbx3T+wMz1DWEw9g==:Zl7Iq3DdEUaidOSDRymfnOYGAlCX1S6SYJYX2UcOSco=', 
    'coordinator1@university.edu', 
    'Dr. Michael Brown', 
    '550e8400-e29b-41d4-a716-446655440002', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

('aa0e8400-e29b-41d4-a716-446655440003', 
    'coordinator2', 
    'typIsyyADutsvkcta6dUzg==:lyYK/tk3mFzDhHHi1hsxJGIJnkZ9dIUJtrfel93PySU=', 
    'coordinator2@university.edu', 
    'Prof. Sarah Wilson', 
    '550e8400-e29b-41d4-a716-446655440002', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

-- Marketing Manager user
('aa0e8400-e29b-41d4-a716-446655440004', 
    'manager1', 
    'fXKkCiDle3ZGrYMGw6MWIQ==:Mp6Bvdo6wcJ9rp4YQLQXboyb4/OEmuJRI89WBgMepI0=', 
    'manager1@university.edu', 
    'Prof. David Johnson', 
    '550e8400-e29b-41d4-a716-446655440003', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

-- Student users
('aa0e8400-e29b-41d4-a716-446655440005', 
    'student1', 
    'rUnwQo7A3u7UI3M36pk6ug==:oE42Sy+L3biBmKvygxYDukVjjrZFeTXFatmnHoXguXc=', 
    'student1@university.edu', 
    'John Smith', 
    '550e8400-e29b-41d4-a716-446655440004', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

('aa0e8400-e29b-41d4-a716-446655440006', 
    'student2', 
    'LvTh6U4wNzUCysi9m5NmhQ==:X1R6uN6BaWxzDC6vDQeogkb2b7W7Chvt3FCUjw0Q3ow=', 
    'student2@university.edu', 
    'Emily Davis', 
    '550e8400-e29b-41d4-a716-446655440004', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

('aa0e8400-e29b-41d4-a716-446655440007', 
    'student3', 
    'EzpNs1VDPkxNYaeOqOiY/A==:X9HVX6oQH0GujF1nRRIw5anNzM3loT1PdbmPeEsnkP8=', 
    'student3@university.edu', 
    'Robert Miller', 
    '550e8400-e29b-41d4-a716-446655440004', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

('aa0e8400-e29b-41d4-a716-446655440008', 
    'student4', 
    'ESOie5O6N7zeKUvXWRtywQ==:ZchPtKv4oeo3iVGfpHS5Qd+5x7f1RuHmesUTIQoAlfU=', 
    'student4@university.edu', 
    'Lisa Anderson', 
    '550e8400-e29b-41d4-a716-446655440004', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

('aa0e8400-e29b-41d4-a716-446655440009', 
    'student5', 
    'FZ6P9ohp2sE5Hrlv7GD1EQ==:v8uWxGPEkaAeJYF5KcwTQOmNRLBvUTC41IdCX0hml3Y=', 
    'student5@university.edu', 
    'James Taylor', 
    '550e8400-e29b-41d4-a716-446655440004', 
    true, 
    NOW(), 
    NOW(),
    NOW()),

-- Guest user
('aa0e8400-e29b-41d4-a716-446655440010', 
    'guest1', 
    'Zu/wsPWBRbfV9bScFxZ2wg==:GQOgen519FUemO+uLt4XHKoihWu3a/M7U99Cmglg2YQ=', 
    'guest1@university.edu', 
    'Guest User', 
    '550e8400-e29b-41d4-a716-446655440005', 
    true, 
    NOW(), 
    NOW(),
    NOW());

-- =====================================================
-- 7. FACULTY_MEMBERSHIP TABLE - Assign users to faculties
-- =====================================================
INSERT INTO "FacultyMemberShip" ("FacultyId", "UserId") VALUES
-- Admin assigned to all faculties (oversight)
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440001'),

-- Coordinators assigned to specific faculties
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440003'),

-- Manager assigned to all faculties (oversight)
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440004'),
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440004'),
('880e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440004'),
('880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004'),
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440004'),

-- Students assigned to specific faculties
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440005'),
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440006'),
('880e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440007'),
('880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440008'),
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440009'),

-- Guest assigned to Business School (limited access)
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440010');




-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Test Login Credentials (use these passwords for testing):
-- admin / password123
-- coordinator1 / password123  
-- coordinator2 / password123
-- manager1 / password123
-- student1 / password123
-- student2 / password123
-- student3 / password123
-- student4 / password123
-- student5 / password123
-- guest1 / password123

