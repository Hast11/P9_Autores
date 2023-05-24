        const Sequelize = require("sequelize");
const {models} = require("../models");

//Autocarga del post asociado a el postId
exports.load = async (req, res, next, postId) => { //Exporta la funcion load, asincrona con 4 parametros
    try{ //Intenta para capturar el error
        const post = await models.Post.findByPk(postId, { //Crea constante post y busco en la DB por la clave primera el postId
            include: [ //Carga ansiosa
                {model: models.Attachment, as: 'attachment'}//Si encuentra el objeto post, añademe la propiedad attachment, que sea objeto js que tenga los datos del attachment
            ]
        });
        if (post) { //Si encontramos el post
            req.load = {...req.load, post}; //Añadir propiedad al objeto req (req.load()) y añadir todas las propiedades del objeto req previo, y añadir una propiedad nueva post
            next();//Los tres puntos son spread operator, "concatena" arrays, en la parte de arriba es que coges todos los datos de req.load y lo actualizas con post
        } else {//Nesxt para ejecutar el siguiente middlewere
            throw new Error ('No existe post con id:' + postId);
        }
    }catch (error) {
        next(error);
    }
};


exports.attachment = (req, res, next) => {
    const { post } = req.load; // es igual que const post = req.load.post; 
    const { attachment } = post; //const attachment = req.load.attachment

    if(!attachment){ //Si no existe la propiedad attachment
        res.redirect("/images/none.png"); //cambiamos la url a la del fichero de non
    }
    if (attachment.image){ //si existe la imagen
        res.type(attachment.mime); //coger que tipo de imagen es
        res.send(Buffer.from(attachment.image.toString(), 'base64')); //coger la imagen
    }
    else if(attachment.url){
        res.redirect(attachment.url);
    }
    else {
         res.redirect("/imgaes/none.png");
    }
};

exports.index = async (req, res, next) => {
    try {
        const findOptions = { //Aqui es como en el primer metoo pero en vez de poner el include en el find all
            include: [ //Lo deja creado de antes
                {model: models.Attachment, as: 'attachment'}
            ]
        };

        const posts = await models.Post.findAll(findOptions);
        res.render('posts/index.ejs', {posts});//Renderizame la vista post/index, {posts:posts}, para que la vista tenga post, se lo pasas como variable
    } catch (error) { //el nombre d ela variable aparece luego en views/posts/index.ejs
        next(error);
    }
};
 
exports.show = (req, res, next) => {
    const {post} = req.load; // const post = req.load.post;
    res.render('posts/show', {post}); //res.render('posts/show', { post: post });
};

//Se pasa renderizado de la vista post
exports.new = (req, res, next) => {
    const post = {
        title: "",
        body: ""
    };
    res.render('posts/new', {post});
}

// POST /posts/create
exports.create = async (req, res, next) => { //Toma la peticion
    const {title, body} = req.body; 
    // req = {..., body{ title: blabla, body: blablabla}}, toda peticion tiene un cuerpo de peticion
    // const title = req.body.title;
    // const body = req.body.body
    // req.
    let post; //Inicializo variable post
    try {
        post = models.Post.build({ //Generame una copia persistente de un objeto de una fila de la DB, post
            title,
            body
        });

        post = await post.save({fields: ["title", "body"]}); //Guardo la copia en la base de datos
        // console.log('Post creado con éxito.');

        try {
            if (!req.file) { //Si no hay un fichero
                //console.log('Info: Se requiere una foto.');
                return;
            }
            // Create the post attachment
            await createPostAttachment(req, post);
        } catch (error) {
            console.log('Error: Failed to create attachment: ' + error.message);
        } finally { //En caso de que se haya podido ejecutar el try
            res.redirect('/posts/' + post.id); //Ejecuto lo de dentro del finally, en este caso ir a la url de el post creado
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('Errores en el formulario:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('posts/new', {post});
        } else {
            next(error);
        }
    }
};

// Aux function to upload req.file to cloudinary, create an attachment with it, and
// associate it with the gien post.
// This function is called from the create an update middleware. DRY.
const createPostAttachment = async (req, post) => { //Copia y pega del quiz
    const image = req.file.buffer.toString('base64');
    const url = `${req.protocol}://${req.get('host')}/posts/${post.id}/attachment`;

    // Create the new attachment into the data base.
    const attachment = await models.Attachment.create({
        mime: req.file.mimetype,
        image,
        url
    });
    await post.setAttachment(attachment);
    console.log('Success: Attachment saved successfully.');
};

// GET /posts/:postId/edit
exports.edit = (req, res, next) => {
    const {post} = req.load; //capturar el post de req.load
    res.render('posts/edit', {post}); //renderizar la vista de edicion
};

// PUT /posts/:postId
exports.update = async (req, res, next) => {
    const {post} = req.load;

    post.title = req.body.title;
    post.body = req.body.body;
    //
    try {
        await post.save({fields: ["title", "body"]});//Esto es donde se edita correctamente el post
        // console.log('Post editado exitosamente.');

        try { //A partir de aqui es la parte del quiz copiada
            if (!req.file) {
                console.log('Info: Foto no cambiada.');
                return;
            }

            // Delete old attachment.
            if (post.attachment) {
                await post.attachment.destroy();//Si hay nuevo attachment borramos el anterior
                await post.setAttachment(); //Metemos la nueva  
            }
            
            // Create the post attachment
            await createPostAttachment(req, post);
        } catch (error) { //todo esto es lo mismo que en el create
            //console.log('Error: Fallo guardando la foto: ' + error.message);
        } finally {
            res.redirect('/posts/' + post.id);
        }
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            //console.log('Errores en el formulario:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('posts/edit', {post});
        } else {
            next(error);
        }
    }
};

// DELETE /posts/:postId
exports.destroy = async (req, res, next) => {
    const attachment = req.load.post.attachment; //Coger el post de dentro de la peticion

    try {
        await req.load.post.destroy(); //Intenta eliminarlo
        attachment && await attachment.destroy(); //if (attachment){ await attachment.destroy()}
        //console.log('Post eliminado con éxito.');
        res.redirect('/posts');//Ir a la lista de posts
    } catch (error) {
        //console.log('Error eliminando Post: ' + error.message); 

        next(error);
    }
};



