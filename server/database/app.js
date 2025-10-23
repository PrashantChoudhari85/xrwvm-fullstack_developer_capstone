const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors')
const app = express()
app.use(express.json()); // Added
const port = 3030;

app.use(cors())
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/",{'dbName':'dealershipsDB'});


const Reviews = require('./review');

const Dealerships = require('./dealership');

try {
  Reviews.deleteMany({}).then(()=>{
    Reviews.insertMany(reviews_data['reviews']);
  });
  Dealerships.deleteMany({}).then(()=>{
    Dealerships.insertMany(dealerships_data['dealerships']);
  });
  
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
//Write your code here
try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
//Write your code here
  try {
    const documents = await Dealerships.find({state: req.params.state});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
//Write your code here
  try {
    const documents = await Dealerships.find({id: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.post('/insert_review', async (req, res) => {
    try {
      console.log('Received review:', req.body); // This will be parsed JSON object
      
      const data = req.body; // no need to JSON.parse
  
      const documents = await Reviews.find().sort({ id: -1 });
      let new_id = documents.length > 0 ? documents[0]['id'] + 1 : 1;
  
      const review = new Reviews({
        id: new_id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year,
      });
  
      const savedReview = await review.save();
      console.log('Review saved:', savedReview);
      res.json(savedReview);
    } catch (error) {
      console.error('Error in /insert_review:', error);
      res.status(500).json({ error: 'Error inserting review' });
    }
  });
  
  app.delete('/delete_review/:id', async (req, res) => {
    const reviewId = parseInt(req.params.id);
  
    try {
      const deletedReview = await Reviews.findOneAndDelete({ id: reviewId });
  
      if (!deletedReview) {
        return res.status(404).json({ error: "Review not found" });
      }
  
      res.json({ message: `Review with id ${reviewId} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Error deleting review' });
    }
  });
  
  
// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
