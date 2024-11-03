class FlightController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    async initialize() {
        try {
            await this.model.initializeAirports();
            this.view.enableSearchButton();
        } catch (error) {
            this.view.showError(error.message);
        }
    }

    async searchFlights() {
        this.view.showLoading('Searching for the closest available flight...');

        try {
            const origin = document.getElementById('origin').value.toUpperCase();
            const destination = document.getElementById('destination').value.toUpperCase();

            if (!origin || !destination) {
                throw new Error('Please fill in both origin and destination');
            }

            if (!this.model.airports[origin] || !this.model.airports[destination]) {
                throw new Error('Invalid airport code. Please use valid IATA codes.');
            }

            const [token, destinationImage] = await Promise.all([
                this.model.getToken(),
                this.model.getCityImage(destination)
            ]);

            let currentDate = new Date();
            let flightFound = false;
            let attempts = 0;
            const maxAttempts = 30;
            let flightData = null;

            while (!flightFound && attempts < maxAttempts) {
                currentDate.setDate(currentDate.getDate() + (attempts === 0 ? 0 : 1));
                const formattedDate = this.view.formatDate(currentDate);
                
                this.view.showLoading(`Searching date: ${formattedDate}...`);
                
                const flights = await this.model.searchForDate(origin, destination, formattedDate, token);
                
                if (flights.length > 0) {
                    flightFound = true;
                    flightData = flights;
                    break;
                }
                
                attempts++;
            }

            if (!flightFound) {
                this.view.showError('No flights found in the next 30 days');
                return;
            }

            const earliestFlight = flightData.reduce((earliest, current) => {
                const currentArrival = new Date(current.itineraries[0].segments[current.itineraries[0].segments.length - 1].arrival.at);
                const earliestArrival = earliest ? new Date(earliest.itineraries[0].segments[earliest.itineraries[0].segments.length - 1].arrival.at) : new Date(8640000000000000);
                return currentArrival < earliestArrival ? current : earliest;
            }, null);

            const flight = earliestFlight;
            const totalPrice = parseFloat(flight.price.total);
            const getOutPrice = totalPrice * 5;

            this.view.renderFlightResults(flight, destinationImage, currentDate, totalPrice, getOutPrice);

        } catch (error) {
            this.view.showError(error.message);
        }
    }
}

export default FlightController;