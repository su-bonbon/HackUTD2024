using System;
using MongoDB.Bson;
using MongoDB.Driver;
using test2024.Models;
using System.Collections.Generic;
using static System.Runtime.InteropServices.JavaScript.JSType;
using static System.Net.Mime.MediaTypeNames;
using System.Xml.Linq;
using System.ComponentModel.Design;
using MongoDB.Bson.IO;
using Newtonsoft.Json;

namespace test2024.Repositories
{
    public class AnalysisRepository : IAnalysisRepository
    {
        private readonly IMongoCollection<Analysis> _analysis;
        public AnalysisRepository(IMongoClient client)
        {
            var database = client.GetDatabase("test-api");
            var collection = database.GetCollection<Analysis>("analysis");

            _analysis = collection;
        }

        public async Task<ObjectId> Create(Analysis analysis)
        {
            await _analysis.InsertOneAsync(analysis);
            return analysis.Id;
        }

        public Task<Analysis> Get(int id)
        {
            var filter = Builders<Analysis>.Filter.Eq(x => x.AnalysisId, id);
            var analysis = _analysis.Find(filter).FirstOrDefaultAsync();

            return analysis;
        }

        public async Task<IEnumerable<Analysis>> GetAll()
        {
            var analysis = await _analysis.Find(_ => true).ToListAsync();
            return analysis;
        }

        public async Task<IEnumerable<Analysis>> GetById(int id)
        {
            var filter = Builders<Analysis>.Filter.Eq(x => x.AnalysisId, id);
            var analysis = await _analysis.Find(filter).ToListAsync();

            return analysis;
        }

        public async Task<ObjectId> CreateFromJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                throw new ArgumentException("Input JSON cannot be null or empty.", nameof(json));
            }

            // Deserialize the JSON string into an Analysis object using Newtonsoft.Json
            Analysis analysis;
            try
            {
                analysis = Newtonsoft.Json.JsonConvert.DeserializeObject<Analysis>(json);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException("Failed to deserialize the provided JSON into an Analysis object.", ex);
            }

            // Log the deserialized object to check its values
            Console.WriteLine($"Deserialized Analysis object: {analysis?.AnalysisId}, {analysis?.CompanyFk}, {analysis?.BaseNcav}, {analysis?.QuantitativeAdjustments}");

            // Check if the analysis object has valid values
            if (analysis == null || analysis.AnalysisId == 0)
            {
                throw new InvalidOperationException("Deserialized object is invalid. Ensure that the JSON has the correct structure.");
            }

            // Insert the deserialized object into MongoDB
            await _analysis.InsertOneAsync(analysis);

            // Return the MongoDB ObjectId of the newly inserted document
            return analysis.Id;
        }

    }
}

