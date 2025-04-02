const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Your Google Drive file ID and API Key
const FILE_ID = '1ABRpByD4wGclgwPICkYUCav96JheklBJ'; 
const API_KEY = 'AIzaSyB3h-qLOj9TZ33mA2qzK1h0qtA7dKVl2t0'; // Replace with your actual API key

// Route for streaming the video
app.get('/stream', async (req, res) => {
    const range = req.headers.range; // Get the range header from the request
    const url = `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&key=${API_KEY}`;

    try {
        const fileInfo = await axios.head(url);  // Get the file info to determine file size
        const fileSize = fileInfo.headers['content-length'];
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            
            if (start >= fileSize) {
                res.status(416).send('Requested range not satisfiable');
                return;
            }
            
            const chunkSize = end - start + 1;
            const videoStream = await axios.get(url, {
                headers: {
                    Range: `bytes=${start}-${end}`
                },
                responseType: 'stream'
            });

            res.status(206);  // Partial content
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', chunkSize);
            res.setHeader('Content-Type', 'video/mp4');
            videoStream.data.pipe(res);  // Stream the video chunk to the client
        } else {
            // If no range header, send the entire video
            const videoStream = await axios.get(url, { responseType: 'stream' });
            res.setHeader('Content-Type', 'video/mp4');
            videoStream.data.pipe(res);  // Send the entire video
        }
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).send('Failed to stream video securely.');
    }
});

app.listen(port, () => {
    console.log(`✅ Secure video server running at http://localhost:${port}/stream`);
});