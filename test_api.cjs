const axios = require('axios');

async function testApi() {
    const slug = 'mechanical-keychron-k2'; // Use a known slug
    const baseUrl = 'http://localhost:5005/api'; 
    
    try {
        console.log(`Fetching product: ${slug}...`);
        const productRes = await axios.get(`${baseUrl}/products/${slug}`);
        const product = productRes.data;
        console.log(`Product found: ${product.name} (_id: ${product._id})`);
        console.log(`Has reviews: ${product.numReviews}`);
        
        console.log(`Fetching full reviews for ID: ${product._id}...`);
        const start = Date.now();
        const reviewsRes = await axios.get(`${baseUrl}/products/${product._id}/reviews/full`);
        const end = Date.now();
        console.log(`Reviews fetched in ${end - start}ms. Count: ${reviewsRes.data.length}`);
        
        // Test with SLUG as ID just in case
        console.log(`Testing with SLUG as ID fallback...`);
        try {
            await axios.get(`${baseUrl}/products/${slug}/reviews/full`);
            console.log("Slug fallback worked (unexpectedly?)");
        } catch (err) {
            console.log(`Slug fallback failed as expected: ${err.response?.status} ${err.response?.data?.message}`);
        }
        
    } catch (err) {
        console.error("Test failed:", err.message);
        if (err.response) console.error("Data:", err.response.data);
    }
}

testApi();
