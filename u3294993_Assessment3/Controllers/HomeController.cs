using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using u3294993_Assessment3.Models;
using Microsoft.EntityFrameworkCore;
using u3294993_Assessment3.Data;

namespace u3294993_Assessment3.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(
            ILogger<HomeController> logger,
            ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var images = await _context.AIImage
                .OrderByDescending(a => a.Like)
                .ThenByDescending(a => a.Id)
                .ToListAsync();

            return View(images);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Contact()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}