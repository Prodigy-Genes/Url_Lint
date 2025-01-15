# UrlLint

UrlLint is a React application that fetches and displays preview information for a given URL, including title, description, image, and security information.

## Features

- Fetches link preview data (title, description, image)
- Fetches security information from Google Safe Browsing, VirusTotal, and SSL Labs
- Fetches IP information using IPInfo API

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Prodigy-Genes/Url_Lintt
   cd urlLint
   
2. Install dependencies:
   ```bash
   npm install

4. Create a .env file in the root directory and add your API keys:
   
  REACT_APP_LINK_PREVIEW_API_KEY=your_link_preview_api_key
  REACT_APP_IPINFO_API_KEY=your_ipinfo_api_key
  REACT_APP_GOOGLE_SAFE_BROWSING_API_KEY=your_googlesafebrowsing_api_key
  REACT_APP_VIRUS_TOTAL_API_KEY=your_virus_total_api_key

##  Usage
1. Start the development server:
   ```bash
    npm start

2. Open your browser and navigate to `http://localhost:3000`.

3. Enter a URL in the input field and click "Analyze Url" to fetch and display the link preview and security information.
