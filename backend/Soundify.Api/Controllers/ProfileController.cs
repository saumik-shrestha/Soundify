using System.Security.Claims;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soundify.Api.Data;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly SoundifyDbContext _db;

    public ProfileController(SoundifyDbContext db)
    {
        _db = db;
    }


    // =====================================================
    // GET PROFILE
    // =====================================================

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();

        var user = await _db.Users
            .Where(x => x.Id == userId)
            .Select(x => new
            {
                x.Id,
                x.Username,
                x.Email,
                x.DisplayName,
                x.ProfileImageUrl,
                x.IsAdmin,
                x.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest(new
            {
                message = "Username is required."
            });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Email is required."
            });
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var username = request.Username.Trim();
        var email = request.Email.Trim();

        var usernameExists = await _db.Users
            .AnyAsync(x =>
                x.Id != userId &&
                x.Username.ToLower() ==
                username.ToLower());

        if (usernameExists)
        {
            return Conflict(new
            {
                message =
                    "That username is already in use."
            });
        }

        var emailExists = await _db.Users
            .AnyAsync(x =>
                x.Id != userId &&
                x.Email.ToLower() ==
                email.ToLower());

        if (emailExists)
        {
            return Conflict(new
            {
                message =
                    "That email is already in use."
            });
        }

        user.Username = username;

        user.Email = email;

        user.DisplayName =
            string.IsNullOrWhiteSpace(
                request.DisplayName)
                ? username
                : request.DisplayName.Trim();

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Profile updated successfully.",

            user = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.DisplayName,
                user.ProfileImageUrl,
                user.IsAdmin,
                user.CreatedAt
            }
        });
    }


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(
                request.CurrentPassword))
        {
            return BadRequest(new
            {
                message =
                    "Current password is required."
            });
        }

        if (string.IsNullOrWhiteSpace(
                request.NewPassword))
        {
            return BadRequest(new
            {
                message =
                    "New password is required."
            });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new
            {
                message =
                    "New password must be at least 6 characters."
            });
        }

        if (request.CurrentPassword ==
            request.NewPassword)
        {
            return BadRequest(new
            {
                message =
                    "New password must be different from your current password."
            });
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var passwordValid =
            BCrypt.Net.BCrypt.Verify(
                request.CurrentPassword,
                user.PasswordHash);

        if (!passwordValid)
        {
            return BadRequest(new
            {
                message =
                    "Current password is incorrect."
            });
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                request.NewPassword);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Password changed successfully."
        });
    }


    // =====================================================
    // GET CURRENT USER ID
    // =====================================================

    private Guid GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return Guid.Parse(userId);
    }
}


// =========================================================
// REQUEST MODELS
// =========================================================

public class UpdateProfileRequest
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? DisplayName { get; set; }
}


public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;
}