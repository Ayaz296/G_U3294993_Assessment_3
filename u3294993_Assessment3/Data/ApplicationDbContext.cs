using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace u3294993_Assessment3.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public DbSet<u3294993_Assessment3.Models.AIImage> AIImage { get; set; } = default!;
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
    }
}
