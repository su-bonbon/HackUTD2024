using System;
using MongoDB.Bson;
using test2024.Models;

namespace test2024.Repositories
{
	public interface IPersonRepository
	{
		Task<ObjectId> Create(Person test);
		Task<Person> Get(ObjectId id);
		Task<IEnumerable<Person>> GetAll();
        Task<IEnumerable<Person>> GetByName(string Name);
		Task<bool> Update(ObjectId id, string name);
		Task<bool> Delete(ObjectId id);

    }
}

