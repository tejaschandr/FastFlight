class FlightView {
    constructor() {
        this.resultsDiv = document.getElementById('results');
        this.searchButton = document.getElementById('searchButton');
    }

    showLoading(message) {
        this.resultsDiv.innerHTML = `<p class="loading">${message}</p>`;
    }

    showError(message) {
        this.resultsDiv.innerHTML = `<div class="error">${message}</div>`;
    }

    enableSearchButton() {
        if (this.searchButton) {
            this.searchButton.disabled = false;
        }
    }

    renderFlightResults(flight, destinationImage, currentDate, totalPrice, getOutPrice) {
        let html = '<div class="flight-card">';
        
        if (destinationImage) {
            html += `
            <div class="destination-image">
                <h3>Destination Preview</h3>
                <img src="${destinationImage.url}" alt="${flight.itineraries[0].segments[0].arrival.iataCode} city" class="city-image">
            </div>`;
        }

        html += `
            <h3>Closest Available Flight</h3>
            <p><strong>Date Found:</strong> ${this.formatDate(currentDate)}</p>
            <p><strong>Flight Price:</strong> $${totalPrice.toFixed(2) * 5}</p>
            <p><strong>Total Duration:</strong> ${this.calculateTotalDuration(flight.itineraries[0].segments)}</p>
            <div class="price-message">
                <h2>To get out of the country ASAP, you need $${getOutPrice.toFixed(2)}</h2>
                <p></p>
            </div>
            <div class="flight-details">
        `;
        
        flight.itineraries[0].segments.forEach((segment, idx) => {
            html += `
                <div class="flight-leg">
                    <h4>Leg ${idx + 1}: ${segment.departure.iataCode} → ${segment.arrival.iataCode}</h4>
                    <p>Departure: ${this.formatDateTime(segment.departure.at)}</p>
                    <p>Arrival: ${this.formatDateTime(segment.arrival.at)}</p>
                    <p>Carrier: ${segment.carrierCode} ${segment.number}</p>
                </div>
            `;
        });
        html += '</div></div>';

        this.resultsDiv.innerHTML = html;
    }

    formatDateTime(dateTimeStr) {
        const dt = new Date(dateTimeStr);
        return dt.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    calculateTotalDuration(segments) {
        const firstDeparture = new Date(segments[0].departure.at);
        const lastArrival = new Date(segments[segments.length - 1].arrival.at);
        const durationMs = lastArrival - firstDeparture;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
}

export default FlightView;