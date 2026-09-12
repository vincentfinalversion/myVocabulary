using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WordsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WordsController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/words/by-length/5
        [HttpGet("by-length/{length}")]
        public async Task<ActionResult<IEnumerable<Word>>> GetByLength(int length)
        {
            if (length <= 0)
            {
                return BadRequest("length must be a positive integer.");
            }
            
            var words = await _context.Words
                .FromSqlInterpolated($"SELECT id, word, definition, character_count FROM words WHERE character_count = {length}")
                .ToListAsync();

            return Ok(words);
        }

        // GET api/words/by-letter-and-length?letter=a&length=5
        [HttpGet("by-letter-and-length")]
        public async Task<ActionResult<IEnumerable<Word>>> GetByLetterAndLength(
            [FromQuery] string letter, [FromQuery] int length)
        {
            if (string.IsNullOrWhiteSpace(letter) || letter.Length != 1)
            {
                return BadRequest("letter must be a single character.");
            }

            var lowerLetter = letter.ToLower();

            var words = await _context.Words
                .FromSqlInterpolated(
                    $"SELECT id, word, definition, character_count FROM words WHERE LOWER(LEFT(word, 1)) = {lowerLetter} AND character_count = {length}")
                .ToListAsync();

            return Ok(words);
        }
    }
}