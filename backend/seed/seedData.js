export const doctorsSeedData = [
  {
    "id": "doc-001",
    "name": "Prof. Dr. Shishir Basak",
    "specialty": "Medicine and Cardiology",
    "experience": 12,
    "rating": 4.9,
    "reviewCount": 214,
    "fee": 600,
    "initials": "SM",
    "gender": "male",
    "availableToday": true,
    "availableThisWeek": true,
    "isOnline": true,
    "queueCount": 3,
    "bio": "MBBS, MCPS (Medicine), MRCP(UK), D.Card (DU), MD (Cardiology). Board-certified cardiologist with 12 years of experience in preventive and interventional cardiology.",
    "availableSlots": [
      { "date": "Today", "times": ["9:00 AM", "11:30 AM", "2:00 PM"] },
      { "date": "Tomorrow", "times": ["10:00 AM", "1:00 PM", "4:30 PM"] },
      { "date": "Wed, Apr 30", "times": ["9:30 AM", "3:00 PM"] }
    ]
  },
  {
    "id": "doc-002",
    "name": "Prof. Dr. Md. Nazrul Islam",
    "specialty": "Neuro Medicine Specialist",
    "experience": 8,
    "rating": 4.8,
    "reviewCount": 156,
    "fee": 700,
    "initials": "MC",
    "gender": "male",
    "availableToday": false,
    "availableThisWeek": true,
    "isOnline": false,
    "queueCount": 0,
    "bio": "MBBS, MCPS (Medicine), MD(Neurology). Specialist in cosmetic and medical dermatology with a focus on skin cancer screening and acne treatment.",
    "availableSlots": [
      { "date": "Tomorrow", "times": ["9:00 AM", "10:30 AM", "3:00 PM"] },
      { "date": "Fri, May 2", "times": ["11:00 AM", "2:30 PM", "5:00 PM"] }
    ]
  },
  {
    "id": "doc-003",
    "name": "Dr. Md Baqi Billah",
    "specialty": "Orthopaedics Specialis",
    "experience": 15,
    "rating": 5.0,
    "reviewCount": 312,
    "fee": 800,
    "initials": "ER",
    "gender": "male",
    "availableToday": true,
    "availableThisWeek": true,
    "isOnline": true,
    "queueCount": 5,
    "bio": "MBBS, MCPS(Surgery), MS(Ortho), BCS(Health). Dedicated pediatrician committed to providing compassionate care for children and adolescents of all ages.",
    "availableSlots": [
      { "date": "Today", "times": ["2:00 PM", "3:30 PM", "4:30 PM"] },
      { "date": "Tomorrow", "times": ["8:00 AM", "10:00 AM"] }
    ]
  },
  {
    "id": "doc-004",
    "name": "Prof. Dr. Syed Alamgir Safwath",
    "specialty": "Medicine & Liver Specialist",
    "experience": 20,
    "rating": 4.7,
    "reviewCount": 189,
    "fee": 600,
    "initials": "JW",
    "gender": "male",
    "availableToday": true,
    "availableThisWeek": true,
    "isOnline": true,
    "queueCount": 2,
    "bio": "MBBS, MCPS(Medicine), MD(Gastroenterology). Expert neurologist specializing in complex neurological disorders, migraines, and sleep medicine.",
    "availableSlots": [
      { "date": "Today", "times": ["1:00 PM", "2:00 PM"] },
      { "date": "Mon, May 5", "times": ["9:00 AM", "11:00 AM"] }
    ]
  },
  {
    "id": "doc-005",
    "name": "Prof. Dr. Shamsun Nahar Begum (Hena)",
    "specialty": "Obs & Gynae",
    "experience": 10,
    "rating": 4.9,
    "reviewCount": 245,
    "fee": 900,
    "initials": "AO",
    "gender": "female",
    "availableToday": false,
    "availableThisWeek": true,
    "isOnline": false,
    "queueCount": 0,
    "bio": "MBBS, FCPS (Obs & Gynae). Psychiatrist with expertise in anxiety, depression, and adolescent mental health. Focuses on holistic care.",
    "availableSlots": [
      { "date": "Tue, May 6", "times": ["10:00 AM", "1:00 PM", "3:00 PM"] },
      { "date": "Wed, May 7", "times": ["11:30 AM", "4:00 PM"] }
    ]
  },
  {
    "id": "doc-006",
    "name": "Dr. Ahmed Riad Chowdhury",
    "specialty": "Psychiatry Specialist",
    "experience": 14,
    "rating": 4.8,
    "reviewCount": 178,
    "fee": 700,
    "initials": "TB",
    "gender": "male",
    "availableToday": true,
    "availableThisWeek": true,
    "isOnline": true,
    "queueCount": 4,
    "bio": "MBBS, M.Phil (Psychiatry). Orthopedic surgeon specializing in sports medicine, joint replacement, and fracture care.",
    "availableSlots": [
      { "date": "Today", "times": ["10:30 AM", "2:30 PM"] },
      { "date": "Tomorrow", "times": ["9:00 AM", "11:00 AM"] }
    ]
  }
];

export const consultationsSeedData = [
  {
    "id": "cons-001",
    "patientUid": "seed-uid-001",
    "doctorId": "doc-001",
    "doctorName": "Prof. Dr. Shishir Basak",
    "specialty": "Medicine and Cardiology",
    "doctorInitials": "SM",
    "date": "April 20, 2025",
    "duration": "18 mins",
    "status": "Completed",
    "summary": "Discussed chest discomfort and reviewed ECG results. Advised lifestyle changes.",
    "prescriptionId": "rx-001"
  },
  {
    "id": "cons-002",
    "patientUid": "seed-uid-001",
    "doctorId": "doc-004",
    "doctorName": "Prof. Dr. Syed Alamgir Safwath",
    "specialty": "Medicine & Liver Specialist",
    "doctorInitials": "JW",
    "date": "April 15, 2025",
    "duration": "12 mins",
    "status": "Completed",
    "summary": "Seasonal flu symptoms. Prescribed rest and hydration.",
    "prescriptionId": "rx-002"
  },
  {
    "id": "cons-003",
    "patientUid": "seed-uid-001",
    "doctorId": "doc-003",
    "doctorName": "Dr. Md Baqi Billah",
    "specialty": "Orthopaedics Specialis",
    "doctorInitials": "ER",
    "date": "April 05, 2025",
    "duration": "25 mins",
    "status": "Completed",
    "summary": "Skin rash evaluation. Recommended topical cream and allergy test.",
    "prescriptionId": "rx-003"
  }
];

export const prescriptionsSeedData = [
  {
    "id": "rx-001",
    "patientUid": "seed-uid-001",
    "doctorId": "doc-001",
    "doctorName": "Prof. Dr. Shishir Basak",
    "doctorInitials": "SM",
    "specialty": "Cardiology",
    "date": "April 20, 2025",
    "diagnosis": "Mild hypertension",
    "medicines": [
      { "name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "duration": "30 days" },
      { "name": "Aspirin", "dosage": "81mg", "frequency": "Once daily", "duration": "30 days" }
    ],
    "notes": "Avoid excessive salt intake. Follow up in 4 weeks.",
    "valid": true
  },
  {
    "id": "rx-002",
    "patientUid": "seed-uid-001",
    "doctorId": "doc-004",
    "doctorName": "Prof. Dr. Syed Alamgir Safwath",
    "doctorInitials": "JW",
    "specialty": "General Medicine",
    "date": "April 15, 2025",
    "diagnosis": "Seasonal Influenza",
    "medicines": [
      { "name": "Oseltamivir", "dosage": "75mg", "frequency": "Twice daily", "duration": "5 days" },
      { "name": "Paracetamol", "dosage": "500mg", "frequency": "Every 6 hours as needed", "duration": "3 days" }
    ],
    "notes": "Drink plenty of fluids. Rest for at least 3 days.",
    "valid": true
  }
];
