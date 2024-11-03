import FlightModel from './model.js';
import FlightView from './view.js';
import FlightController from './controller.js';

const model = new FlightModel();
const view = new FlightView();
const controller = new FlightController(model, view);

window.addEventListener('DOMContentLoaded', () => controller.initialize());
document.getElementById('searchButton').addEventListener('click', () => controller.searchFlights());