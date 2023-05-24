var express = require('express');
var router = express.Router();

const postController = require('../controllers/post');
const sessionController = require('../controllers/session');
const userController = require('../controllers/user');

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {fileSize: 20 * 1024 *1024} //1024 * 1024 es megabyte, si quisiesemos Kb seria quitar uno, y si queremos Gb añadir un tercero
});

//Pagina ppal
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Pagina de autor
router.get('/author', (req,res,next) => {
  res.render('author');
})

//Cargame el post que corresponda con el postId, esto es para evitar tener que poner un /!,/2 para cada post
router.param('postId', postController.load); //Primero antes de nada consulta parametros a ver si coincide

// el \\d+ hace que pueda ser un numero de mas de una cifra
router.get('/posts/:postId(\\d+)/attachment', postController.attachment); 

router.get('/posts', postController.index);

//:postId(\\d+) se llama escapado, dentro de lo que vaya de los dos puntos es contenido variable, metemos \\d+ para que pueda tener infinitas cifras, llamado escapado regex
router.get('/posts/:postId(\\d+)', postController.show);

// Si quieres ir a posts/new me cargas el controlador
router.get('/posts/new', postController.new);

//Gonde guardarlo, en el /post, le subimos la imagen, y ejecutamos el create 
router.post('/posts', upload.single('image'), postController.create); //upload.single('image') es el middlewere que se ejecuta cada vez que se hace un metodo post a /post
// pertenece al paquete multer, sirve para extraer imagenes de la peticion, extrayendola por su id image

//Para editar los post
router.get('/posts/:postId(\\d+)/edit', postController.edit);

router.put('/posts/:postId(\\d+)', upload.single('image'), postController.update);

//Misma que con el show
router.delete('/posts/:postId(\\d+)', postController.destroy);

//Practica 8
router.param('userId', userController.load);
router.get('/users',                    userController.index);
router.get('/users/:userId(\\d+)',      userController.show);
router.get('/users/new',                userController.new);
router.post('/users',                   userController.create);
router.get('/users/:userId(\\d+)/edit', userController.edit);
router.put('/users/:userId(\\d+)',      userController.update);
router.delete('/users/:userId(\\d+)',   userController.destroy);

// Routes for the resource /session
router.get('/login',    sessionController.new);     // login form
router.post('/login',   sessionController.create);  // create sesion
router.delete('/login', sessionController.destroy); // close sesion

module.exports = router;
