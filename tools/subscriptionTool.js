import { loadStudents } from '../services/csvLoader.js';

export async function getSubscriptionDetails(phone){
    const students = await loadStudents();

    const student = students.find(
        s => s.phone === phone
    );

    if (!student) {
        return "Student not found";
    }

    return `Your current subscription is ${student.subscription}`;    
}

