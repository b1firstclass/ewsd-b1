using AutoMapper;
using CMS.Application.DTOs;
using CMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CMS.Infrastructure.Mappings
{
    public class DomainMappingProfile : Profile
    {
        public DomainMappingProfile()
        {
            CreateMap<UserRegisterRequest, User>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.LoginId, opt => opt.MapFrom(src => src.LoginId))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password))
                .ForMember(dest => dest.FacultyId, opt => opt.MapFrom(src => src.FacultyId));

            CreateMap<Faculty, FaculityInfo>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FacultyName))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.FacultyId))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate));
        }
    }
}
