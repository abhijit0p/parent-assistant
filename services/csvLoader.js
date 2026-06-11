import fs from 'fs';
import  csv from 'csv-parser';

export async function loadStudents() {

    return new Promise((resolve, reject) => {

        const students = [];

        fs.createReadStream('./data/students.csv')
            .pipe(csv())
            .on('data', row => students.push(row))
            .on('end', () => resolve(students))
            .on('error', reject);
    });
}

