import config from './config.js';

class FlightModel {
    constructor() {
        this.airports = {};
        this.config = config;
    }

    async initializeAirports() {
        try {
            const response = await fetch('iata-icao.csv');
            const csvText = await response.text();
            this.airports = this.parseCSVData(csvText);
            console.log('Airports data loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load airports data:', error);
            throw new Error('Failed to load airport data. Please refresh the page.');
        }
    }

    parseCSVData(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        return lines.slice(1).reduce((acc, line) => {
            if (!line.trim()) return acc;
            
            const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
            const airport = headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
            
            acc[airport.iata] = airport;
            return acc;
        }, {});
    }

    async getToken() {
        const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
        const apiKey = this.config.AMADEUS_API_KEY;
        const apiSecret = this.config.AMADEUS_API_SECRET;
        
        const formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        formData.append('client_id', apiKey);
        formData.append('client_secret', apiSecret);

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async getCityImage(iataCode) {
        const UNSPLASH_ACCESS_KEY = this.config.UNSPLASH_ACCESS_KEY;
        
        const airport = this.airports[iataCode.toUpperCase()];
        if (!airport) {
            throw new Error(`Airport with IATA code ${iataCode} not found`);
        }
        
        const regionName = airport.region_name;
        const url = `https://api.unsplash.com/search/photos?query=${regionName}+city&per_page=1`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return {
                    url: data.results[0].urls.regular,
                    photographer: data.results[0].user.name,
                    profileUrl: data.results[0].user.links.html
                };
            }
            return null;
        } catch (error) {
            console.error('Image fetch error:', error);
            return null;
        }
    }

    async searchForDate(origin, destination, date, token) {
        const searchUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=1&nonStop=false&currencyCode=USD&max=5`;

        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Flight search failed');
        }

        const data = await response.json();
        return data.data || [];
    }
}

export default FlightModel;