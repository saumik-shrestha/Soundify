using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Soundify.Api.Data;
using Soundify.Api.DTOs.Auth;
using Soundify.Api.Models;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly SoundifyDbContext _db;
    private readonly IConfiguration _configuration;

    public AuthController(
        SoundifyDbContext db,
        IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }


    // ============================================================
    // POST: /api/auth/register
    // ============================================================

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message =
                    "Username, email and password are required."
            });
        }

        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        var usernameExists = await _db.Users
            .AnyAsync(x => x.Username == username);

        if (usernameExists)
        {
            return Conflict(new
            {
                message = "Username already exists."
            });
        }

        var emailExists = await _db.Users
            .AnyAsync(x => x.Email == email);

        if (emailExists)
        {
            return Conflict(new
            {
                message = "Email already exists."
            });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),

            Username = username,

            Email = email,

            DisplayName =
                string.IsNullOrWhiteSpace(
                    request.DisplayName)
                    ? username
                    : request.DisplayName.Trim(),

            PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.Password),

            IsAdmin = false
        };

        _db.Users.Add(user);

        await _db.SaveChangesAsync();

        var token = CreateToken(user);

        return Ok(new
        {
            token,

            user = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.DisplayName,
                user.IsAdmin
            }
        });
    }


    // ============================================================
    // POST: /api/auth/login
    // ============================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request)
    {
        var value = request.UsernameOrEmail.Trim();

        var user = await _db.Users
            .FirstOrDefaultAsync(x =>
                x.Username == value ||
                x.Email == value.ToLowerInvariant());

        if (user == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid username/email or password."
            });
        }

        var passwordValid =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

        if (!passwordValid)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid username/email or password."
            });
        }

        var token = CreateToken(user);

        return Ok(new
        {
            token,

            user = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.DisplayName,
                user.IsAdmin
            }
        });
    }


    // ============================================================
    // GET: /api/auth/me
    // ============================================================

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            return Unauthorized(new
            {
                message =
                    "User ID was not found in token."
            });
        }

        if (!Guid.TryParse(
                userIdValue,
                out var userId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid user ID."
            });
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(x =>
                x.Id == userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email,
            user.DisplayName,
            user.IsAdmin
        });
    }


    // ============================================================
    // CREATE JWT TOKEN
    // ============================================================

    private string CreateToken(User user)
    {
        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new Claim(
                ClaimTypes.Name,
                user.Username),

            new Claim(
                ClaimTypes.Email,
                user.Email),

            new Claim(
                ClaimTypes.Role,
                user.IsAdmin
                    ? "Admin"
                    : "User")
        };

        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!));

        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        var expiresMinutes =
            double.Parse(
                _configuration[
                    "Jwt:ExpiresMinutes"]!);

        var token =
            new JwtSecurityToken(
                issuer:
                    _configuration["Jwt:Issuer"],

                audience:
                    _configuration["Jwt:Audience"],

                claims:
                    claims,

                expires:
                    DateTime.UtcNow.AddMinutes(
                        expiresMinutes),

                signingCredentials:
                    credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}