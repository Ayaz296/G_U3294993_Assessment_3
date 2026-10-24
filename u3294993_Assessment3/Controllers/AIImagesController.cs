
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using u3294993_Assessment3.Models;
using u3294993_Assessment3.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;

public class AIImagesController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public AIImagesController(
        ApplicationDbContext context,
        IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // Showing uploaded images from highest to lowest number of likes
    [AllowAnonymous]
    public async Task<IActionResult> Index()
    {
        return View(await _context.AIImage
            .OrderByDescending(a => a.Like)
            .ToListAsync());
    }

    // Allowing logged-in users to like each image once per session
    [Authorize]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Like(int id)
    {
        var aiimage = await _context.AIImage.FindAsync(id);

        // Returning 404 if the image record doesn't exist anymore
        if (aiimage == null)
        {
            return NotFound();
        }

        string userId = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";

        string sessionKey = "Liked_" + userId + "_" + id;

        if (HttpContext.Session.GetString(sessionKey) != "true")
        {
            aiimage.Like++;
            await _context.SaveChangesAsync();
            HttpContext.Session.SetString(sessionKey, "true");
        }

        // Returning to the gallery and scrolling to the liked image
        return RedirectToAction(nameof(Index), new { highlight = id });
    }

    // Restricting image details to administrators
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Details(int? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var aiimage = await _context.AIImage
            .FirstOrDefaultAsync(m => m.Id == id);

        if (aiimage == null)
        {
            return NotFound();
        }

        return View(aiimage);
    }

    // Setting the upload date and likes before displaying the Create form
    [Authorize]
    public IActionResult Create()
    {
        AIImage aiimage = new AIImage();
        aiimage.UploadDate = DateTime.Now;
        aiimage.Like = 0;

        return View(aiimage);
    }

    // Saving the uploaded image and its information to the database
    [Authorize]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(
        [Bind("Prompt,ImageGenerator")] AIImage aiimage,
        IFormFile? imageFile)
    {
        // Setting these values on the server so users can't change them through the form
        aiimage.UploadDate = DateTime.Now;
        aiimage.Like = 0;
        aiimage.canIncreaseLike = true;
        aiimage.Filename = "";

        ModelState.Remove(nameof(AIImage.Filename));

        // Checking that a file was selected and has an allowed extension
        if (imageFile == null || imageFile.Length == 0)
        {
            ModelState.AddModelError("imageFile",
                "Please select an image.");
        }
        else
        {
            string extension = Path.GetExtension(
                imageFile.FileName).ToLowerInvariant();

            if (extension != ".jpg" &&
                extension != ".jpeg" &&
                extension != ".png" &&
                extension != ".webp")
            {
                ModelState.AddModelError("imageFile",
                    "Only JPG, PNG and WebP images are allowed.");
            }
        }

        if (ModelState.IsValid && imageFile != null)
        {
            string extension = Path.GetExtension(
                imageFile.FileName).ToLowerInvariant();

            // Giving uploaded files unique names to avoid overwriting existing images
            string filename = Guid.NewGuid().ToString() + extension;

            string uploadsFolder = Path.Combine(
                _environment.WebRootPath, "uploads");

            Directory.CreateDirectory(uploadsFolder);

            string filePath = Path.Combine(
                uploadsFolder, filename);

            try
            {
                // Saving the image to wwwroot/uploads before creating its database record
                using (var stream = new FileStream(
                    filePath, FileMode.CreateNew))
                {
                    await imageFile.CopyToAsync(stream);
                }

                aiimage.Filename = filename;

                _context.Add(aiimage);
                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(Index));
            }
            catch (IOException)
            {
                // Removing the uploaded file if saving it fails
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                ModelState.AddModelError("imageFile",
                    "The image could not be uploaded.");
            }
            catch (DbUpdateException)
            {
                // Removing the uploaded file if its database record can't be saved
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                ModelState.AddModelError("",
                    "The image details could not be saved.");
            }
        }

        return View(aiimage);
    }

    // Loading the selected image into the Edit form for administrators
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Edit(int? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var aiimage = await _context.AIImage.FindAsync(id);

        if (aiimage == null)
        {
            return NotFound();
        }

        return View(aiimage);
    }

    // Updating image information and replacing the uploaded file when required
    [Authorize(Roles = "admin")]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(
        int? id,
        [Bind("Id,Prompt,ImageGenerator")] AIImage aiimage,
        IFormFile? imageFile)
    {
        if (id == null || id != aiimage.Id)
        {
            return NotFound();
        }

        // Checking the existing record before making any changes
        var existingImage = await _context.AIImage.FindAsync(id);

        if (existingImage == null)
        {
            return NotFound();
        }

        aiimage.Filename = existingImage.Filename;
        ModelState.Remove(nameof(AIImage.Filename));

        // Validating the replacement file only when a new image is selected
        if (imageFile != null)
        {
            string extension = Path.GetExtension(
                imageFile.FileName).ToLowerInvariant();

            if (imageFile.Length == 0 ||
                (extension != ".jpg" &&
                 extension != ".jpeg" &&
                 extension != ".png" &&
                 extension != ".webp"))
            {
                ModelState.AddModelError("imageFile",
                    "Please upload a JPG, PNG or WebP image.");
            }
        }

        if (ModelState.IsValid)
        {
            string? newFilePath = null;
            string? oldFilePath = null;

            try
            {
                if (imageFile != null)
                {
                    string extension = Path.GetExtension(
                        imageFile.FileName).ToLowerInvariant();

                    string filename = Guid.NewGuid().ToString() + extension;

                    string uploadsFolder = Path.Combine(
                        _environment.WebRootPath, "uploads");

                    Directory.CreateDirectory(uploadsFolder);

                    newFilePath = Path.Combine(uploadsFolder, filename);

                    // Uploading the replacement before removing the previous image
                    using (var stream = new FileStream(
                        newFilePath, FileMode.CreateNew))
                    {
                        await imageFile.CopyToAsync(stream);
                    }

                    oldFilePath = Path.Combine(
                        uploadsFolder, existingImage.Filename);

                    existingImage.Filename = filename;
                }

                // Updating the record while keeping the existing number of likes
                existingImage.Prompt = aiimage.Prompt;
                existingImage.ImageGenerator = aiimage.ImageGenerator;
                existingImage.UploadDate = DateTime.Now;

                await _context.SaveChangesAsync();

                // Deleting the previous file only if a replacement was saved
                if (newFilePath != null &&
                    oldFilePath != null &&
                    System.IO.File.Exists(oldFilePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                    catch (IOException)
                    {
                        // Keeping the saved record even if the old file can't be removed
                    }
                }

                return RedirectToAction(nameof(Index));
            }
            catch (IOException)
            {
                // Cleaning up the replacement file if the update fails
                if (newFilePath != null &&
                    System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Delete(newFilePath);
                }

                ModelState.AddModelError("",
                    "The image could not be updated.");
            }
            catch (DbUpdateException)
            {
                // Removing the new file if the database changes couldn't be saved
                if (newFilePath != null &&
                    System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Delete(newFilePath);
                }

                ModelState.AddModelError("",
                    "The changes could not be saved.");
            }
        }

        // Restoring stored values when redisplaying the Edit form after an error
        aiimage.UploadDate = existingImage.UploadDate;
        aiimage.Like = existingImage.Like;
        aiimage.Filename = existingImage.Filename;

        return View(aiimage);
    }

    // Displaying the deletion confirmation for an existing record
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var aiimage = await _context.AIImage
            .FirstOrDefaultAsync(m => m.Id == id);

        // Preventing the deletion page from opening if the record is already missing
        if (aiimage == null)
        {
            return NotFound();
        }

        return View(aiimage);
    }

    // Deleting the database record first, then removing its uploaded image
    [Authorize(Roles = "admin")]
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var aiimage = await _context.AIImage.FindAsync(id);

        // Returning 404 if the database record has already been deleted
        if (aiimage == null)
        {
            return NotFound();
        }

        string filename = aiimage.Filename;

        try
        {
            // Deleting the record from the database before removing the physical file
            _context.AIImage.Remove(aiimage);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            ModelState.AddModelError("",
                "An error occurred while deleting the image.");

            return View("Delete", aiimage);
        }

        // Checking that the saved filename doesn't contain an invalid file path
        if (string.IsNullOrEmpty(filename) ||
            Path.GetFileName(filename) != filename)
        {
            TempData["ErrorMessage"] =
                "An error occurred while deleting the image.";

            return RedirectToAction(nameof(Index));
        }

        string filePath = Path.Combine(
            _environment.WebRootPath, "uploads", filename);

        try
        {
// Checking whether the uploaded file still exists before deleting it
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);

                TempData["SuccessMessage"] =
                    "Image deleted successfully.";
            }
            else
            {
        // The record is deleted even if its image was already missing
                TempData["ErrorMessage"] =
                    "Record deleted. The image file was already missing.";
            }
        }
        catch (IOException)
        {
            TempData["ErrorMessage"] =
                "An error occurred while deleting the image.";
        }
        catch (UnauthorizedAccessException)
        {
            TempData["ErrorMessage"] =
                "An error occurred while deleting the image.";
        }

        return RedirectToAction(nameof(Index));
    }
}
