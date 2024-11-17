using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace test2024.Models
{
	public class Company
	{
        [BsonId] // Specifies that this is the primary key in MongoDB
        [BsonRepresentation(BsonType.ObjectId)] // Represents MongoDB's ObjectId type
        public ObjectId Id { get; set; }

        // A unique integer identifier for the company (custom id field)
        [BsonElement("id")] // Maps to the "id" field in the MongoDB document
        [BsonRepresentation(BsonType.Int32)] // Stored as an integer in MongoDB
        public int CompanyId { get; set; }

        // The name of the company
        [BsonElement("name")] // Maps to the "name" field in the MongoDB document
        public string Name { get; set; } = string.Empty;

        // The stock ticker for the company
        [BsonElement("stock_ticker")] // Maps to the "stock_ticker" field in the MongoDB document
        public string StockTicker { get; set; } = string.Empty;
    }
}

