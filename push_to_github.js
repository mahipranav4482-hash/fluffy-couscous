// Script to push the entire SIH project directly to https://github.com/mahipranav4482-hash/fluffy-couscous
// using the GitHub REST / Git Data API without requiring git.exe to be installed!

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_OWNER = 'mahipranav4482-hash';
const REPO_NAME = 'fluffy-couscous';

const token = process.argv[2] || process.env.GITHUB_TOKEN;

if (!token) {
  console.log('\n❌ ERROR: GitHub Personal Access Token is required.');
  console.log('\nUsage:');
  console.log('  node push_to_github.js <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>\n');
  console.log('How to get a token:');
  console.log('  1. Go to https://github.com/settings/tokens');
  console.log('  2. Generate new token (classic) with "repo" permission checked.');
  console.log('  3. Run: node push_to_github.js ghp_your_token_here\n');
  process.exit(1);
}

function githubRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'User-Agent': 'NodeJS-GitHub-Pusher',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...(dataString ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString)
        } : {})
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseBody));
          } catch (e) {
            resolve(responseBody);
          }
        } else {
          reject(new Error(`GitHub API Error ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

function getFiles(dir, baseDir = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.system_generated') continue;
    const fullPath = path.join(dir, file);
    const relPath = path.join(baseDir, file).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

async function main() {
  console.log(`\n🚀 Preparing to push full repository to https://github.com/${REPO_OWNER}/${REPO_NAME} ...`);

  // 1. Get current branch reference
  console.log('1. Checking remote branch status...');
  let latestCommitSha;
  try {
    const refData = await githubRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/main`);
    latestCommitSha = refData.object.sha;
    console.log(`   Found 'main' branch at commit: ${latestCommitSha}`);
  } catch (err) {
    console.log('   Could not find main branch, checking master...');
    try {
      const refData = await githubRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/master`);
      latestCommitSha = refData.object.sha;
    } catch (e) {
      console.log('   Starting from empty repo.');
    }
  }

  // 2. Gather local files
  console.log('2. Scanning local codebase files...');
  const files = getFiles('.');
  console.log(`   Discovered ${files.length} project files across backend, frontend, ml-pipeline.`);

  // 3. Upload blobs in batches
  console.log('3. Uploading file blobs to GitHub...');
  const treeItems = [];
  let count = 0;

  for (const f of files) {
    const content = fs.readFileSync(f.fullPath);
    const isBinary = /\.(png|jpg|jpeg|gif|ico|pdf|zip|bin)$/i.test(f.relPath);

    const blobData = await githubRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`, {
      content: content.toString(isBinary ? 'base64' : 'utf8'),
      encoding: isBinary ? 'base64' : 'utf-8'
    });

    treeItems.push({
      path: f.relPath,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha
    });

    count++;
    if (count % 10 === 0 || count === files.length) {
      process.stdout.write(`   Uploaded ${count}/${files.length} files...\r`);
    }
  }
  console.log(`\n   ✓ Successfully uploaded all ${files.length} file blobs.`);

  // 4. Create Git tree
  console.log('4. Creating Git commit tree...');
  const treePayload = { tree: treeItems };
  if (latestCommitSha) {
    treePayload.base_tree = latestCommitSha;
  }
  const treeData = await githubRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`, treePayload);
  console.log(`   ✓ Created Git tree: ${treeData.sha}`);

  // 5. Create commit
  console.log('5. Creating Git commit...');
  const commitData = await githubRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`, {
    message: 'Deploy full-stack Global Disaster Managing Web with 5-sector loss audit & simple codes',
    tree: treeData.sha,
    parents: latestCommitSha ? [latestCommitSha] : []
  });
  console.log(`   ✓ Created commit: ${commitData.sha}`);

  // 6. Update reference
  console.log('6. Updating branch ref heads/main...');
  try {
    await githubRequest('PATCH', `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/main`, {
      sha: commitData.sha,
      force: true
    });
  } catch (e) {
    await githubRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/git/refs`, {
      ref: 'refs/heads/main',
      sha: commitData.sha
    });
  }

  console.log('\n🎉 SUCCESS! Full codebase pushed to https://github.com/' + REPO_OWNER + '/' + REPO_NAME);
  console.log('Now you can connect your repository to Render.com or Railway.app to deploy live 24/7!\n');
}

main().catch(err => {
  console.error('\n❌ Push failed:', err.message);
  process.exit(1);
});
