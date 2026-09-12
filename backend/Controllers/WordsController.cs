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
        private const int DefaultLimit = 2000;

        public WordsController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/words?offset=0&limit=2000
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Word>>> GetAll(
            [FromQuery] int offset = 0, [FromQuery] int limit = DefaultLimit)
        {
            if (offset < 0 || limit <= 0)
            {
                return BadRequest("offset must be non-negative and limit must be positive.");
            }

            var words = await _context.Words
                .FromSqlInterpolated(
                    $"SELECT id, word, definition, character_count FROM words ORDER BY id LIMIT {limit} OFFSET {offset}")
                .ToListAsync();

            return Ok(words);
        }

        // GET api/words/by-length/5?offset=0&limit=2000
        [HttpGet("by-length/{length}")]
        public async Task<ActionResult<IEnumerable<Word>>> GetByLength(
            int length, [FromQuery] int offset = 0, [FromQuery] int limit = DefaultLimit)
        {
            if (length <= 0)
            {
                return BadRequest("length must be a positive integer.");
            }

            if (offset < 0 || limit <= 0)
            {
                return BadRequest("offset must be non-negative and limit must be positive.");
            }

            var words = await _context.Words
                .FromSqlInterpolated(
                    $"SELECT id, word, definition, character_count FROM words WHERE character_count = {length} ORDER BY id LIMIT {limit} OFFSET {offset}")
                .ToListAsync();

            return Ok(words);
        }

        // GET api/words/by-letter/a?offset=0&limit=2000
        [HttpGet("by-letter/{letter}")]
        public async Task<ActionResult<IEnumerable<Word>>> GetByLetter(
            string letter, [FromQuery] int offset = 0, [FromQuery] int limit = DefaultLimit)
        {
            if (string.IsNullOrWhiteSpace(letter) || letter.Length != 1)
            {
                return BadRequest("letter must be a single character.");
            }

            if (offset < 0 || limit <= 0)
            {
                return BadRequest("offset must be non-negative and limit must be positive.");
            }

            var lowerLetter = letter.ToLowerInvariant();

            var words = await _context.Words
                .FromSqlInterpolated(
                    $"SELECT id, word, definition, character_count FROM words WHERE LOWER(LEFT(word, 1)) = {lowerLetter} ORDER BY id LIMIT {limit} OFFSET {offset}")
                .ToListAsync();

            return Ok(words);
        }

        // GET api/words/by-letter-and-length?letter=a&length=5&offset=0&limit=2000
        [HttpGet("by-letter-and-length")]
        public async Task<ActionResult<IEnumerable<Word>>> GetByLetterAndLength(
            [FromQuery] string letter, [FromQuery] int length,
            [FromQuery] int offset = 0, [FromQuery] int limit = DefaultLimit)
        {
            if (string.IsNullOrWhiteSpace(letter) || letter.Length != 1)
            {
                return BadRequest("letter must be a single character.");
            }

            if (length <= 0)
            {
                return BadRequest("length must be a positive integer.");
            }

            if (offset < 0 || limit <= 0)
            {
                return BadRequest("offset must be non-negative and limit must be positive.");
            }

            var lowerLetter = letter.ToLowerInvariant();

            var words = await _context.Words
                .FromSqlInterpolated(
                    $"SELECT id, word, definition, character_count FROM words WHERE LOWER(LEFT(word, 1)) = {lowerLetter} AND character_count = {length} ORDER BY id LIMIT {limit} OFFSET {offset}")
                .ToListAsync();

            return Ok(words);
        }
    }
}