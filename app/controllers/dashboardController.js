const shortid = require('shortid');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('./../libs/checkLib')
const time = require('./../libs/timeLib');
/* Models */
const TaskModel = require('../models/Task');
const UserModel = require('../models/User');
const AuthModel = require('../models/Auth');

/**
 * function to read tasks by submitter.
 */
let userTasks = (req, res) => {
    let findUser=() =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findUser', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    logger.info('User Not Found!', 'Dashboard Controller: findUser')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Details Found.', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
            })
        })
    }

    let getAllTasks=(userDetails) =>{
        return new Promise((resolve, reject) => {
            TaskModel.find({ 'email': userDetails.email }, (err, result) => {
                if (err) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    console.log('Tasks Not Found.')
                    let apiResponse = response.generate(true, 'Tasks Not Found', 404, null)
                    reject(apiResponse)
                } else {
                    console.log('Tasks Found Successfully')
                    let apiResponse = response.generate(false, 'Tasks Found Successfully.', 200, result)
                    resolve(result)
                }
            })
        })
    }

    findUser()
    .then(getAllTasks)
    .then((result) => {
        let apiResponse = response.generate(false, 'All Tasks Found.', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}

/**
 * function to create the task.
 */
let createTask = (req, res) => {
    let findTaskCreator=() =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findTaskCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    logger.info('User Not Found!', 'Dashboard Controller: findTaskCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Details Found!', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
            })
        })
    }
    let taskCreationFunction = (userDetails) => {
        return new Promise((resolve, reject) => {
            console.log(req.body)
            if (check.isEmpty(req.body.title)) {
                console.log("403, forbidden request");
                let apiResponse = response.generate(true, 'Required parameters are missing!', 403, null)
                reject(apiResponse)
            } else {
                var today = time.standardFormat()
                let taskId = shortid.generate()

                let newTask = new TaskModel({
                    taskId: taskId,
                    title: req.body.title,
                    submitterFirstName: userDetails.firstName,
                    submitterLastName: userDetails.lastName,
                    email: userDetails.email,
                    created: today
                }) // end new task model
            
                newTask.save((err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } else {
                        console.log('Success in task creation')
                        resolve(result)
                    }
                }) // end new task save
            }
        }) // end new task promise
    } // end create task function

    // making promise call.

    findTaskCreator()
    .then(taskCreationFunction)
    .then((result) => {
        let apiResponse = response.generate(false, 'Task Created Successfully!', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}

/**
 * function to delete the assignment collection.
 */
let deleteTask = (req, res) => {
    let findCurrentUser=() =>{
        return new Promise((resolve, reject) => {
            UserModel.findOne({ 'userId': req.user.userId })
            .exec((err,retrievedUserDetails)=>{
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Dashboard Controller: findTaskCreator', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedUserDetails)) {
                    logger.info('User Not Found!', 'Dashboard Controller: findTaskCreator')
                    let apiResponse = response.generate(true, 'User Not Found!', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Details Found', 200, retrievedUserDetails)
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                }
            })
        })
    }
    let findTask=(userDetails) =>{
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.taskId)) {
                console.log('taskId should be passed')
                let apiResponse = response.generate(true, 'taskId is missing', 403, null)
                reject(apiResponse)
            } 
            else {
                TaskModel.findOne({ 'taskId': req.params.taskId }, (err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } 
                    else if (check.isEmpty(result)) {
                        console.log('Task Not Found.')
                        let apiResponse = response.generate(true, 'Task Not Found!', 404, null)
                        reject(apiResponse)
                    } 
                    else {          
                        console.log('Task Found')
                        let apiResponse = response.generate(false, 'Task Found', 200, result)
                        if(userDetails.email!=result.email){
                            console.log('Not Authorized to delete this Task!')
                            let apiResponse = response.generate(true, 'Not authorized to delete this task!', 500, null)
                            reject(apiResponse)
                        }
                        else if(userDetails.email==result.email){
                            userEmail = result.email
                            console.log('Authorized to delete this task!')
                            let apiResponse = response.generate(true, 'Authorized to delete this task!', 200, userEmail)
                            resolve(userEmail)
                        }
                    }
                });                       
            }
        })
    }
   
    let deleteThisTask=() =>{
        return new Promise((resolve, reject) => {
            TaskModel.remove({'taskId': req.params.taskId }, (err, result) => {
                if (err) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    console.log('Task Not Found.')
                    let apiResponse = response.generate(true, 'Task Not Found.', 404, null)
                    reject(apiResponse)
                } else {
                    console.log('Task Deletion Success')
                    let apiResponse = response.generate(false, 'Task Deleted Successfully!', 200, result)
                    resolve(apiResponse)
                }
            })
        })
    }
    findCurrentUser(req,res)
    .then(findTask)
    .then(deleteThisTask)
    .then((result) => {
        let apiResponse = response.generate(false, 'Task Deleted.', 200, result)
        res.send(apiResponse)
    })
    .catch((error) => {
        console.log(error)
        res.send(error)
    })
}

module.exports = {
    userTasks: userTasks,
    createTask: createTask,
    deleteTask: deleteTask, 
}// end exports
