using System;
using MongoDB.Bson;
using MongoDB.Driver;
using test2024.Models;
using System.Collections.Generic;
using static System.Runtime.InteropServices.JavaScript.JSType;
using static System.Net.Mime.MediaTypeNames;
using System.Xml.Linq;
using System.ComponentModel.Design;

namespace test2024.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly IMongoCollection<Company> _company;
        public CompanyRepository(IMongoClient client)
        {
            var database = client.GetDatabase("test-api");
            var collection = database.GetCollection<Company>("company");

            _company = collection;
        }

        public async Task<ObjectId> Create(Company company)
        {
            await _company.InsertOneAsync(company);
            return company.Id;
        }

        public async Task<bool> Delete(int companyId)
        {
            var filter = Builders<Company>.Filter.Eq(x => x.CompanyId, companyId);
            var result = await _company.DeleteOneAsync(filter);

            return result.DeletedCount == 1;
        }

        public Task<Company> Get(int companyId)
        {
            var filter = Builders<Company>.Filter.Eq(x => x.CompanyId, companyId);
            var company = _company.Find(filter).FirstOrDefaultAsync();

            return company;
        }

        public async Task<IEnumerable<Company>> GetAll()
        {
            var companies = await _company.Find(_ => true).ToListAsync();
            return companies;
        }

        public async Task<IEnumerable<Company>> GetByTicker(string stockTicker)
        {
            var filter = Builders<Company>.Filter.Eq(x => x.StockTicker, stockTicker);
            var tests = await _company.Find(filter).ToListAsync();

            return tests;
        }

        public async Task<bool> Update(int companyId, Company company)
        {
            var filter = Builders<Company>.Filter.Eq(x => x.CompanyId, companyId);
            var update = Builders<Company>.Update
                .Set(x => x.Name, company.Name)
                .Set(x => x.StockTicker, company.StockTicker);
            var result = await _company.UpdateOneAsync(filter, update);

            return result.ModifiedCount == 1;
        }
    }
}

