const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const imageQueue = require('../tasks');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const requestId = require('crypto').randomUUID();

  const newRequest = await prisma.request.create({ data: { id: requestId, status: 'Pending' } });

  const imageUrls = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', async (row) => {
      const { serialNumber, productName, inputImageUrls } = row;
      const urls = inputImageUrls.split(',');
      imageUrls.push(...urls);

      await prisma.product.create({
        data: {
          serialNumber: parseInt(serialNumber),
          productName,
          inputImageUrls: urls.toString()
        }
      });
    })
    .on('end', () => {
      imageQueue.add({ requestId, imageUrls });
      res.status(200).json({ requestId });
    });
});

router.get('/status/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const request = await prisma.request.findUnique({ where: { id: requestId } });

  if (!request) {
    return res.status(404).json({ error: 'Invalid request ID' });
  }

  const products = await prisma.product.findMany();
  const productData = products.map(product => ({
    serialNumber: product.serialNumber,
    productName: product.productName,
    inputImageUrls: product.inputImageUrls,
    outputImageUrls: product.outputImageUrls
  }));

  res.status(200).json({
    status: request.status,
    products: productData
  });
});

module.exports = router;
