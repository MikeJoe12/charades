const express = require('express');
const XLSX = require('xlsx-js-style');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/words', (req, res) => {
    const excelPath = path.join(__dirname, 'List.xlsx');
    
    if (!fs.existsSync(excelPath)) {
        return res.status(404).json({ 
            error: 'Excel file not found',
            path: excelPath
        });
    }

    try {
        const workbook = XLSX.readFile(excelPath, {
            type: 'file',
            cellDates: true,
            cellNF: false,
            cellText: false
        });
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const categories = {
            "أفلام": [],
            "مسرحيات": [],
            "أغاني": [],
            "مسلسلات": []
        };

        for (let i = 1; i < data.length; i++) {
            if (data[i][0]) categories["أفلام"].push(data[i][0]);
            if (data[i][1]) categories["مسرحيات"].push(data[i][1]);
            if (data[i][2]) categories["أغاني"].push(data[i][2]);
            if (data[i][3]) categories["مسلسلات"].push(data[i][3]);
        }

        res.json(categories);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error reading word list',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});