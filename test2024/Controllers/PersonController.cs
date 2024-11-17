using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using test2024.Models;
using test2024.Repositories;
using MongoDB.Bson;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace test2024.Controllers
{
    [Route("api/[Controller]")]
    public class PersonController : ControllerBase
    {
        private readonly IPersonRepository _personRepository;
        public PersonController(IPersonRepository personRepository)
        {
            _personRepository = personRepository;
        }

        [HttpPost]
        public async Task<IActionResult> Create(Person person)
        {
            var id = await _personRepository.Create(person);
            return new JsonResult(id.ToString());
        }

        [HttpGet("get/{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var person = await _personRepository.Get(ObjectId.Parse(id));
            return new JsonResult(person);
        }
    }
}

