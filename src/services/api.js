 
  // IP Info API: Get IP address and geolocation
export const fetchIPInfo = async (hostname) => {
  const apiKey = process.env.REACT_APP_IPINFO_API_KEY;
  
  if (!hostname) {
    throw new Error('Hostname is required');
  }

  try {
    // First resolve hostname to IP if needed
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}`);
    const dnsData = await dnsResponse.json();
    const ip = dnsData.Answer?.[0]?.data || hostname;
    
    const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      loc: data.loc,
      org: data.org,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Error fetching IP info:', error);
    return { error: 'Failed to fetch IP information' };
  }
};

// VirusTotal API: Scan URL for malware or phishing
export const fetchVirusTotalData = async (url) => {
  const apiKey = process.env.REACT_APP_VIRUS_TOTAL_API_KEY;
  
  if (!url) {
    throw new Error('URL is required');
  }

  try {
    // First submit URL for scanning
    const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!submitResponse.ok) {
      throw new Error(`Scan submission failed! Status: ${submitResponse.status}`);
    }

    const submitData = await submitResponse.json();
    const analysisId = submitData.data.id;

    // Poll for results
    let attempts = 0;
    while (attempts < 3) { // Try up to 3 times
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between attempts
      
      const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: {
          'x-apikey': apiKey
        }
      });

      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed! Status: ${analysisResponse.status}`);
      }

      const analysisData = await analysisResponse.json();
      if (analysisData.data.attributes.status === 'completed') {
        return {
          status: 'complete',
          stats: analysisData.data.attributes.stats,
          results: analysisData.data.attributes.results
        };
      }

      attempts++;
    }

    return {
      status: 'pending',
      message: 'Analysis in progress'
    };
    
  } catch (error) {
    console.error('Error fetching VirusTotal data:', error);
    return { error: 'Failed to fetch scan data' };
  }
};

// SSL Labs API: Get SSL/TLS configuration
export const fetchSSLData = async (hostname) => {
  if (!hostname) {
    throw new Error('Hostname is required');
  }

  const baseUrl = 'https://api.ssllabs.com/api/v3';
  
  try {
    // Start new scan
    const startResponse = await fetch(
      `${baseUrl}/analyze?host=${encodeURIComponent(hostname)}&startNew=on`
    );

    if (!startResponse.ok) {
      throw new Error(`Start scan failed! Status: ${startResponse.status}`);
    }

    let scanData = await startResponse.json();
    
    // Poll for results with timeout
    let attempts = 0;
    const maxAttempts = 4; // Limit polling to prevent infinite loops
    
    while (attempts < maxAttempts && 
           (scanData.status === 'IN_PROGRESS' || scanData.status === 'DNS')) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between polls
      
      const pollResponse = await fetch(
        `${baseUrl}/analyze?host=${encodeURIComponent(hostname)}&all=done`
      );
      
      if (!pollResponse.ok) {
        throw new Error(`Poll failed! Status: ${pollResponse.status}`);
      }
      
      scanData = await pollResponse.json();
      attempts++;
    }

    if (scanData.status === 'ERROR') {
      throw new Error(scanData.statusMessage || 'SSL scan failed');
    }

    // Return partial data even if scan isn't complete
    return {
      status: scanData.status,
      grade: scanData.endpoints?.[0]?.grade || 'Pending',
      hasWarnings: scanData.hasWarnings,
      isExceptional: scanData.endpoints?.[0]?.isExceptional,
      cert: scanData.endpoints?.[0]?.details?.cert || null
    };
    
  } catch (error) {
    console.error('Error fetching SSL data:', error);
    return { error: 'Failed to fetch SSL data' };
  }
};
  
  // Google Safe Browsing API: Check if a URL is safe
  export const fetchGoogleSafeBrowsingData = async (url) => {
    const apiKey = process.env.REACT_APP_GOOGLE_SAFE_BROWSING_API_KEY;
    
    if (!url) {
      throw new Error('URL is required');
    }
  
    const requestBody = {
      client: {
        clientId: "your-client-name",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: url.trim() }]
      }
    };
  
    try {
      const response = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return {
        isSafe: !data.matches,
        threats: data.matches || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking Google Safe Browsing:', error);
      throw error;
    }
  };
  
  