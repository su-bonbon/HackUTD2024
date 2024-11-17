using System;
using MongoDB.Bson;
using test2024.Models;

namespace test2024.Repositories
{
	public interface IAnalysisRepository
	{
		Task<ObjectId> Create(Analysis analysis);
		Task<Analysis> Get(int id);
		Task<IEnumerable<Analysis>> GetAll();
        Task<IEnumerable<Analysis>> GetById(int id);
        //Task<bool> Update(int id, Analysis analysis);
        //Task<bool> Delete(int id);
        Task<ObjectId> CreateFromJson(string json);
    }
}

