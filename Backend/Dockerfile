# Build image
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY CMS.slnx ./
COPY CMS.Api/CMS.Api.csproj CMS.Api/
COPY CMS.Application/CMS.Application.csproj CMS.Application/
COPY CMS.Infrastructure/CMS.Infrastructure.csproj CMS.Infrastructure/
COPY CMS.Domain/CMS.Domain.csproj CMS.Domain/

# Restore dependencies
RUN dotnet restore CMS.slnx

# Copy the rest of the source
COPY . .

# Publish the API
RUN dotnet publish CMS.Api/CMS.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "CMS.Api.dll"]
