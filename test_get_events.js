// Test file to check what getEvents() fetches
import EventService from './src/services/apiService/event_service.js';

async function testGetEvents() {
  console.log("=== Testing getEvents() Method ===");
  
  try {
    const response = await EventService.getEvents();
    
    console.log("=== GetEvents Response ===");
    console.log("Success:", response.success);
    console.log("Code:", response.code);
    console.log("Message:", response.message);
    console.log("Data type:", typeof response.data);
    console.log("Data length:", Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log("=== First Event Sample ===");
      console.log(JSON.stringify(response.data[0], null, 2));
      
      console.log("=== Event Structure ===");
      const firstEvent = response.data[0];
      console.log("Available fields:", Object.keys(firstEvent));
      
      // Check common fields
      console.log("Event ID:", firstEvent.id || firstEvent.event_id || firstEvent._id);
      console.log("Event Name:", firstEvent.name || firstEvent.title || firstEvent.event_name);
      console.log("Location:", firstEvent.location || firstEvent.venue || firstEvent.address);
      console.log("Date:", firstEvent.date || firstEvent.start_date || firstEvent.event_date);
      console.log("Status:", firstEvent.status || firstEvent.event_status);
    } else {
      console.log("No events found or empty array");
    }
    
  } catch (error) {
    console.error("=== GetEvents Error ===");
    console.error("Error:", error.message);
  }
}

// Run the test
testGetEvents();
