using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using test2024.Models;
using test2024.Repositories;
using MongoDB.Bson;

namespace test2024.Controllers
{
    [Route("api/[Controller]")]
    public class TestController : ControllerBase
    {
        private readonly ITestRepository _testRepository;
        public TestController(ITestRepository testRepository)
        {
            _testRepository = testRepository;
        }

        [HttpPost]
        public async Task<IActionResult> Create(Test test)
        {
            var id = await _testRepository.Create(test);
            return new JsonResult(id.ToString());
        }

        [HttpGet("get/{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var test = await _testRepository.Get(ObjectId.Parse(id));
            return new JsonResult(test);
        }

        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var test = await _testRepository.GetAll();
            return new JsonResult(test);
        }
    }
}

