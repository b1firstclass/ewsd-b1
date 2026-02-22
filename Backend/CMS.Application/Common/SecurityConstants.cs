namespace CMS.Application.Common
{
    public static class PermissionClaimTypes
    {
        public const string Permission = "cms:permissions";
    }

    public static class PermissionNames
    {
        public const string UsersRead = "User.Read";
        public const string UsersCreate = "User.Create";
        public const string UsersUpdate = "User.Update";
        public const string UsersDelete = "User.Delete";

        public const string PermissionsRead = "Permission.Read";
        public const string PermissionsCreate = "Permission.Create";
        public const string PermissionsUpdate = "Permission.Update";
        public const string PermissionsDelete = "Permission.Delete";

        public const string RolesRead = "Role.Read";
        public const string RolesCreate = "Role.Create";
        public const string RolesUpdate = "Role.Update";
        public const string RolesDelete = "Role.Delete";

        public const string FacultyCreate = "Faculty.Create";
        public const string FacultyRead = "Faculty.Read";
        public const string FacultyUpdate = "Faculty.Update";
        public const string FacultyDelete = "Faculty.Delete";

        public const string ContributionWindowCreate = "ContributionWindow.Create";
        public const string ContributionWindowRead = "ContributionWindow.Read";
        public const string ContributionWindowUpdate = "ContributionWindow.Update";
        public const string ContributionWindowDelete = "ContributionWindow.Delete";
    }

    public static class PermissionPolicies
    {
        public const string Prefix = "Permission:";

        public static string Build(string permission) => string.Concat(Prefix, permission);
    }
}
