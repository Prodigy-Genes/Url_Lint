import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import './linkpreview.css';
import LoadingSpinner from '../loadingspinner/loadingspinner';
import { fetchIPInfo, fetchGoogleSafeBrowsingData, fetchVirusTotalData, fetchSSLData } from '../../services/api';

const isValidUrl = (url) => {
  const regex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w-./?%&=]*)$/i;
  return regex.test(url);
};

const initialState = {
  loading: true,
  previewData: null,
  securityData: null,
  ipInfo: null,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, ...action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

const LinkPreview = ({ url }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchAllData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      if (!isValidUrl(url)) {
        dispatch({ type: 'FETCH_FAILURE', error: 'Invalid URL' });
        return;
      }

      try {
        // Fetch link preview data
        const apiKey = process.env.REACT_APP_LINK_PREVIEW_API_KEY;
        const previewResponse = await axios.get(`https://api.linkpreview.net`, {
          params: {
            key: apiKey,
            q: url,
          },
        });

        if (previewResponse.data.error) {
          throw new Error('Failed to fetch preview data');
        }

        const previewData = {
          title: previewResponse.data.title || 'No title available',
          description: previewResponse.data.description || 'No description available',
          image: previewResponse.data.image || null,
        };

         /*
        try {
          const apiKey = process.env.REACT_APP_SCRAPER_API_KEY;
          const response = await axios.get(`https://api.scraperapi.com`, {
            params: {
              api_key: apiKey,
              url: url,
              render: true,
            },
          });

          const html = response.data;
          
          const titleMatch = html.match(/<title>(.*?)<\/title>/);
          const descriptionMatch = html.match(/<meta name="description" content="(.*?)">/);
          const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)">/);
          const ogDescriptionMatch = html.match(/<meta property="og:description" content="(.*?)">/);
          const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)">/);

          const title = ogTitleMatch ? ogTitleMatch[1] : titleMatch ? titleMatch[1] : 'No title available';
          const description = ogDescriptionMatch ? ogDescriptionMatch[1] : descriptionMatch ? descriptionMatch[1] : 'No description available';
          const image = ogImageMatch ? ogImageMatch[1] : null;

          setPreviewData({
            title,
            description,
            image,
          });
        */

        // Fetch security data in parallel
        const [safeBrowsingData, virusTotalData, sslData, ipInfoData] = await Promise.allSettled([
          fetchGoogleSafeBrowsingData(url),
          fetchVirusTotalData(url),
          fetchSSLData(new URL(url).hostname),
          fetchIPInfo(new URL(url).hostname)
        ]);

        const securityData = {
          safeBrowsing: safeBrowsingData.status === 'fulfilled' ? safeBrowsingData.value : { error: 'Failed to fetch' },
          virusTotal: virusTotalData.status === 'fulfilled' ? virusTotalData.value : { error: 'Failed to fetch' },
          ssl: sslData.status === 'fulfilled' ? sslData.value : { error: 'Failed to fetch' }
        };

        const ipInfo = ipInfoData.status === 'fulfilled' ? ipInfoData.value : { error: 'Failed to fetch' };

        dispatch({ type: 'FETCH_SUCCESS', payload: { previewData, securityData, ipInfo } });

      } catch (err) {
        console.error('Error fetching data:', err);
        dispatch({ type: 'FETCH_FAILURE', error: 'Failed to fetch preview and security data' });
      }
    };

    if (url) {
      fetchAllData();
    }
  }, [url]);

  const { loading, previewData, securityData, ipInfo, error } = state;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="link-preview error">
        <p>{error}</p>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="link-preview error">
        <p>No preview available for this URL.</p>
      </div>
    );
  }

  return (
    <div className="link-preview">
      <div className="preview-content">
        <h2>{previewData.title}</h2>
        <p>{previewData.description}</p>
        {previewData.image ? (
          <img
            src={previewData.image}
            alt="Thumbnail"
            className="thumbnail"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'fallback-image.jpg';
            }}
          />
        ) : (
          <p>No image available</p>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer" className="preview-link">
          Visit Site
        </a>
      </div>

      {securityData && (
        <div className="security-info">
          <h3>Security Information</h3>
          
          <div className="security-item">
            <h4>Google Safe Browsing</h4>
            {securityData.safeBrowsing.error ? (
              <p>Unable to fetch safety data</p>
            ) : (
              <p className={securityData.safeBrowsing.isSafe ? 'safe' : 'unsafe'}>
                {securityData.safeBrowsing.isSafe ? '✓ Safe to visit' : '⚠ Potential security risk'}
              </p>
            )}
          </div>

          <div className="security-item">
            <h4>VirusTotal Scan</h4>
            {securityData.virusTotal.error ? (
              <p>Unable to fetch scan data</p>
            ) : securityData.virusTotal.status === 'pending' ? (
              <p>Scan in progress...</p>
            ) : (
              <div>
                <p>Malicious: {securityData.virusTotal.stats?.malicious || 0}</p>
                <p>Clean: {securityData.virusTotal.stats?.harmless || 0}</p>
              </div>
            )}
          </div>

          <div className="security-item">
            <h4>SSL Certificate</h4>
            {securityData.ssl.error ? (
              <p>Unable to fetch SSL data</p>
            ) : (
              <div>
                <p>Grade: {securityData.ssl.grade || 'N/A'}</p>
                <p>Valid until: {securityData.ssl.cert?.validTo || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {ipInfo && (
        <div className="ip-info">
          <h3>IP Information</h3>
          {ipInfo.error ? (
            <p>Unable to fetch IP information</p>
          ) : (
            <div>
              <p>IP: {ipInfo.ip}</p>
              <p>City: {ipInfo.city}</p>
              <p>Region: {ipInfo.region}</p>
              <p>Country: {ipInfo.country}</p>
              <p>Location: {ipInfo.loc}</p>
              <p>Organization: {ipInfo.org}</p>
              <p>Timezone: {ipInfo.timezone}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkPreview;