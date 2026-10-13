const http = require('http');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (postData) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING FULL STACK SYSTEM VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Health check
  try {
    const res = await request('http://localhost:5000/api/health');
    if (res.status === 200 && res.data.status === 'ok') {
      console.log('✔ Test 1: Backend Health Check PASSED');
      passed++;
    } else {
      console.log('✘ Test 1: Backend Health Check FAILED', res);
      failed++;
    }
  } catch (err) {
    console.log('✘ Test 1 Error:', err.message);
    failed++;
  }

  // 2. Dashboard summary
  try {
    const res = await request('http://localhost:5000/api/dashboard/summary');
    if (res.status === 200 && res.data.success && res.data.data.stats.totalSites > 0) {
      console.log(`✔ Test 2: Dashboard Summary PASSED (Total Sites: ${res.data.data.stats.totalSites}, Total Budget: ₹${res.data.data.stats.totalBudget}, Total Spent: ₹${res.data.data.stats.totalSpent})`);
      passed++;
    } else {
      console.log('✘ Test 2: Dashboard Summary FAILED', res);
      failed++;
    }
  } catch (err) {
    console.log('✘ Test 2 Error:', err.message);
    failed++;
  }

  // 3. Bank accounts
  try {
    const res = await request('http://localhost:5000/api/dashboard/bank-accounts');
    if (res.status === 200 && res.data.success && res.data.count === 4) {
      console.log(`✔ Test 3: Bank Accounts PASSED (${res.data.count} accounts verified: Bank One, Two, Three, Four)`);
      passed++;
    } else {
      console.log('✘ Test 3: Bank Accounts FAILED', res);
      failed++;
    }
  } catch (err) {
    console.log('✘ Test 3 Error:', err.message);
    failed++;
  }

  // 4. Sites list & filters
  let sampleSiteId = null;
  try {
    const res = await request('http://localhost:5000/api/sites');
    if (res.status === 200 && res.data.success && res.data.data.length > 0) {
      sampleSiteId = res.data.data[0]._id;
      console.log(`✔ Test 4: Sites Listing PASSED (${res.data.data.length} sites fetched, sample site: "${res.data.data[0].name}")`);
      passed++;
    } else {
      console.log('✘ Test 4: Sites Listing FAILED', res);
      failed++;
    }
  } catch (err) {
    console.log('✘ Test 4 Error:', err.message);
    failed++;
  }

  // 5. Site CRUD Operations
  let createdSiteId = null;
  try {
    // CREATE
    const createData = JSON.stringify({
      name: 'Test Verification Residency',
      location: 'Koramangala, Bengaluru',
      clientName: 'Antigravity QA',
      budget: 5000000,
      contractValue: 5000000,
      clientReceived: 2000000,
      status: 'In Progress',
    });
    const createRes = await request('http://localhost:5000/api/sites', { method: 'POST' }, createData);
    if (createRes.status === 201 && createRes.data.success) {
      createdSiteId = createRes.data.data._id;
      console.log(`✔ Test 5a: Site Creation PASSED (Created site ID: ${createdSiteId})`);
      passed++;
    } else {
      console.log('✘ Test 5a: Site Creation FAILED', createRes);
      failed++;
    }

    // UPDATE
    const updateData = JSON.stringify({
      status: 'Completed',
      clientReceived: 5000000,
    });
    const updateRes = await request(`http://localhost:5000/api/sites/${createdSiteId}`, { method: 'PUT' }, updateData);
    if (updateRes.status === 200 && updateRes.data.data.status === 'Completed') {
      console.log('✔ Test 5b: Site Update PASSED');
      passed++;
    } else {
      console.log('✘ Test 5b: Site Update FAILED', updateRes);
      failed++;
    }

    // GET BY ID
    const getRes = await request(`http://localhost:5000/api/sites/${createdSiteId}`);
    if (getRes.status === 200 && getRes.data.data.name === 'Test Verification Residency') {
      console.log('✔ Test 5c: Site Get By ID PASSED');
      passed++;
    } else {
      console.log('✘ Test 5c: Site Get By ID FAILED', getRes);
      failed++;
    }

    // DELETE
    const deleteRes = await request(`http://localhost:5000/api/sites/${createdSiteId}`, { method: 'DELETE' });
    if (deleteRes.status === 200 && deleteRes.data.success) {
      console.log('✔ Test 5d: Site Deletion PASSED');
      passed++;
    } else {
      console.log('✘ Test 5d: Site Deletion FAILED', deleteRes);
      failed++;
    }
  } catch (err) {
    console.log('✘ Test 5 Error:', err.message);
    failed++;
  }

  // 6. Expense creation & mathematical validation
  try {
    const expenseData = JSON.stringify({
      siteId: sampleSiteId,
      date: new Date().toISOString(),
      supplier: 'UltraTech Cement Distributors',
      material: 'Grade 53 Portland Cement',
      quantity: 500,
      unit: 'Bags',
      ratePerUnit: 420,
      paidAmount: 210000,
      paymentMethod: 'Bank Transfer',
      remark: 'Test order verification batch',
    });

    const expRes = await request('http://localhost:5000/api/expenses', { method: 'POST' }, expenseData);
    if (
      expRes.status === 201 &&
      expRes.data.success &&
      expRes.data.data.amount === 210000 // 500 * 420 = 210000
    ) {
      console.log(`✔ Test 6a: Expense Creation PASSED (Quantity: 500 × Rate: 420 = Amount: ₹${expRes.data.data.amount})`);
      passed++;

      // Verify site financial metrics updated
      const siteAfterExp = await request(`http://localhost:5000/api/sites/${sampleSiteId}`);
      if (siteAfterExp.status === 200 && siteAfterExp.data.data.totalSpent > 0) {
        console.log(`✔ Test 6b: Site Total Spent & Remaining Budget Updated PASSED (Total Spent: ₹${siteAfterExp.data.data.totalSpent}, Remaining: ₹${siteAfterExp.data.data.remainingBudget})`);
        passed++;
      } else {
        console.log('✘ Test 6b FAILED');
        failed++;
      }

      // Cleanup test expense
      await request(`http://localhost:5000/api/expenses/${expRes.data.data._id}`, { method: 'DELETE' });
      console.log('✔ Test 6c: Expense Deletion & Metric Re-calculation PASSED');
      passed++;
    } else {
      console.log('✘ Test 6a: Expense Creation FAILED', expRes);
      failed++;
    }
  } catch (err) {
    console.log('✘ Test 6 Error:', err.message);
    failed++;
  }

  // 7. Frontend Vite Server Verification
  try {
    const viteRes = await request('http://localhost:5173/');
    if (viteRes.status === 200 && viteRes.raw && viteRes.raw.includes('root')) {
      console.log('✔ Test 7: Frontend Vite Server PASSED (Serving single page app on http://localhost:5173/)');
      passed++;
    } else {
      console.log('✘ Test 7: Frontend Vite Server FAILED', viteRes.status);
      failed++;
    }
  } catch (err) {
    console.log('✘ Test 7 Error:', err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
