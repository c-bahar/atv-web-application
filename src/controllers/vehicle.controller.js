const httpStatus = require('http-status');
const i18n = require('../services/i18n');
const routeNames = require('../locales/routeNamesTR.json');
const { DB } = require('../services/sequelize');
const { getFormattedTimeStamp } = require('../utils/timezoneHelpers');

const statusIdOtopark = async () => {
  const vehicleStatus = await DB.VehicleState.findOne({
    where: {
      description: 'Otoparkta',
    },
  });
  return vehicleStatus;
};

exports.addVehicleView = async (req, res) => {
  const vehiclePlates = await DB.TowedVehicle.findAll({
    raw: true,
    where: {
      stateId: 2,
    },
  });

  const vehicleTypes = await DB.VehicleType.findAll({
    raw: true,
  });

  const vehicleColors = await DB.VehicleColor.findAll({
    raw: true,
  });

  const vehicleBodyTypes = await DB.VehicleBodyStyle.findAll({
    raw: true,
  });

  const vehicleBrands = await DB.VehicleBrand.findAll({
    raw: true,
  });

  const vehicleStates = await DB.VehicleState.findAll({
    raw: true,
  });

  return res.render('layouts/main', {
    partialName: 'entranceVehicle',
    vehiclePlates,
    vehicleTypes,
    vehicleColors,
    vehicleBodyTypes,
    vehicleBrands,
    vehicleStates,
  });
};

exports.addVehicle = async (req, res) => {
  const vehicle = req.body;
  try {
    const towedVehicle = await DB.TowedVehicle.findOne({
      where: {
        plate: vehicle.plate,
      },
    });
    if (!towedVehicle) {
      const result = {
        message: `There is no record with the plate = ${vehicle.plate} added by tow driver`,
        success: false,
      };
      // return no record with given plate view
      return res.status(httpStatus.NOT_FOUND).json(result);
    }

    const date = getFormattedTimeStamp('YYYY-MM-DD HH:mm:ss');

    await DB.Vehicle.upsert({
      plate: vehicle.plate,
      chassisNo: vehicle.chassisNo,
      trusteeNo: vehicle.trusteeNo,
      vehicleTypeId: parseInt(vehicle.vehicleTypeId),
      engineNo: vehicle.engineNo,
      colorId: parseInt(vehicle.colorId),
      modelYear: parseInt(vehicle.modelYear),
      bodyTypeId: parseInt(vehicle.bodyTypeId),
      brandId: parseInt(vehicle.brandId),
      ownerProfileId: parseInt(vehicle.ownerProfileId),
    });

    const vehicleStatus = await DB.VehicleState.findOne({
      where: {
        description: 'Transfer Halinde',
      },
    });

    await DB.TowedVehicle.update(
      { stateId: vehicle.stateId, entranceParkingLotDate: date },
      { where: { stateId: parseInt(vehicleStatus.id), plate: vehicle.plate } },
    );

    req.session.flashMessages = {
      message: i18n.__('ADDED', routeNames.VEHICLE),
      type: 'success',
    };
    return res.redirect('/vehicle/add');
  } catch (exception) {
    req.session.flashMessages = {
      message: i18n.__('ADD_ERROR', routeNames.VEHICLE),
      type: 'danger',
    };
    return res.redirect('/vehicle/add');
  }
};

exports.searchVehicleView = async (req, res) => {
  const vehicleStates = await DB.VehicleState.findAll({
    raw: true,
  });

  return res.render('layouts/main', {
    partialName: 'searchVehicle',
    vehicleStates,
  });
};

exports.searchVehicle = async (req, res) => {
  const {
    plate, stateId, parkingLotEntranceBegin, parkingLotEntranceEnd,
    parkingLotExitBegin, parkingLotExitEnd,
  } = req.body;
  const whereStatement = {};

  try {
    const { Op } = DB.Sequelize;

    whereStatement.plate = {
      [Op.like]: `%${plate}%`,
    };
    if (stateId) {
      whereStatement.stateId = stateId;
    }
    if (parkingLotEntranceBegin && parkingLotEntranceEnd) {
      whereStatement.entranceParkingLotDate = {
        [Op.and]: {
          [Op.gte]: parkingLotEntranceBegin,
          [Op.lte]: parkingLotEntranceEnd,
        },
      };
    } else if (parkingLotEntranceBegin && !parkingLotEntranceEnd) {
      whereStatement.entranceParkingLotDate = {
        [Op.gte]: parkingLotEntranceBegin,
      };
    } else if (!parkingLotEntranceBegin && parkingLotEntranceEnd) {
      whereStatement.entranceParkingLotDate = {
        [Op.lte]: parkingLotEntranceEnd,
      };
    }

    if (parkingLotExitBegin && parkingLotExitEnd) {
      whereStatement.exitParkingLotDate = {
        [Op.and]: {
          [Op.gte]: parkingLotExitBegin,
          [Op.lte]: parkingLotExitEnd,
        },
      };
    } else if (parkingLotExitBegin && !parkingLotExitEnd) {
      whereStatement.exitParkingLotDate = {
        [Op.gte]: parkingLotExitBegin,
      };
    } else if (!parkingLotExitBegin && parkingLotExitEnd) {
      whereStatement.exitParkingLotDate = {
        [Op.lte]: parkingLotExitEnd,
      };
    }

    const vehicles = await DB.TowedVehicle.findAll({
      raw: true,
      include: [
        {
          model: DB.Vehicle,
          attributes: ['chassisNo', 'modelYear'],
        },
        {
          model: DB.ParkingLot,
          attributes: ['name'],
        },
        {
          model: DB.VehicleState,
          attributes: ['description'],
        },
      ],
      where: whereStatement,
    });

    const parkingLots = await DB.ParkingLot.findAll({
      raw: true,
    });

    const vehicleStates = await DB.VehicleState.findAll({
      raw: true,
    });

    if (!vehicles.length > 0) {
      req.session.flashMessages = {
        message: i18n.__('SEARCH_ERROR', routeNames.VEHICLE),
        type: 'danger',
      };
      return res.redirect('/vehicle/search');
    }
    return res.render('layouts/main', {
      partialName: 'searchVehicle',
      vehicles,
      parkingLots,
      vehicleStates,
    });
  } catch (err) {
    req.session.flashMessages = {
      message: i18n.__('SEARCH_ERROR', routeNames.VEHICLE),
      type: 'danger',
    };
    console.log('err', err);
    return res.redirect('/vehicle/search');
  }
};

exports.exitVehicleView = async (req, res) => {
  const { plate } = req.query;
  try {
    const vehicleStatus = await statusIdOtopark();
    const towVehicle = await DB.TowedVehicle.findOne({
      where: {
        plate, stateId: parseInt(vehicleStatus.id),
      },
      raw: true,
    });

    const vehicle = await DB.Vehicle.findOne({
      where: {
        plate,
      },
      raw: true,
    });

    const vehicleTypes = await DB.VehicleType.findAll({
      raw: true,
    });

    if (!vehicle) {
      return res.redirect('/vehicle/search');
    }

    const discountByRole = await DB.Discount.findAll({
      raw: true,
    });

    return res.render('layouts/main', {
      partialName: 'exitVehicle',
      discountByRole,
      towVehicle,
      vehicle,
      vehicleTypes,
    });
  } catch (err) {
    return res.redirect('/vehicle/search');
  }
};

exports.exitVehicle = async (req, res) => {
  const { plate } = req.body;
  try {
    const exitDate = getFormattedTimeStamp('YYYY-MM-DD HH:mm:ss');
    const vehicleStatusExit = await DB.VehicleState.findOne({
      where: {
        description: 'Çıkış Yaptı',
      },
    });
    const vehicleStatus = await statusIdOtopark();
    await DB.TowedVehicle.update(
      {
        stateId: parseInt(vehicleStatusExit.id),
        exitParkingLotDate: exitDate,
      },
      {
        where: {
          plate, stateId: parseInt(vehicleStatus.id),
        },
        raw: true,
      },
    );
    req.session.flashMessages = {
      message: i18n.__('EXIT_VEHICLE_SUCCESS', routeNames.VEHICLE),
      type: 'success',
    };
    return res.redirect('/vehicle/search');
  } catch (err) {
    return res.redirect('/vehicle/search');
  }
};
