const axios = require('axios');

async function testRegistration() {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/register', {
            name: "Test User New",
            email: "testnew1234567@example.com",
            password: "password123",
            phone: "+91 9999999999",
            interests: ["painting"]
        });
        console.log("Success:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("API Error Status:", error.response.status);
            console.error("API Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Network/Other Error:", error.message);
        }
    }
}

testRegistration();
