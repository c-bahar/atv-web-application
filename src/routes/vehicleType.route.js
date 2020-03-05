const vehicleTypeController = require('../controllers/vehicleType.controller');
const { validateUserAndNavigate } = require('../utils/authentication');

const routes = (app) => {
  app
    .route('/vehicletype/add')
    .get(
      validateUserAndNavigate,
      vehicleTypeController.addVehicleTypeView,
    )
    .post(
      validateUserAndNavigate,
      vehicleTypeController.addVehicleType,
    );
  app
    .route(['/vehicletype', '/vehicletype/list'])
    .get(
      validateUserAndNavigate,
      vehicleTypeController.listVehicleType,
    );
  app
    .route('/vehicletype/delete/:id?')
    .get(
      validateUserAndNavigate,
      vehicleTypeController.deleteVehicleType,
    );
  app
    .route('/vehicletype/update/:id?')
    .get(
      vehicleTypeController.updateVehicleTypeView,
    )
    .post(
      validateUserAndNavigate,
      vehicleTypeController.updateVehicleType,
    );
};

module.exports = routes;
