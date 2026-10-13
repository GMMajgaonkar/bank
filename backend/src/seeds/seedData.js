require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Site = require('../models/Site');
const Expense = require('../models/Expense');
const BankAccount = require('../models/BankAccount');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/construction_admin';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Site.deleteMany({});
    await Expense.deleteMany({});
    await BankAccount.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed Bank Accounts
    const bankAccounts = [
      { bankName: 'Bank One', accountIdentifier: 'ACCOUNT #01', code: 'B1', balance: 100000, credit: 50000, status: 'active' },
      { bankName: 'Bank Two', accountIdentifier: 'ACCOUNT #02', code: 'B2', balance: 100000, credit: 50000, status: 'active' },
      { bankName: 'Bank Three', accountIdentifier: 'ACCOUNT #03', code: 'B3', balance: 100000, credit: 50000, status: 'active' },
      { bankName: 'Bank Four', accountIdentifier: 'ACCOUNT #04', code: 'B4', balance: 100000, credit: 50000, status: 'active' },
    ];
    await BankAccount.insertMany(bankAccounts);
    console.log('Bank accounts seeded.');

    // 2. Seed Sites
    const sitesData = [
      {
        name: 'Greenfield Villa',
        location: 'Bengaluru',
        clientName: 'Shreedhar patil',
        startDate: new Date('2026-08-11'),
        budget: 18500000, // 1.85 Cr
        contractValue: 18500000,
        clientReceived: 13500000, // 1.35 Cr
        status: 'In Progress',
      },
      {
        name: "Aarav Height's",
        location: 'Baner, Pune',
        clientName: 'Rajesh Mehta',
        startDate: new Date('2026-08-11'),
        budget: 18500000, // 1.85 Cr
        contractValue: 18500000,
        clientReceived: 12000000,
        status: 'In Progress',
      },
      {
        name: 'Orchid Business Park',
        location: 'Whitefield, Bengaluru',
        clientName: 'Shreedhar patil',
        startDate: new Date('2026-08-11'),
        budget: 4200000, // 42.0 L
        contractValue: 4200000,
        clientReceived: 3000000,
        status: 'In Progress',
      },
      {
        name: 'Skyline Pinnacle',
        location: 'Hiranandani, Mumbai',
        clientName: 'Rajesh Mehta',
        startDate: new Date('2026-08-11'),
        budget: 4200000, // 42.0 L
        contractValue: 4200000,
        clientReceived: 4200000,
        status: 'Completed',
      },
      {
        name: 'Horizon Residency',
        location: 'Jubilee Hills, Hyderabad',
        clientName: 'Venkatesh Rao',
        startDate: new Date('2026-07-20'),
        budget: 35000000,
        contractValue: 35000000,
        clientReceived: 21000000,
        status: 'In Progress',
      },
      {
        name: 'Sapphire Heights',
        location: 'Anna Nagar, Chennai',
        clientName: 'Karthik Subramanian',
        startDate: new Date('2026-06-15'),
        budget: 28000000,
        contractValue: 28000000,
        clientReceived: 28000000,
        status: 'Completed',
      },
      {
        name: 'Cyber City Phase II',
        location: 'Gachibowli, Hyderabad',
        clientName: 'Nexus Developers',
        startDate: new Date('2026-05-10'),
        budget: 65000000,
        contractValue: 65000000,
        clientReceived: 15000000,
        status: 'On Hold',
      },
      {
        name: 'Palm Grove Estate',
        location: 'Kakkanad, Kochi',
        clientName: 'Thomas Kurian',
        startDate: new Date('2026-04-01'),
        budget: 15000000,
        contractValue: 15000000,
        clientReceived: 12000000,
        status: 'In Progress',
      },
    ];

    const createdSites = await Site.insertMany(sitesData);
    console.log(`Created ${createdSites.length} sites.`);

    const greenfield = createdSites.find((s) => s.name === 'Greenfield Villa');
    const aarav = createdSites.find((s) => s.name === "Aarav Height's");
    const orchid = createdSites.find((s) => s.name === 'Orchid Business Park');

    // 3. Seed Expenses matching screenshots
    const expensesData = [
      // Greenfield Villa (Total ~ 1.24 Cr = 12400000)
      {
        siteId: greenfield._id,
        date: new Date('2025-05-24'),
        description: 'Structural steel – Fe500',
        category: 'Material',
        supplier: 'Tata Tiscon Dealer',
        material: 'Structural Steel Fe500',
        quantity: 8,
        unit: 'Tons',
        ratePerUnit: 60000,
        amount: 480000,
        paidAmount: 480000,
        paymentMethod: 'Bank Transfer',
        remark: 'Batch 4 delivery for foundations',
      },
      {
        siteId: greenfield._id,
        date: new Date('2025-05-22'),
        description: 'Excavator rental',
        category: 'Equipment',
        supplier: 'Kirloskar Heavy Plant',
        material: 'Excavator Rental',
        quantity: 1,
        unit: 'Month',
        ratePerUnit: 145000,
        amount: 145000,
        paidAmount: 145000,
        paymentMethod: 'Bank Transfer',
        remark: 'Site clearing and grading',
      },
      {
        siteId: greenfield._id,
        date: new Date('2025-05-21'),
        description: 'Masonry labour – Week 20',
        category: 'Labour',
        supplier: 'Patel Contracting Works',
        material: 'Labour Wages',
        quantity: 1,
        unit: 'Week',
        ratePerUnit: 86500,
        amount: 86500,
        paidAmount: 86500,
        paymentMethod: 'Cash',
        remark: 'Weekly payout for 25 masons',
      },
      {
        siteId: greenfield._id,
        date: new Date('2025-05-18'),
        description: 'Cement – 600 bags',
        category: 'Material',
        supplier: 'UltraTech Building Solutions',
        material: 'Cement',
        quantity: 600,
        unit: 'Bags',
        ratePerUnit: 390,
        amount: 234000,
        paidAmount: 234000,
        paymentMethod: 'Bank Transfer',
        remark: 'Invoice #UT-9921',
      },
      {
        siteId: greenfield._id,
        date: new Date('2025-05-10'),
        description: 'Ready-mix concrete – Grade M30',
        category: 'Material',
        supplier: 'RMC Readymix India',
        material: 'Ready-Mix Concrete',
        quantity: 140,
        unit: 'Trucks',
        ratePerUnit: 65000,
        amount: 9100000,
        paidAmount: 7000000,
        paymentMethod: 'Bank Transfer',
        remark: 'Main slab casting',
      },
      {
        siteId: greenfield._id,
        date: new Date('2025-05-02'),
        description: 'Electrical & Plumbing MEP Work',
        category: 'Labour',
        supplier: 'Apex MEP Contractors',
        material: 'MEP Installation',
        quantity: 1,
        unit: 'Phase',
        ratePerUnit: 2354500,
        amount: 2354500,
        paidAmount: 2000000,
        paymentMethod: 'Bank Transfer',
        remark: 'Underground conduit and piping complete',
      },

      // Aarav Height's
      {
        siteId: aarav._id,
        date: new Date('2026-08-11'),
        description: 'Structural steel – Fe500',
        category: 'Material',
        supplier: 'Jindal Steel Ltd',
        material: 'TMT Rebars',
        quantity: 8,
        unit: 'Tons',
        ratePerUnit: 60000,
        amount: 480000,
        paidAmount: 350000,
        paymentMethod: 'Bank Transfer',
        remark: 'Partial payment made',
      },
      {
        siteId: aarav._id,
        date: new Date('2026-08-11'),
        description: 'Masonry labour – Week 20',
        category: 'Labour',
        supplier: 'Shree Construction Crew',
        material: 'Masonry Work',
        quantity: 1,
        unit: 'Week',
        ratePerUnit: 480000,
        amount: 480000,
        paidAmount: 350000,
        paymentMethod: 'Cash',
        remark: 'Supervision and brickwork',
      },

      // Orchid Business Park
      {
        siteId: orchid._id,
        date: new Date('2026-08-11'),
        description: 'Excavator rental',
        category: 'Equipment',
        supplier: 'Infra Rental Corp',
        material: 'JCB 3DX Rental',
        quantity: 1,
        unit: 'Month',
        ratePerUnit: 480000,
        amount: 480000,
        paidAmount: 350000,
        paymentMethod: 'Cheque',
        remark: 'Site excavation',
      },
      {
        siteId: greenfield._id,
        date: new Date('2026-08-11'),
        description: 'Cement – 600 bags',
        category: 'Transport',
        supplier: 'Greenfield Logistics',
        material: 'Cement Transport',
        quantity: 600,
        unit: 'Bags',
        ratePerUnit: 800,
        amount: 480000,
        paidAmount: 350000,
        paymentMethod: 'UPI',
        remark: 'Transit logistics and handling',
      },
    ];

    await Expense.insertMany(expensesData);
    console.log(`Created ${expensesData.length} expense entries.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
