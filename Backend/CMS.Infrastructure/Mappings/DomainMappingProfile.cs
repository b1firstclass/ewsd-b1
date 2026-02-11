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
            CreateMap<Faculty, FaculityInfo>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FacultyName));
        }
    }
}
