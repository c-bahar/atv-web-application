const mainPageController = require('../controllers/mainPage.controller');

const routes = (app) => {
  app
    .route('/')
    .get(mainPageController.listAnnouncements);
};

module.exports = routes;
