
// In a real application, this would be a database connection.
// For this demo, we're using a mock in-memory store.

const artisansData: Record<string, any> = {
    "ARTISAN12345": {
        name: 'Sunita Devi',
        fatherName: 'Ram Lal',
        aadhaarNumber: '2345-6789-0123',
        mobileNumber: '9876543210',
        bank: {
            name: 'Punjab National Bank',
            accountNumber: '09876543211',
            ifsc: 'PUNB0005678',
        },
        artisanTrade: 'Pottery',
        address: {
            village: 'Rampur',
            block: 'Rampur Block',
            subDistrict: 'Rampur Tehsil',
            district: 'Sitapur',
            state: 'Uttar Pradesh',
            pincode: '261001',
        },
        gender: 'Female',
        category: 'OBC',
        artisanType: 'Potter'
    }
};

export const db = {
    async getArtisanById(id: string): Promise<any | null> {
        console.log(`Fetching artisan with ID: ${id}`);
        // Simulate an async database call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(artisansData[id] || null);
            }, 500);
        });
    },

    async updateArtisanData(id: string, data: Partial<any>): Promise<any | null> {
        console.log(`Updating artisan with ID: ${id} with data:`, data);
        // Simulate an async database call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (artisansData[id]) {
                    artisansData[id] = { ...artisansData[id], ...data };
                    resolve(artisansData[id]);
                } else {
                    reject(new Error("Artisan not found"));
                }
            }, 500);
        });
    }
};
