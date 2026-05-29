FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY JobTracker.sln ./
COPY JobTracker.Api/JobTracker.Api.csproj JobTracker.Api/
COPY JobTracker.Application/JobTracker.Application.csproj JobTracker.Application/
COPY JobTracker.Domain/JobTracker.Domain.csproj JobTracker.Domain/
COPY JobTracker.Infrastructure/JobTracker.Infrastructure.csproj JobTracker.Infrastructure/
COPY JobTracker.Tests/JobTracker.Tests.csproj JobTracker.Tests/

RUN dotnet restore JobTracker.sln

COPY . .

RUN dotnet publish JobTracker.Api/JobTracker.Api.csproj \
  -c Release \
  -o /app/publish \
  --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "JobTracker.Api.dll"]