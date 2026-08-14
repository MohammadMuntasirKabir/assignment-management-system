FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/AssignmentManagement/AssignmentManagement.csproj backend/AssignmentManagement/
RUN dotnet restore backend/AssignmentManagement/AssignmentManagement.csproj

COPY backend/AssignmentManagement/ backend/AssignmentManagement/
WORKDIR /src/backend/AssignmentManagement
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AssignmentManagement.dll"]
