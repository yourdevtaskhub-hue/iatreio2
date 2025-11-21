import fs from 'fs';

const data = {
  parentEmail: 'xsiwzos@gmail.com',
  parentName: 'Δοκιμή',
  appointmentDate: '2024-12-25',
  appointmentTime: '10:00',
  doctorName: 'Dr. Άννα Μαρία Φύτρου'
};

fs.writeFileSync('tmp-email-test.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Test JSON file created successfully');
console.log('Content:', JSON.stringify(data, null, 2));

