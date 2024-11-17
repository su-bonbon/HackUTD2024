using System;
using MongoDB.Bson;
using MongoDB.Driver;
using test2024.Models;

namespace test2024.Repositories
{
    public class TestRepository : ITestRepository
    {
        private readonly IMongoCollection<Test> _test;
        public TestRepository(IMongoClient client)
        {
            var database = client.GetDatabase("test-api");
            var collection = database.GetCollection<Test>("test");

            _test = collection;
        }
        public async Task<ObjectId> Create(Test test)
        {
            await _test.InsertOneAsync(test);
            return test.Id;
        }

        public Task Delete(ObjectId objectId)
        {
            throw new NotImplementedException();
        }

        public Task<Test> Get(ObjectId objectId)
        {
            var filter = Builders<Test>.Filter.Eq(x=>x.Id, objectId);
            var test = _test.Find(filter).FirstOrDefaultAsync();

            return test;
        }

        public async Task<IEnumerable<Test>> GetAll()
        {
            var tests = await _test.Find(_ => true).ToListAsync();
            return tests;
        }

        public async Task<IEnumerable<Test>> GetByName(string Name)
        {
            var filter = Builders<Test>.Filter.Eq(x => x.Title, Name);
            var tests = await _test.Find(filter).ToListAsync();

            return tests;
        }

        public async Task<bool> Update(ObjectId objectId, Test test)
        {
            var filter = Builders<Test>.Filter.Eq(x => x.Id, objectId);
            var update = Builders<Test>.Update
                .Set(x => x.Id, test.Id)
                .Set(x => x.Title, test.Title);
            var result = await _test.UpdateOneAsync(filter, update);

            return result.ModifiedCount == 1;
        }
    }
}

