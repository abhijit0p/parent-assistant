import  {loadStudents}  from '../services/csvLoader.js';

export async function getPaymentLink(phone){
 const students = await loadStudents();

    const student = students.find(
        s => s.phone === phone
    );

    if (!student) {
        return "Student not found";
    }

        return `Your payment link is: ${student.paymentLink}`;    
}
