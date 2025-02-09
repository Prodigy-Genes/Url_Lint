import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import { Shield, Globe, AlertTriangle, CheckCircle, Server, Radio, Lock } from 'lucide-react';
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

        const apiKey =process.env.REACT_APP_LINKPREVIEW_API_KEY;
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
        <AlertTriangle className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="link-preview error">
        <AlertTriangle className="error-icon" />
        <p>No preview available for this URL.</p>
      </div>
    );
  }

  return (
    <div className="link-preview">
      {/* Grid overlay */}
      <div className="grid-overlay"></div>
      
      {/* Ambient glow */}
      <div className="ambient-glow"></div>

      <div className="preview-content">
        <div className="preview-header">
          <Globe className="preview-icon" />
          <h2>{previewData.title}</h2>
        </div>
        
        <p>{previewData.description}</p>
        {previewData.image && (
          <div className="image-container">
            <img
              src={previewData.image}
              alt="Thumbnail"
              className="thumbnail"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'fallback-image.jpg';
              }}
            />
          </div>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer" className="preview-link">
          <Globe className="link-icon" />
          Visit Site
        </a>
      </div>

      {securityData && (
        <div className="security-info">
          <div className="section-header">
            <Shield className="section-icon" />
            <h3>Security Analysis</h3>
          </div>
          
          <div className="security-grid">
            <div className="security-item">
              <div className="item-header">
                <Radio className="item-icon" />
                <h4>Google Safe Browsing</h4>
              </div>
              {securityData.safeBrowsing.error ? (
                <p className="status-text">Unable to fetch safety data</p>
              ) : (
                <p className={securityData.safeBrowsing.isSafe ? 'safe' : 'unsafe'}>
                  {securityData.safeBrowsing.isSafe ? (
                    <>
                      <CheckCircle className="status-icon" />
                      Safe to visit
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="status-icon" />
                      Potential security risk
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="security-item">
              <div className="item-header">
                <Server className="item-icon" />
                <h4>VirusTotal Scan</h4>
              </div>
              {securityData.virusTotal.error ? (
                <p className="status-text">{securityData.virusTotal.error}</p>
              ) : securityData.virusTotal.status === 'pending' ? (
                <p className="status-text">Scan in progress...</p>
              ) : (
                <div className="stats-grid">
                  <div className={`stat-item ${securityData.virusTotal.stats?.malicious > 0 ? 'warning' : ''}`}>
                    <span>Malicious</span>
                    <span>{securityData.virusTotal.stats?.malicious || 0}</span>
                  </div>
                  <div className="stat-item safe">
                    <span>Clean</span>
                    <span>{securityData.virusTotal.stats?.harmless || 0}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="security-item">
              <div className="item-header">
                <Lock className="item-icon" />
                <h4>SSL Certificate</h4>
              </div>
              {securityData.ssl.error ? (
                <p className="status-text">Unable to fetch SSL data</p>
              ) : (
                <div className="ssl-info">
                  <div className="grade">
                    <span>Grade</span>
                    <span className={`grade-value grade-${securityData.ssl.grade?.toLowerCase() || 'na'}`}>
                      {securityData.ssl.grade || 'N/A'}
                    </span>
                  </div>
                  <div className="validity">
                    <span>Valid until</span>
                    <span>{securityData.ssl.cert?.validTo || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {ipInfo && !ipInfo.error && (
        <div className="ip-info">
          <div className="section-header">
            <Server className="section-icon" />
            <h3>Server Information</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span>IP Address</span>
              <span>{ipInfo.ip}</span>
            </div>
            <div className="info-item">
              <span>Location</span>
              <span>{`${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`}</span>
            </div>
            <div className="info-item">
              <span>Organization</span>
              <span>{ipInfo.org}</span>
            </div>
            <div className="info-item">
              <span>Timezone</span>
              <span>{ipInfo.timezone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkPreview;