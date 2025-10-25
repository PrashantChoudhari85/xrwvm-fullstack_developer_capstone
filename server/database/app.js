/* jshint esversion: 8 */
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3030;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/", { dbName: 'dealershipsDB' });

const Reviews = require('./review');
const Dealerships = require('./dealership');

try {
    Reviews.deleteMany({}).then(() => {
        Reviews.insertMany(reviews_data.reviews);
    });
    Dealerships.deleteMany({}).then(() => {
        Dealerships.insertMany(dealerships_data.dealerships);
    });
} catch (error) {
    console.error('Error initializing data:', error);
}

// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Fetch reviews by dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        const documents = await Reviews.find({ dealership: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    try {
        const documents = await Dealerships.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Fetch dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const documents = await Dealerships.find({ state: req.params.state });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Fetch dealer by id
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const documents = await Dealerships.find({ id: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Insert review
app.post('/insert_review', async (req, res) => {
    try {
        console.log('Received review:', req.body);
        const data = req.body;

        const documents = await Reviews.find().sort({ id: -1 });
        let new_id = documents.length > 0 ? documents[0].id + 1 : 1;

        const review = new Reviews({
            id: new_id,
            name: data.name,
            dealership: data.dealership,
            review: data.review,
            purchase: data.purchase,
            purchase_date: data.purchase_date,
            car_make: data.car_make,
            car_model: data.car_model,
            car_year: data.car_year
        });

        const savedReview = await review.save();
        console.log('Review saved:', savedReview);
        res.json(savedReview);
    } catch (error) {
        console.error('Error in /insert_review:', error);
        res.status(500).json({ error: 'Error inserting review' });
    }
});

// Delete review
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

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
