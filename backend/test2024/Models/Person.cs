using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace test2024.Models
{
    public class Person
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; }

        public string Name { get; set; }
    }
}