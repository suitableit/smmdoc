const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProviderApi(provider) {
  const baseUrl = (provider.api_url || '').trim();
  const endpoints = (() => { try { return JSON.parse(provider.endpoints || '{}'); } catch { return {}; } })();
  const headers = (() => { try { return JSON.parse(provider.headers || '{}'); } catch { return {}; } })();
  const servicesBaseUrl = endpoints.services ? `${baseUrl}${endpoints.services}` : baseUrl;
  const keyParam = provider.api_key_param || 'key';
  const actionParam = provider.action_param || 'action';

  console.log('🔗 Base URL:', baseUrl);
  console.log('🔗 Services URL:', servicesBaseUrl);
  console.log('🧩 Params ->', { keyParam, actionParam });

  // Try POST first (x-www-form-urlencoded)
  try {
    const body = new URLSearchParams();
    body.append(keyParam, provider.api_key);
    body.append(actionParam, 'services');

    const res = await fetch(servicesBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...headers },
      body
    });

    const text = await res.text();
    console.log('📥 POST status:', res.status, res.statusText);
    try {
      const data = JSON.parse(text);
      const list = Array.isArray(data) ? data : (data.services || data.data || data);
      console.log('✅ POST parsed services length:', Array.isArray(list) ? list.length : 'unknown');
    } catch (e) {
      console.log('ℹ️ POST raw response (not JSON?):', text.slice(0, 400));
    }
  } catch (e) {
    console.error('❌ POST call error:', e);
  }

  // Try GET fallback
  try {
    const url = `${servicesBaseUrl}?${encodeURIComponent(keyParam)}=${encodeURIComponent(provider.api_key)}&${encodeURIComponent(actionParam)}=services`;
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json', ...headers } });
    const text = await res.text();
    console.log('📥 GET status:', res.status, res.statusText);
    try {
      const data = JSON.parse(text);
      const list = Array.isArray(data) ? data : (data.services || data.data || data);
      console.log('✅ GET parsed services length:', Array.isArray(list) ? list.length : 'unknown');
    } catch (e) {
      console.log('ℹ️ GET raw response (not JSON?):', text.slice(0, 400));
    }
  } catch (e) {
    console.error('❌ GET call error:', e);
  }
}

async function checkProvider() {
  try {
    const provider = await prisma.api_providers.findUnique({
      where: { id: 19 },
      select: {
        id: true,
        name: true,
        api_url: true,
        api_key: true,
        http_method: true,
        status: true,
        endpoints: true,
        headers: true,
        api_key_param: true,
        action_param: true
      }
    });
    console.log('ATTPanel Provider Config:', JSON.stringify(provider, null, 2));

    if (provider && provider.status === 'active' && provider.api_url && provider.api_key) {
      await testProviderApi(provider);
    } else {
      console.log('⚠️ Provider inactive or missing api_url/api_key.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProvider();