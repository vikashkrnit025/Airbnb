const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review =require("./review.js");
const { types, string } = require("joi");

const listingSchema = new Schema({
  // other fields...
  image: {
    url:String,
    filename:String,
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
  
  owner:{
      type: Schema.Types.ObjectId,
      ref: "User",
   },
    
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({_id: { $in: listing.reviews }});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;