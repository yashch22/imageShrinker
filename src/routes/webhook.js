const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.post('/webhook', async (req, res) => {
    const { requestId, imageUrls, status } = req.body;
    console.log("webhook called with status ---- ", status)

    if (!requestId || !status) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    try {
        // Update the request status
        const request = await prisma.request.update({
            where: { id: requestId },
            data: { status, updatedAt: new Date() },
        });

        // If the status is 'Completed', update the image URLs in the products
        if (status === 'Completed' && imageUrls ) {
            await prisma.product.updateMany({
                where: { inputImageUrls: { equals: imageUrls } },
                data: { outputImageUrls: imageUrls },
            });
        }

        res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
