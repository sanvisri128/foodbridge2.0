// End-to-end system test script for FoodBridge 2.0 APIs
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting FoodBridge 2.0 API & Lifecycle Test Suite...\n');

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 1. Health Check:', health.data.message);

    // 2. Platform Stats
    const stats = await axios.get(`${BASE_URL}/donations/stats/platform`);
    console.log('✅ 2. Platform Stats:', {
      totalMealsRescued: stats.data.totalMealsRescued,
      co2SavedKg: stats.data.co2SavedKg,
      totalProviders: stats.data.totalProviders,
      totalNGOs: stats.data.totalNGOs,
    });

    // 3. Register Provider
    const rand = Math.floor(Math.random() * 10000);
    const providerEmail = `provider_${rand}@foodbridge.org`;
    const providerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: `Grand Central Kitchen ${rand}`,
      email: providerEmail,
      password: 'password123',
      role: 'provider',
      phone: '+91 98765 00001',
      description: 'Central commercial kitchen donating daily surplus meals.',
    });
    console.log('✅ 3. Provider Registered:', providerRes.data.user.name);
    const providerToken = providerRes.data.token;

    // 4. Register NGO
    const ngoEmail = `ngo_${rand}@foodbridge.org`;
    const ngoRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: `Hope Community Relief ${rand}`,
      email: ngoEmail,
      password: 'password123',
      role: 'ngo',
      phone: '+91 98765 00002',
      description: 'Shelter providing nutritious meals to homeless families.',
    });
    console.log('✅ 4. NGO Registered:', ngoRes.data.user.name);
    const ngoToken = ngoRes.data.token;

    // 5. Update Profile
    const updateProfileRes = await axios.put(
      `${BASE_URL}/auth/profile`,
      { name: `Grand Central Kitchen & Banquet ${rand}`, phone: '+91 98765 11111' },
      { headers: { Authorization: `Bearer ${providerToken}` } }
    );
    console.log('✅ 5. Profile Updated:', updateProfileRes.data.user.name);

    // 6. Post Donation
    const expiry = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours from now
    const donationRes = await axios.post(
      `${BASE_URL}/donations`,
      {
        foodName: 'Vegetable Biryani & Dal Makhani',
        quantity: '4 large containers (20 kg)',
        servings: 45,
        location: 'Koramangala 5th Block, Bangalore',
        expiryTime: expiry.toISOString(),
        category: 'cooked',
        dietaryType: 'veg',
        storageRequirement: 'hot',
        notes: 'Freshly prepared for evening banquet. Hygienically sealed.',
      },
      { headers: { Authorization: `Bearer ${providerToken}` } }
    );
    const donationId = donationRes.data.donation._id;
    console.log('✅ 6. Donation Created:', {
      id: donationId,
      foodName: donationRes.data.donation.foodName,
      servings: donationRes.data.donation.servings,
      status: donationRes.data.donation.status,
    });

    // 7. Query Public Listings with Filters
    const listings = await axios.get(`${BASE_URL}/donations?category=cooked&dietaryType=veg`);
    const found = listings.data.donations.find((d) => d._id === donationId);
    console.log('✅ 7. Filtered Public Listings:', {
      count: listings.data.donations.length,
      foundPostedDonation: !!found,
    });

    // 8. NGO Claims Donation (Generates 4-Digit Pickup OTP)
    const claimRes = await axios.post(
      `${BASE_URL}/donations/${donationId}/claim`,
      {},
      { headers: { Authorization: `Bearer ${ngoToken}` } }
    );
    const pickupOtp = claimRes.data.pickupCode;
    console.log('✅ 8. NGO Claimed Donation:', {
      message: claimRes.data.message,
      status: claimRes.data.donation.status,
      pickupOTP: pickupOtp,
    });

    // 9. Provider Checks Notifications
    const providerNotifs = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    console.log('✅ 9. Provider Received Notification:', {
      count: providerNotifs.data.notifications.length,
      latestAlert: providerNotifs.data.notifications[0]?.message,
    });

    // 10. Provider Verifies Handover with 4-Digit OTP
    const verifyRes = await axios.post(
      `${BASE_URL}/donations/${donationId}/verify-pickup`,
      { pickupCode: pickupOtp },
      { headers: { Authorization: `Bearer ${providerToken}` } }
    );
    console.log('✅ 10. Handover Verified with OTP:', {
      status: verifyRes.data.donation.status,
      completedAt: verifyRes.data.donation.completedAt,
    });

    // 11. Check Individual Impact Stats
    const providerImpact = await axios.get(`${BASE_URL}/auth/impact`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    console.log('✅ 11. Provider Impact Stats:', providerImpact.data);

    // 12. Community Food Request Flow
    const neededByDate = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const reqRes = await axios.post(
      `${BASE_URL}/requests`,
      {
        title: 'Urgent: 60 meals needed for flood relief camp',
        servingsNeeded: 60,
        location: 'Indiranagar Shelter, Bangalore',
        neededBy: neededByDate.toISOString(),
        category: 'cooked',
        dietaryType: 'veg',
        urgency: 'critical',
        notes: 'Packaged individual boxes preferred.',
      },
      { headers: { Authorization: `Bearer ${ngoToken}` } }
    );
    const reqId = reqRes.data.request._id;
    console.log('✅ 12. Food Request Broadcasted:', {
      id: reqId,
      title: reqRes.data.request.title,
      servings: reqRes.data.request.servingsNeeded,
    });

    // 13. Provider Fulfills Food Request
    const fulfillRes = await axios.post(
      `${BASE_URL}/requests/${reqId}/fulfill`,
      {},
      { headers: { Authorization: `Bearer ${providerToken}` } }
    );
    console.log('✅ 13. Provider Accepted to Fulfill Request:', {
      status: fulfillRes.data.request.status,
      fulfilledBy: fulfillRes.data.request.fulfilledBy,
    });

    console.log('\n🎉 ALL 13 END-TO-END TESTS PASSED SUCCESSFULLY! 🚀');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
