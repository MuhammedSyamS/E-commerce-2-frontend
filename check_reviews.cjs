const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });
const Product = require('../server/models/Product');

async function checkReviews() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({ numReviews: { $gt: 0 } }).select('name reviews numReviews').limit(5).lean();
        
        products.forEach(p => {
            console.log(`Product: ${p.name}, Reviews: ${p.numReviews}`);
            p.reviews.forEach((r, i) => {
                const imgCount = r.images ? r.images.length : 0;
                const vidCount = r.videos ? r.videos.length : 0;
                const imgSize = r.images ? JSON.stringify(r.images).length : 0;
                console.log(`  Review ${i}: ${imgCount} images, ${vidCount} videos, Total media size approx: ${ (imgSize / 1024).toFixed(2) } KB`);
            });
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkReviews();
