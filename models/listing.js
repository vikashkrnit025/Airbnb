const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review =require("./review.js");

const listingSchema = new Schema({
  // other fields...
  image: {
    filename: String,
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=",
      set: function(v) {
        // Only use default if value is null or undefined
        // This allows empty strings to pass through if intentional
        if (v === null || v === undefined) {
          return "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=";
        }
        // Return the user-provided value
        return v;
      }
    }
  },
  // other fields...
  title:String,
  description:String,
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",   
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({_id: { $in: listing.reviews }});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;