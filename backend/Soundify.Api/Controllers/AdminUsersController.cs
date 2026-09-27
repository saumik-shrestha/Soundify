
using System.Security.Claims;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soundify.Api.Data;

namespace Soundify.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly SoundifyDbContext _db;

    public AdminUsersController(SoundifyDbContext db)
    {
        _db = db;
    }

    // ============================================================
    // GET ALL USERS
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users
            .OrderByDescending(user => user.CreatedAt)
            .Select(user => new
            {
                user.Id,
                user.Username,
                user.Email,
                user.DisplayName,
                user.ProfileImageUrl,
                user.IsAdmin,
                user.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    // ============================================================
    // GET SINGLE USER
    // ============================================================

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = await _db.Users
            .Where(x => x.Id == id)
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

    // ============================================================
    // UPDATE USER
    // ============================================================

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateUser(
        Guid id,
        [FromBody] UpdateAdminUserRequest request)
    {
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
            .FirstOrDefaultAsync(x => x.Id == id);

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
                x.Id != id &&
                x.Username.ToLower() == username.ToLower());

        if (usernameExists)
        {
            return Conflict(new
            {
                message = "That username is already in use."
            });
        }

        var emailExists = await _db.Users
            .AnyAsync(x =>
                x.Id != id &&
                x.Email.ToLower() == email.ToLower());

        if (emailExists)
        {
            return Conflict(new
            {
                message = "That email is already in use."
            });
        }

        var currentUserId = GetCurrentUserId();

        // Prevent an admin from accidentally removing
        // their own admin privileges.
        if (currentUserId == id && !request.IsAdmin)
        {
            return BadRequest(new
            {
                message =
                    "You cannot remove your own admin privileges."
            });
        }

        user.Username = username;
        user.Email = email;

        user.DisplayName =
            string.IsNullOrWhiteSpace(request.DisplayName)
                ? username
                : request.DisplayName.Trim();

        if (currentUserId != id)
        {
            user.IsAdmin = request.IsAdmin;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "User updated successfully.",
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

    // ============================================================
    // RESET PASSWORD
    // ============================================================

    [HttpPut("{id:guid}/password")]
    public async Task<IActionResult> ResetPassword(
        Guid id,
        [FromBody] ResetUserPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new
            {
                message = "New password is required."
            });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new
            {
                message =
                    "Password must be at least 6 characters."
            });
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                request.NewPassword
            );

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Password reset successfully."
        });
    }

    // ============================================================
    // DELETE USER
    // ============================================================

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId == id)
        {
            return BadRequest(new
            {
                message =
                    "You cannot delete your own account from the admin panel."
            });
        }

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        _db.Users.Remove(user);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Unable to delete user.",
                error = ex.Message
            });
        }

        return Ok(new
        {
            message = "User deleted successfully."
        });
    }

    // ============================================================
    // CURRENT ADMIN USER ID
    // ============================================================

    private Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException();
        }

        return Guid.Parse(userId);
    }
}


// ================================================================
// REQUEST MODELS
// ================================================================

public class UpdateAdminUserRequest
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? DisplayName { get; set; }

    public bool IsAdmin { get; set; }
}


public class ResetUserPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

