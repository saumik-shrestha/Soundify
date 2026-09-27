using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Soundify.Api.Swagger;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(
        OpenApiOperation operation,
        OperationFilterContext context)
    {
        var hasFile = context.ApiDescription.ParameterDescriptions
            .Any(parameter =>
                parameter.Type == typeof(IFormFile) ||
                parameter.Type == typeof(IFormFile[]));

        if (!hasFile)
        {
            return;
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Required = true,
            Content =
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                        {
                            ["title"] = new OpenApiSchema
                            {
                                Type = "string"
                            },
                            ["artist"] = new OpenApiSchema
                            {
                                Type = "string"
                            },
                            ["album"] = new OpenApiSchema
                            {
                                Type = "string"
                            },
                            ["durationSeconds"] = new OpenApiSchema
                            {
                                Type = "integer",
                                Format = "int32"
                            },
                            ["audio"] = new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary"
                            },
                            ["image"] = new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary"
                            }
                        }
                    }
                }
            }
        };
    }
}