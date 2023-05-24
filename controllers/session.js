/*
Practica 8:
    con la instalacion de "express-session", ahora la req tiene propiedad req.session
    app.js=>
        si existe req.session=>res.local.login =req.session
        si no existe req.session=> res.local.loginUser = undefined

Formularios: POST
    1.Envian en el body la info capturada por cada uno de los cajetines
    2.El contenido del body seran las claves: valor definidas como "name" en el formulario
    
*/
const Sequelize = require("sequelize");
const {models} = require("../models");
const url = require('url');

// This variable contains the maximum inactivity time allowed without 
// making requests.
// If the logged user does not make any new request during this time, 
// then the user's session will be closed.
// The value is in milliseconds.
// 5 minutes.
const maxIdleTime = 5*60*1000;

//
// Middleware used to destroy the user's session if the inactivity time
// has been exceeded.
//
exports.deleteExpiredUserSession = (req, res, next) => {
    if (req.session.loginUser ) {
        if ( req.session.loginUser.expires < Date.now() ) { // Expired
            delete req.session.loginUser; // Logout
            console.log('Info: User session has expired.');
        } else { // Not expired. Reset value.
            req.session.loginUser.expires = Date.now() + maxIdleTime;
        }
    }
    // Continue with the request
    next();
};

/*
 * User authentication: Checks that the user is registered.
 *
 * Searches a user with the given username, and checks that
 * the password is correct.
 * If the authentication is correct, then returns the user object.
 * If the authentication fails, then returns null.
 */
const authenticate = async (username, password) => {
    const user = await models.User.findOne({where: {username: username}})
    return user?.verifyPassword(password) ? user : null;
};

// GET /login   -- Login form
exports.new = (req, res, next) => {
    res.render('session/new');
};

// POST /login   -- Create the session if the user authenticates successfully
exports.create = async (req, res, next) => {
    const username = req.body.username ?? ""; //Los interrogantes es como los &&, si no existe req.body.username mete ""
    const password = req.body.password ?? "";//Devuelve la variable de la derecha si lo de la izquierda es null o undefined

    try {
        const user = await authenticate(username, password);
        if (user) {
            console.log('Info: Authentication successful.');

            // Create req.session.user and save id and username fields.
            // The existence of req.session.user indicates that the session exists.
            // I also save the moment when the session will expire due to inactivity.
            req.session.loginUser = {//Definimos el parametro req.session.loginUser
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
                expires: Date.now() + maxIdleTime
            };
            //Adonde te mande despues de logearte de manera exitosa
            res.redirect("/");//atento que es diferente que res.render que sirve para cargar visat parciales en layout, esta es para visitar un link
        } else {
            console.log('Error: Authentication has failed. Retry it again.');
            res.render('session/new');
        }
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};

// DELETE /login   --  Close the session
exports.destroy = (req, res, next) => {
    delete req.session.loginUser; //Borro la propiedad req.session.loginUser
    res.redirect("/login"); // redirect to login gage
};