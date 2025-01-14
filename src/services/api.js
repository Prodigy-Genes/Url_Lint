

// IP Info API: Get IP address and geolocation
export const fetchIPInfo = async (ip) => {
    const apiKey = process.env.REACT_APP_IPINFO_API_KEY;
    
    
    if (!ip) {
      throw new Error('IP address is required');
    }
  
    const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${apiKey}`;
  
    try {
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
      throw error;
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
  
  // VirusTotal API: Scan URL for malware or phishing
  export const fetchVirusTotalData = async (url) => {
    const apiKey = process.env.REACT_APP_VIRUS_TOTAL_API_KEY;
    
    if (!url) {
      throw new Error('URL is required');
    }
  
    // URL safe base64 encoding
    const urlEncoded = Buffer.from(url.trim())
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  
    try {
      const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlEncoded}`, {
        method: 'GET',
        headers: {
          'x-apikey': apiKey,
          'Accept': 'application/json'
        }
      });
  
      if (response.status === 404) {
        // URL hasn't been scanned before, submit for scanning
        const scanResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
          method: 'POST',
          headers: {
            'x-apikey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `url=${encodeURIComponent(url)}`
        });
        
        if (!scanResponse.ok) {
          throw new Error(`Scan submission failed! Status: ${scanResponse.status}`);
        }
        
        return {
          status: 'pending',
          message: 'URL submitted for scanning'
        };
      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return {
        status: 'complete',
        stats: data.data.attributes.last_analysis_stats,
        reputation: data.data.attributes.reputation,
        totalVotes: data.data.attributes.total_votes,
        lastAnalysisDate: data.data.attributes.last_analysis_date
      };
    } catch (error) {
      console.error('Error fetching VirusTotal data:', error);
      throw error;
    }
  };
  
  // SSL Labs API: Get SSL/TLS configuration
  export const fetchSSLData = async (domain) => {
    if (!domain) {
      throw new Error('Domain is required');
    }
  
    const baseUrl = 'https://api.ssllabs.com/api/v3';
    
    try {
      // Start new scan
      const startScan = await fetch(
        `${baseUrl}/analyze?host=${encodeURIComponent(domain)}&startNew=on&all=done`
      );
  
      if (!startScan.ok) {
        throw new Error(`HTTP error! status: ${startScan.status}`);
      }
  
      let result = await startScan.json();
      
      // Poll until scan is complete
      while (result.status === 'IN_PROGRESS' || result.status === 'DNS') {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        const pollResponse = await fetch(
          `${baseUrl}/analyze?host=${encodeURIComponent(domain)}`
        );
        
        if (!pollResponse.ok) {
          throw new Error(`HTTP error! status: ${pollResponse.status}`);
        }
        
        result = await pollResponse.json();
      }
  
      if (result.status === 'ERROR') {
        throw new Error(result.statusMessage);
      }
  
      return {
        status: result.status,
        grade: result.endpoints?.[0]?.grade,
        hasWarnings: result.hasWarnings,
        isExceptional: result.endpoints?.[0]?.isExceptional,
        protocols: result.endpoints?.[0]?.details?.protocols,
        cert: {
          subject: result.certs?.[0]?.subject,
          issuer: result.certs?.[0]?.issuer,
          validFrom: result.certs?.[0]?.notBefore,
          validTo: result.certs?.[0]?.notAfter
        }
      };
    } catch (error) {
      console.error('Error fetching SSL data:', error);
      throw error;
    }
  };