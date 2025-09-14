// Test script to verify API responses
const fetch = require('node-fetch');

const BASE_URL = "https://e-pickup.randomsoftsolution.in/api";

async function testBannersAPI() {
    console.log("=== Testing Banners API ===");
    try {
        const response = await fetch(`${BASE_URL}/banners`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log("Banners Response:", JSON.stringify(data, null, 2));
        
        if (data.status === "success" && data.data) {
            console.log(`✅ Banners API working - Found ${data.data.length} banners`);
            data.data.forEach(banner => {
                console.log(`- Banner: ${banner.title}, Image: ${banner.image_url || 'NULL'}`);
            });
        } else {
            console.log("❌ Banners API not returning expected format");
        }
    } catch (error) {
        console.error("❌ Banners API Error:", error.message);
    }
}

async function testEventsAPI() {
    console.log("\n=== Testing Events API ===");
    try {
        // Note: This might require authentication token
        const response = await fetch(`${BASE_URL}/events`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                // 'Authorization': 'Bearer YOUR_TOKEN_HERE' // Add token if needed
            }
        });
        
        const data = await response.json();
        console.log("Events Response:", JSON.stringify(data, null, 2));
        
        if (data.status === "success" && data.events) {
            console.log(`✅ Events API working - Found ${data.events.length} events`);
            data.events.forEach(event => {
                console.log(`- Event: ${event.event_name}, Venue: ${event.event_venue}, Image: ${event.event_pic || 'NULL'}`);
            });
        } else {
            console.log("❌ Events API not returning expected format or requires authentication");
        }
    } catch (error) {
        console.error("❌ Events API Error:", error.message);
    }
}

// Run tests
async function runTests() {
    await testBannersAPI();
    await testEventsAPI();
}

runTests();