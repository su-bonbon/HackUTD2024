using System;
using MongoDB.Bson;
using test2024.Models;

namespace test2024.Repositories
{
	public interface ICompanyRepository
	{
		Task<ObjectId> Create(Company company);
		Task<Company> Get(int id);
		Task<IEnumerable<Company>> GetAll();
        Task<IEnumerable<Company>> GetByTicker(string stockTicker);
		Task<bool> Update(int id, Company company);
		Task<bool> Delete(int id);
    }
}

