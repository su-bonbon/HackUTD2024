using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace test2024.Models
{
	public class Analysis
	{
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; }

        [BsonElement("analysis_id")]
        public int AnalysisId { get; set; }

        [BsonElement("company_fk")]
        public int CompanyFk { get; set; }

        [BsonElement("base_ncav")]
        public float BaseNcav { get; set; }

        [BsonElement("quantitative_adjustments")]
        public string QuantitativeAdjustments { get; set; } = string.Empty;

        [BsonElement("adjustment_reasons")]
        public string AdjustmentReasons { get; set; } = string.Empty;

        [BsonElement("final_ncav")]
        public float FinalNcav { get; set; }

        [BsonElement("initial_research")]
        public string InitialResearch { get; set; } = string.Empty;

        [BsonElement("final_analysis")]
        public string FinalAnalysis { get; set; } = string.Empty;
    }
}

