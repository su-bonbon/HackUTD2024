using System;
using MongoDB.Bson;
using test2024.Models;

namespace test2024.Repositories
{
	public interface ITestRepository
	{
		Task<ObjectId> Create(Test test);
		Task<Test> Get(ObjectId objectId);
		Task<IEnumerable<Test>> GetAll();
        Task<IEnumerable<Test>> GetByName(string Name);

		Task<bool> Update(ObjectId objectId, Test test);
		Task Delete(ObjectId objectId);

    }
}

