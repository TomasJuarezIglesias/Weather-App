const fs = require('fs')
const axios = require('axios');
const { encode } = require('punycode');



class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        // TODO: leer Db si existe
        this.leerDB()
    }

    get historialCapitalizado(){
        
        return this.historial.map(lugar => {
            let palabras = lugar.split(' '); // Divide por espacio
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1)) // Se pone en mayuscula primera letra y se le agrega el resto de la palabra

            return palabras.join(' ') // retorna todo junto
        });
    }

    get paramsMapBox(){
        return {
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
        }
    }

    get paramsClima(){
        return{
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'

        }
    }

    async ciudad(lugar = '') {
        try{
            // Peticion http
            const instance = axios.create({
               baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json?`,
               params: this.paramsMapBox
            });

            const resp = await instance.get();

            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            })); // Regresa objeto de forma implicita ({})
        }catch (error){
            return [];
        }
    }

    async climaLugar(lat, lon){

        try{
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?`,
                params: {...this.paramsClima, lat, lon}  
            })
            const resp = await instance.get();
            const {weather, main} = resp.data;

            return {
                desc: weather[0].description, // Se obtiene el valor de esta manera porque el weather es un arr y dentro viene un obj
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        }catch(error){
            console.log(error);
        }

    }

    agregarHistorial(lugar = ''){

        if(this.historial.includes(lugar.toLowerCase())){
            return;
        }
        this.historial = this.historial.splice(0,5) // cantidad que va haber


        this.historial.unshift(lugar.toLowerCase());
        
        // Grabar DB
        this.guardarDB();

    }

    guardarDB(){
        const payLoad = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payLoad));

    }

    leerDB(){
        if(this.historial){
            const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'})
            const data = JSON.parse(info)
            this.historial = data.historial;
        }

    }
    
}




module.exports = Busquedas;






