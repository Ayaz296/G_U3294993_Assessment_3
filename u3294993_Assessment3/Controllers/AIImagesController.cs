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

    // GET: AIIMAGES
    [AllowAnonymous]
    public async Task<IActionResult> Index()
    {
        return View(await _context.AIImage
            .OrderByDescending(a => a.Like)
            .ToListAsync());
    }

    [Authorize]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Like(int id)
    {
        var aiimage = await _context.AIImage.FindAsync(id);

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

        return RedirectToAction(nameof(Index), new { highlight = id });
    }

    // GET: AIIMAGES/Details/5
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

    // GET: AIIMAGES/Create
    [Authorize]
    public IActionResult Create()
    {
        AIImage aiimage = new AIImage();
        aiimage.UploadDate = DateTime.Now;
        aiimage.Like = 0;

        return View(aiimage);
    }

    // POST: AIIMAGES/Create
    [Authorize]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(
        [Bind("Prompt,ImageGenerator")] AIImage aiimage,
        IFormFile? imageFile)
    {
        aiimage.UploadDate = DateTime.Now;
        aiimage.Like = 0;
        aiimage.canIncreaseLike = true;
        aiimage.Filename = "";

        ModelState.Remove(nameof(AIImage.Filename));

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

            string filename = Guid.NewGuid().ToString() + extension;

            string uploadsFolder = Path.Combine(
                _environment.WebRootPath, "uploads");

            Directory.CreateDirectory(uploadsFolder);

            string filePath = Path.Combine(
                uploadsFolder, filename);

            try
            {
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
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                ModelState.AddModelError("imageFile",
                    "The image could not be uploaded.");
            }
            catch (DbUpdateException)
            {
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

    // GET: AIIMAGES/Edit/5
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

    // POST: AIIMAGES/Edit/5

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

        var existingImage = await _context.AIImage.FindAsync(id);

        if (existingImage == null)
        {
            return NotFound();
        }

        aiimage.Filename = existingImage.Filename;
        ModelState.Remove(nameof(AIImage.Filename));

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

                    using (var stream = new FileStream(
                        newFilePath, FileMode.CreateNew))
                    {
                        await imageFile.CopyToAsync(stream);
                    }

                    oldFilePath = Path.Combine(
                        uploadsFolder, existingImage.Filename);

                    existingImage.Filename = filename;
                }

                existingImage.Prompt = aiimage.Prompt;
                existingImage.ImageGenerator = aiimage.ImageGenerator;
                existingImage.UploadDate = DateTime.Now;

                await _context.SaveChangesAsync();

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
                    }
                }

                return RedirectToAction(nameof(Index));
            }
            catch (IOException)
            {
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
                if (newFilePath != null &&
                    System.IO.File.Exists(newFilePath))
                {
                    System.IO.File.Delete(newFilePath);
                }

                ModelState.AddModelError("",
                    "The changes could not be saved.");
            }
        }

        aiimage.UploadDate = existingImage.UploadDate;
        aiimage.Like = existingImage.Like;
        aiimage.Filename = existingImage.Filename;

        return View(aiimage);
    }


    // GET: AIIMAGES/Delete/5
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int? id)
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

    // POST: AIIMAGES/Delete/5
    // POST: AIIMAGES/Delete/5
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

        if (aiimage == null)
        {
            return NotFound();
        }

        string filename = aiimage.Filename;

        try
        {
            _context.AIImage.Remove(aiimage);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            ModelState.AddModelError("",
                "An error occurred while deleting the image.");

            return View("Delete", aiimage);
        }

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
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);

                TempData["SuccessMessage"] =
                    "Image deleted successfully.";
            }
            else
            {
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
