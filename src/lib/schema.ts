import { z } from 'zod';

export const pmVishwakarmaFormSchema = z.object({
  state: z.string().min(1, 'State is required.'),
  district: z.string().min(1, 'District is required.'),
  subDistrict: z.string().min(1, 'Sub-District is required.'),
  block: z.string().min(1, 'Block is required.'),
  village: z.string().min(1, 'Village is required.'),
  artisanName: z.string().min(1, "Artisan's Name is required."),
  gender: z.enum(['Male', 'Female', 'Other']),
  category: z.enum(['General', 'SC', 'ST', 'OBC']),
  artisanType: z.enum(['Carpenter', 'Blacksmith', 'Potter', 'Other']),
  aadhaarNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, 'Invalid Aadhaar format.'),
  bankName: z.string().min(1, 'Bank Name is required.'),
  ifscCode: z.string().min(1, 'IFSC Code is required.'),
  accountNumber: z.string().min(1, 'Account Number is required.'),
  otp: z.string().optional(),
});

export type PmVishwakarmaFormValues = z.infer<typeof pmVishwakarmaFormSchema>;


export const pmKisanFormJsonSchema = {
  type: 'object',
  properties: {
    state: { type: 'string', description: 'State of the farmer\'s residence' },
    district: { type: 'string', description: 'District of the farmer\'s residence' },
    subDistrict: { type: 'string', description: 'Sub-district or Tehsil of the farmer\'s residence' },
    block: { type: 'string', description: 'Block of the farmer\'s residence' },
    village: { type: 'string', description: 'Village of the farmer\'s residence' },
    farmerName: { type: 'string', description: 'Full name of the farmer' },
    gender: { type: 'string', enum: ['Male', 'Female', 'Other'], description: 'Gender of the farmer' },
    category: { type: 'string', enum: ['General', 'SC', 'ST', 'OBC'], description: 'Social category of the farmer' },
    farmerType: { type: 'string', enum: ['Small (1-2 Ha)', 'Marginal (<1 Ha)', 'Other'], description: 'Type of farmer based on land holding' },
    aadhaarNumber: { type: 'string', description: 'Farmer\'s 12-digit Aadhaar number in XXXX-XXXX-XXXX format' },
    bankName: { type: 'string', description: 'Name of the bank' },
    ifscCode: { type: 'string', description: 'IFSC code of the bank branch' },
    accountNumber: { type: 'string', description: 'Bank account number of the farmer' },
  },
  required: ['state', 'district', 'subDistrict', 'block', 'village', 'farmerName', 'gender', 'category', 'farmerType', 'aadhaarNumber', 'bankName', 'ifscCode', 'accountNumber'],
};

export const userData = {
  name: 'Ramesh Kumar',
  fatherName: 'Suresh Kumar',
  aadhaarNumber: '1234-5678-9012',
  mobileNumber: '9876543210',
  bank: {
    name: 'State Bank of India',
    accountNumber: '12345678901',
    ifsc: 'SBIN0001234',
  },
  landRecords: [
    {
      khasra: '101/1',
      khatauni: '00123',
      area: '2.5 Acres',
      village: 'Rampur',
      district: 'Sitapur',
      state: 'Uttar Pradesh',
    },
  ],
  address: {
    village: 'Rampur',
    block: 'Rampur Block',
    subDistrict: 'Rampur Tehsil',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    pincode: '261001',
  },
  gender: 'Male',
  category: 'General',
  farmerType: 'Small (1-2 Ha)'
};
