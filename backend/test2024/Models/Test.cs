using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace test2024.Models
{
    public class Test
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        // Unique identifier for the movie, often stored as an ObjectId in MongoDB
        public ObjectId Id { get; set; }

        // IMDb ID of the movie
        public string ImdbId { get; set; }

        // Title of the movie
        public string Title { get; set; }

        // Release date of the movie
        public DateTime ReleaseDate { get; set; }

        // Link to the trailer video
        public string TrailerLink { get; set; }

        // List of genres the movie belongs to
        public List<string> Genres { get; set; }

        // URL for the poster image
        public string Poster { get; set; }

        // List of URLs for backdrop images
        public List<string> Backdrops { get; set; }

        // List of review IDs associated with the movie
        public List<string> ReviewIds { get; set; }

    }
}