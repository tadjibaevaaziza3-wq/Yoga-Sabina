
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test_upload.txt'));
    formData.append('path', 'test-debug');

    try {
        const response = await axios.post('http://localhost:3000/api/admin/assets/upload', formData, {
            headers: formData.getHeaders(),
        });
        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testUpload();
