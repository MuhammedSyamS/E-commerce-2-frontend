const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });
const Product = require('../server/models/Product');

async function testEverything() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const p = await Product.findOne({ numReviews: { $gt: 0 } }).lean();
        if (!p) {
            console.log("No product with reviews found in DB!");
            process.exit(0);
        }
        
        const slug = p.slug;
        const id = p._id.toString();
        const baseUrl = 'http://localhost:5005/api';
        
        console.log(`Using product: ${p.name}`);
        console.log(`Slug: ${slug}`);
        console.log(`ID: ${id}`);
        
        console.log(`\n1. Testing GET /api/products/${slug}`);
        const productRes = await axios.get(`${baseUrl}/products/${slug}`);
        console.log(`Success: Found ${productRes.data.name}`);
        console.log(`Reviews in initial fetch: ${productRes.data.reviews?.length || 0}`);
        
        console.log(`\n2. Testing GET /api/products/${id}/reviews/full`);
        const start = Date.now();
        const reviewsRes = await axios.get(`${baseUrl}/products/${id}/reviews/full`);
        const end = Date.now();
        console.log(`Success: Fetched ${reviewsRes.data.length} full reviews in ${end - start}ms`);
        
        if (reviewsRes.data.length > 0) {
            const first = reviewsRes.data[0];
            console.log(`First Review Sample:`, {
                name: first.name,
                rating: first.rating,
                comment: first.comment?.substring(0, 30),
                images: first.images?.length,
                videos: first.videos?.length
            });
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err.message);
        if (err.response) console.error("Error Status:", err.response.status, "Data:", err.response.data);
        process.exit(1);
    }
}

testEverything();
