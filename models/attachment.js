'use strict';

const {Model} = require('sequelize');

// Definition of the Attachment model:
module.exports = (sequelize, DataTypes) => {

    class Attachment extends Model { }

    Attachment.init({
            mime: {
                type: DataTypes.STRING
            },
            url: { //Donde se aloja cada imagen si no tiene un sitio especifico
                type: DataTypes.STRING
            },
            image: {
                type: DataTypes.BLOB('long') //Todos los bytes de la imagen como un String
            }
        }, { sequelize }
    );

    return Attachment;
};