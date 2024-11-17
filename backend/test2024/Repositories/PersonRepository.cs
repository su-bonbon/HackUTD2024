using System;
using MongoDB.Bson;
using MongoDB.Driver;
using test2024.Models;
using System.Collections.Generic;
using static System.Runtime.InteropServices.JavaScript.JSType;
using static System.Net.Mime.MediaTypeNames;

namespace test2024.Repositories
{
    public class PersonRepository : IPersonRepository
    {
        private readonly IMongoCollection<Person> _person;
        public PersonRepository(IMongoClient client)
        {
            var database = client.GetDatabase("test-api");
            var collection = database.GetCollection<Person>("person");

            _person = collection;
        }

        public async Task<ObjectId> Create(Person person)
        {
            await _person.InsertOneAsync(person);
            return person.Id;
        }

        public Task<bool> Delete(ObjectId id)
        {
            throw new NotImplementedException();
        }

        public Task<Person> Get(ObjectId id)
        {
            var filter = Builders<Person>.Filter.Eq(x => x.Id, id);
            var person = _person.Find(filter).FirstOrDefaultAsync();

            return person;
        }

        public Task<IEnumerable<Person>> GetAll()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Person>> GetByName(string Name)
        {
            throw new NotImplementedException();
        }

        public Task<bool> Update(ObjectId id, string name)
        {
            throw new NotImplementedException();
        }
    }
}

