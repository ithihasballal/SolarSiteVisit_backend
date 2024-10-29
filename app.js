require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit'); // Add PDFKit for PDF generation
const ExcelJS = require('exceljs'); // Add ExcelJS for Excel generation
const db = require('./db');


const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json());

// Create connection to the MySQL database
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Ithihas@97',
//     database: 'sitevisit'
// });


// db.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Connected to MySQL database');
// });

// Create a new site visit
app.post('/api/site-visits', (req, res) => {
    const {
        borrower_name, project_details, cod_date, google_maps_link, site_visit_date, visited_prepared_by, dealing_officer,
        approach_road, fencing, signboard, site_personnel_site_managers, site_personnel_om_personnel, site_personnel_security_staff,
        separate_facilities, mounting_structures, near_shading, drainage, wire_arrangement, wire_quality, loose_wires,
        panel_quality, cleaning_frequency, cleaning_technology, cleaning_in_progress, cleaning_quality, cooperation_level,
        grid_issues, performance_data, logs_issue, key_policies_displayed, third_party_contractors, hazardous_waste_disposal,
        water_source, groundwater_noc, rainwater_harvesting, soil_quality_impact, biodiversity_incidents, bird_guard_installed,
        lightning_arrestors, incident_records, remedial_action, ehs_training, fire_fighting_system, first_aid_kit,
        ambulance_stored, anti_venom_kit, social_security_benefits, child_labor_observed, overall_site_visit, additional_observations
    } = req.body;

    const query = `INSERT INTO sitevisittable SET ?`;
    const data = {
        borrower_name, project_details, cod_date, google_maps_link, site_visit_date, visited_prepared_by, dealing_officer,
        approach_road, fencing, signboard, site_personnel_site_managers, site_personnel_om_personnel, site_personnel_security_staff,
        separate_facilities, mounting_structures, near_shading, drainage, wire_arrangement, wire_quality, loose_wires,
        panel_quality, cleaning_frequency, cleaning_technology, cleaning_in_progress, cleaning_quality, cooperation_level,
        grid_issues, performance_data, logs_issue, key_policies_displayed, third_party_contractors, hazardous_waste_disposal,
        water_source, groundwater_noc, rainwater_harvesting, soil_quality_impact, biodiversity_incidents, bird_guard_installed,
        lightning_arrestors, incident_records, remedial_action, ehs_training, fire_fighting_system, first_aid_kit,
        ambulance_stored, anti_venom_kit, social_security_benefits, child_labor_observed, overall_site_visit, additional_observations
    };

    db.query(query, data, (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({ message: 'Site visit added successfully', id: result.insertId });
        }
    });
});

// Get all site visits
app.get('/api/site-visits', (req, res) => {
    const query = 'SELECT * FROM sitevisittable';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(results);
        }
    });
});

// Get a specific site visit by ID
app.get('/api/site-visits/:id', (req, res) => {
    const query = 'SELECT * FROM sitevisittable WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(result[0]);
        }
    });
});

// Update a site visit
app.put('/api/site-visits/:id', (req, res) => {
    const query = 'UPDATE sitevisittable SET ? WHERE id = ?';
    db.query(query, [req.body, req.params.id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({ message: 'Site visit updated successfully' });
        }
    });
});

// Delete a site visit
app.delete('/api/site-visits/:id', (req, res) => {
    const query = 'DELETE FROM sitevisittable WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({ message: 'Site visit deleted successfully' });
        }
    });
});

// Download site visit details as PDF
app.post('/api/site-visits/:id/download-pdf', (req, res) => {
    const query = 'SELECT * FROM sitevisittable WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        
        // Check if the result is correctly fetched
        console.log('Result:', result); // Log the result to check if data exists
        
        if (result.length === 0) {
            return res.status(404).send('Site visit not found');
        }

        const siteVisit = result[0]; // Extract the first result (since it should be a single row)
        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', `attachment; filename="site_visit_${req.params.id}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        
        doc.pipe(res);
        
        // Title of the PDF
        doc.fontSize(25).text(`Site Visit Details for ID: ${req.params.id}`, { align: 'center' });
        doc.moveDown();

        // Iterate over the fields of the site visit and add them to the PDF
        for (const [key, value] of Object.entries(siteVisit)) {
            console.log(`${key}: ${value}`); // Log each field to verify the content
            doc.fontSize(12).text(`${key}: ${value}`);
        }
        

        doc.end();
    });
});


// Download site visit details as Excel
app.post('/api/site-visits/:id/download-excel', async (req, res) => {
    const query = 'SELECT * FROM sitevisittable WHERE id = ?';
    db.query(query, [req.params.id], async (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (result.length === 0) {
            return res.status(404).send('Site visit not found');
        }

        const siteVisit = result[0];
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Site Visit ${req.params.id}`);

        // Add header row
        worksheet.addRow(['Field', 'Value']);

        // Add site visit fields to the Excel
        for (const [key, value] of Object.entries(siteVisit)) {
            worksheet.addRow([key, value]);
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="site_visit_${req.params.id}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    });
});

// Reject a site visit and send a notification
app.post('/api/site-visits/:id/reject', (req, res) => {
    const id = req.params.id;
    // Logic for rejecting the site visit (e.g., updating the status in the database)

    // Send notification
    res.json({ message: `Your form with ID ${id} is rejected.` });
});

// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
