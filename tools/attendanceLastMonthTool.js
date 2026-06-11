import { loadStudents } from '../services/csvLoader.js';

export async function getAttendanceLastMonth(phone) {
 const students = await loadStudents();

    const student = students.find(
        s => s.phone === phone
    );

    if (!student) {
        return "Student not found";
    }

    return `Your attendance for last month is ${student.classesLastMonth}`;

}
