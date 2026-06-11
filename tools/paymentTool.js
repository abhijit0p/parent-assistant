import { loadStudents } from '../services/csvLoader.js';

export async function getNextPaymentDue(phone) {

    const students = await loadStudents();

    const student = students.find(
        s => s.phone === phone
    );

    if (!student) {
        return "Student not found";
    }

    return `Your amount due is ${student.amountDue}`;
}
export async function getPaymentStatus(phone) {
    const students = await loadStudents();

    const student = students.find(
        s => s.phone === phone
    );

    if (!student) {
        return "Student not found";
    }

    // Checking if the student has pending bills or balance due
    if (!student.amountDue || parseFloat(student.amountDue) === 0) {
        return "Great news! You have no outstanding dues at the moment.";
    }

    return `Your current pending balance due is ₹${student.amountDue}.`;
}