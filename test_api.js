// Test script to verify API responses
const fetch = require('node-fetch');

const BASE_URL = "https://e-pickup.randomsoftsolution.in/api";

async function testBannersAPI() {
    try {
        const response = await fetch(`${BASE_URL}/banners`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.status === "success" && data.data) {
            data.data.forEach(banner => {
                // You can add assertions here
            });
        } 
    } catch (error) {
        console.error("❌ Banners API Error:", error.message);
    }
}

async function testEventsAPI() {
    try {
        const response = await fetch(`${BASE_URL}/events`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                // 'Authorization': 'Bearer YOUR_TOKEN_HERE' // Add token if needed
            }
        });
        
        const data = await response.json();
        
        if (data.status === "success" && data.events) {
            data.events.forEach(event => {
                // You can add assertions here
            });
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