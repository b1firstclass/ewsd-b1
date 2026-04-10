using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Domain.Entities;

namespace CMS.Infrastructure.Mappings
{
    public class DomainMappingProfile : Profile
    {
        public DomainMappingProfile()
        {
            CreateMap<UserRegisterRequest, User>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.LoginId, opt => opt.MapFrom(src => src.LoginId))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password));

            CreateMap<User, UserInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.LoginId, opt => opt.MapFrom(src => src.LoginId))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)))
                .ForMember(dest => dest.Faculties, opt => opt.MapFrom(src => src.Faculties))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role));

            CreateMap<User, UserProfile>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.LoginId, opt => opt.MapFrom(src => src.LoginId))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)))
                .ForMember(dest => dest.Faculties, opt => opt.MapFrom(src => src.Faculties))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.LastLoginDate, opt => opt.MapFrom(src => src.LastLoginDate))
                .ForMember(dest => dest.FirstTimeLogin, opt => opt.MapFrom(src => !src.LastLoginDate.HasValue));

            CreateMap<FacultyCreateRequest, Faculty>()
                .ForMember(dest => dest.FacultyId, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.FacultyName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));

            CreateMap<Faculty, FaculityInfo>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FacultyName))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.FacultyId))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)));

            CreateMap<RoleCreateRequest, Role>()
                .ForMember(dest => dest.RoleId, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));

            CreateMap<Role, RoleInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.RoleId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)))
                .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => src.Permissions));

            CreateMap<PermissionCreateRequest, Permission>()
                .ForMember(dest => dest.PermissionId, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.Module, opt => opt.MapFrom(src => src.Module))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));

            CreateMap<Permission, PermissionInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PermissionId))
                .ForMember(dest => dest.Module, opt => opt.MapFrom(src => src.Module))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)));

            CreateMap<ContributionWindowCreateRequest, ContributionWindow>()
                .ForMember(dest => dest.ContributionWindowId, opt => opt.MapFrom(_ => Guid.NewGuid()))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));

            CreateMap<ContributionWindow, ContributionWindowInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ContributionWindowId))
                .ForMember(dest => dest.SubmissionOpenDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.SubmissionOpenDate)))
                .ForMember(dest => dest.SubmissionEndDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.SubmissionEndDate)))
                .ForMember(dest => dest.ClosureDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ClosureDate)))
                .ForMember(dest => dest.AcademicYearStart, opt => opt.MapFrom(src => src.AcademicYearStart))
                .ForMember(dest => dest.AcademicYearEnd, opt => opt.MapFrom(src => src.AcademicYearEnd))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)));

            CreateMap<Contribution, ContributionInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ContributionId))
                .ForMember(dest => dest.ContributionWindowId, opt => opt.MapFrom(src => src.ContributionWindowId))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.FacultyName, opt => opt.MapFrom(src => src.Faculty != null ? src.Faculty.FacultyName : null))
                .ForMember(dest => dest.CreatedUser, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null))
                .ForMember(dest => dest.Subject, opt => opt.MapFrom(src => src.Subject))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Rating))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)));

            CreateMap<Document, ContributionImageInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.DocumentId))
                .ForMember(dest => dest.FileName, opt => opt.MapFrom(src => src.FileName))
                .ForMember(dest => dest.Extension, opt => opt.MapFrom(src => src.Extension))
                .ForMember(dest => dest.Data, opt => opt.MapFrom(src => src.Data));

            CreateMap<Contribution, ContributionListInfo>()
                .IncludeBase<Contribution, ContributionInfo>()
                .ForMember(dest => dest.Image, opt => opt.MapFrom(src =>
                    src.Documents
                        .Where(d => d.IsActive && d.Extension != null && ContributionConstants.AllowedImageExtensions.Contains(d.Extension))
                        .OrderByDescending(d => d.CreatedDate)
                        .FirstOrDefault()));

            CreateMap<Document, ContributionDocumentInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.DocumentId))
                .ForMember(dest => dest.FileName, opt => opt.MapFrom(src => src.FileName))
                .ForMember(dest => dest.Extension, opt => opt.MapFrom(src => src.Extension))
                .ForMember(dest => dest.Size, opt => opt.MapFrom(src => src.Size))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)))
                .ForMember(dest => dest.ModifiedBy, opt => opt.MapFrom(src => src.ModifiedBy));

            CreateMap<Comment, CommentInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CommentId))
                .ForMember(dest => dest.ContributionId, opt => opt.MapFrom(src => src.ContributionId))
                .ForMember(dest => dest.Comment, opt => opt.MapFrom(src => src.Comment1))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.Poster, opt => opt.MapFrom(src => src.Poster))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)))
                .ForMember(dest => dest.ModifiedBy, opt => opt.MapFrom(src => src.ModifiedBy));

            CreateMap<CategoryCreateRequest, Category>()
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(_ => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));

            CreateMap<Category, CategoryInfo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.CreatedDate)))
                .ForMember(dest => dest.ModifiedDate, opt => opt.MapFrom(src => DateTimeHelper.NormalizeToUtc(src.ModifiedDate)));

            CreateMap<vw_BrowserList, BrowserListDto>()
                .ForMember(dest => dest.Count, opt => opt.MapFrom(src => src.count));

            CreateMap<vw_ContributionCountByFacultyAcademicYear, ContributionCountByFacultyAcademicYearDto>();

            CreateMap<vw_ContributionPercentageByFacultyAcademicYear, ContributionPercentageByFacultyAcademicYearDto>();

            CreateMap<vw_ContributionsWithoutComment, ContributionsWithoutCommentDto>();

            CreateMap<vw_ContributionsWithoutCommentAfter14Day, ContributionsWithoutCommentDto>();

            CreateMap<vw_PageAccessCount, PageAccessCountDto>()
                .ForMember(dest => dest.Count, opt => opt.MapFrom(src => src.count));

            CreateMap<vw_UserActivityCount, UserActivityCountDto>()
                .ForMember(dest => dest.Count, opt => opt.MapFrom(src => src.count));
        }
    }
}
