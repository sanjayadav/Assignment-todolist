const dashboardController = require("./../../app/controllers/dashboardController");
const appConfig = require("./../../config/appConfig");
const auth = require('./../middlewares/auth');


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/dashboard`;
  
    app.get(`${baseUrl}/`,auth.isAuthorized,dashboardController.userTasks);
    app.post(`${baseUrl}/create`,auth.isAuthorized,dashboardController.createTask);
    app.post(`${baseUrl}/:taskId/delete`,auth.isAuthorized,dashboardController.deleteTask);
}
