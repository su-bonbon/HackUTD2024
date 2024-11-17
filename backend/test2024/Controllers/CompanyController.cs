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
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyRepository _companyRepository;
        public CompanyController(ICompanyRepository companyRepository)
        {
            _companyRepository = companyRepository;
        }

        [HttpPost]
        public async Task<IActionResult> Create(Company company)
        {
            var id = await _companyRepository.Create(company);
            return new JsonResult(id.ToString());
        }

        [HttpGet("get/{companyId}")]
        public async Task<IActionResult> Get(int companyId)
        {
            var company = await _companyRepository.Get(companyId);
            return new JsonResult(company);
        }

        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _companyRepository.GetAll();
            return new JsonResult(companies);
        }

        [HttpGet("getbyticker")]
        public async Task<IActionResult> Getbyticker(string ticker)
        {
            var company = await _companyRepository.GetByTicker(ticker);
            return new JsonResult(company);
        }

        [HttpDelete("{companyId}")]
        public async Task<IActionResult> Delete(int companyId)
        {
            var company = await _companyRepository.Delete(companyId);
            return new JsonResult(company);
        }

        [HttpPut("{companyId}")]
        public async Task<IActionResult> Update(int companyId, string name, string ticker)
        {
            var tempComp = new Company();
            tempComp.Name = name;
            tempComp.StockTicker = ticker;
            var isUpdated = await _companyRepository.Update(companyId, tempComp);
            return new JsonResult(isUpdated);
        }
    }
}

