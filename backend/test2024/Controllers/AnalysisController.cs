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
    public class AnalysisController : ControllerBase
    {
        private readonly IAnalysisRepository _analysisRepository;
        public AnalysisController(IAnalysisRepository analysisRepository)
        {
            _analysisRepository = analysisRepository;
        }

        [HttpPost]
        public async Task<IActionResult> Create(Analysis analysis)
        {
            var id = await _analysisRepository.Create(analysis);
            return new JsonResult(id.ToString());
        }

        [HttpGet("get/{analysisId}")]
        public async Task<IActionResult> Get(int analysisId)
        {
            var analysis = await _analysisRepository.Get(analysisId);
            return new JsonResult(analysis);
        }

        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _analysisRepository.GetAll();
            return new JsonResult(companies);
        }

        [HttpPost("new")]
        public async Task<IActionResult> CreateFromJson(string json)
        {
            var id = await _analysisRepository.CreateFromJson(json);
            return new JsonResult(id.ToString());
        }

        //[HttpGet("getby")]
        //public async Task<IActionResult> GetbyId(int analysisId)
        //{
        //    var analysis = await _analysisRepository.GetById(analysisId);
        //    return new JsonResult(analysis);
        //}

    }
}

