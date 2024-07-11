const { QueueScheduler, Worker, Queue } = require('bullmq');
const axios = require('axios');
const jimp = require('jimp');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

const imageQueue = new Queue('image processing', {
    connection: process.env.REDIS_URL
});

const worker = new Worker('image processing', async job => {
    console.log("started the async job ");
    const { requestId, imageUrls } = job.data;
    console.log("request data. -   ", requestId);

    const outputUrls = [];
    for (const url of imageUrls) {
        try {
            const response = await axios({
                url,
                responseType: 'arraybuffer'
            });

            const buffer = Buffer.from(response.data, 'binary');

            // Load image buffer with jimp
            const image = await jimp.read(buffer);
            console.log("image --- ", image);

            // Resize the image
            await image.scale(0.5); // Resize to 50% of original size

            const outputPath = path.join(__dirname, 'output', path.basename(url));

            // Save resized image
            await image.writeAsync(outputPath);

            outputUrls.push(outputPath);
        } catch (error) {
            console.error(`Failed to process image ${url}:`, error);
        }
    }

    console.log("updating the request to o completed");
    await prisma.request.update({
        where: { id: requestId },
        data: { status: 'Completed', updatedAt: new Date() }
    });

    console.log("updating the path to2 --- ", outputUrls);
    console.log("updating the request to o completed");
    await prisma.product.updateMany({
        where: { inputImageUrls: { hasSome: imageUrls } },
        data: { outputImageUrls: outputUrls }
    });

    // Notify the webhook endpoint
    try {
        await axios.post('http://localhost:3000/webhook', {
            requestId,
            imageUrls: outputUrls,
            status: 'Completed'
        });
    } catch (error) {
        console.error('Error notifying webhook:', error);
    }

    console.log("reached here");

    return outputUrls;
});

module.exports = imageQueue;
