const express = require ('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const fileSystem = require('fs');
const csvToJson = require('csvjson');

const app = express();
app.use(cors());

app.use(fileUpload());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.set('port', process.env.PORT || 5000);

//Upload Endpoint
app.post('/upload',(req,res,next)=>{ 
    console.log(Object.keys(req.files));
    if(Object.keys(req.files).length<2){
        return res.status(404).json({
            msg:'Se deben subir los dos archivos'
        });
    }
    if(Object.keys(req.files).length>2){
        return res.status(401).json({
            msg:'No se puede subir más de tres archivos'
        });
    }
    // hay que validar que el archivo exista y que la extension sea sola .xlsx
    let fileOne = req.files.file_0;
    let fileTwo = req.files.file_1;
    let dataExcelFile = [];
    let dataCsvFile = [];
    let arrayDataCsvFile= [];   
    function readFileToJson(workBookFileName){
        const workBook = xlsx.readFile(workBookFileName,{cellDates: true});
        const tabName = workBook.SheetNames;
        console.log(tabName);
        for(let i=0; i<tabName.length; i++){
            if(tabName[i] === 'Transacciones'){
                const workBookSheet = workBook.Sheets[tabName[i]];
                const dataWorkBookSheet = xlsx.utils.sheet_to_json(workBookSheet);
                //console.log(dataWorkBookSheet);
                let arrayDataWorkBookSheet = [];                
                let jsonDataWorkBookSheet = {};
                let stringDataWorkBookSheet ='';
                for (let z=0; z<dataWorkBookSheet.length; z++){
                    stringDataWorkBookSheet = JSON.stringify(dataWorkBookSheet[z]);
                    //console.log(stringDataWorkBookSheet);
                    for(let y=0; y<stringDataWorkBookSheet.length; y++){
                        stringDataWorkBookSheet = stringDataWorkBookSheet.replace(' ','_');
                    }
                    jsonDataWorkBookSheet=JSON.parse(stringDataWorkBookSheet);
                    //console.log(jsonDataWorkBookSheet.Estado);
                    if(jsonDataWorkBookSheet.Estado === 'Venta_Autorizada'){
                        arrayDataWorkBookSheet.push(jsonDataWorkBookSheet);
                    }    
                }                
                arrayDataWorkBookSheet = arrayDataWorkBookSheet.map((recordArrayDataWorkBookSheet)=>{
                    delete recordArrayDataWorkBookSheet.Fecha_creación;
                    delete recordArrayDataWorkBookSheet.Comercio;
                    delete recordArrayDataWorkBookSheet.Estado;
                    delete recordArrayDataWorkBookSheet.Moneda;
                    delete recordArrayDataWorkBookSheet.Tipo_de_comercio;
                    delete recordArrayDataWorkBookSheet.Orden_compra_Mall;
                    delete recordArrayDataWorkBookSheet.Tipo_de_producto;
                    delete recordArrayDataWorkBookSheet.Número_de_cuotas;
                    delete recordArrayDataWorkBookSheet.Final_número_tarjeta;
                    delete recordArrayDataWorkBookSheet.VCI;
                    delete recordArrayDataWorkBookSheet.Observación;
                    delete recordArrayDataWorkBookSheet.Código_de_respuesta;
                    delete recordArrayDataWorkBookSheet.Dispositivo_de_conexión;
                    delete recordArrayDataWorkBookSheet.Medio_de_Pago;
                    recordArrayDataWorkBookSheet.Monto_TransBank = `$${recordArrayDataWorkBookSheet.Monto}`;
                    delete recordArrayDataWorkBookSheet.Monto;
                    recordArrayDataWorkBookSheet.Impresión = 'No';                        
                    return recordArrayDataWorkBookSheet;
                });
                //console.log('-----------------------------------------------------');         
                //console.log(arrayDataWorkBookSheet);
                return arrayDataWorkBookSheet;
            }
        }        
    };

    

    const workBookPathOne = path.join(__dirname,`/client/public/uploads/${fileOne.name}`);
    const workBookPathTwo = path.join(__dirname,`/client/public/uploads/${fileTwo.name}`);
    
    const workBookOneExt = path.extname(workBookPathOne);
    const workBookTwoExt = path.extname(workBookPathTwo);
    //console.log(`${workBookOneExt}---${workBookTwoExt}`);
    const dateTime = new Date();
    const number = Date.now();
    //console.log(dateTime1);
    if(workBookOneExt !== '.csv'){
        if(workBookOneExt !== '.xls'){
            if(workBookOneExt !== '.xlsx'){
                return res.status(406).json({
                    msg:'los Archivos tienen que ser en formato CVS/XLSX/XLS'
                });
            }
        }
    } 
    if(workBookTwoExt !== '.csv'){
        if(workBookTwoExt !== '.xls'){
            if(workBookTwoExt !== '.xlsx'){
                return res.status(406).json({
                    msg:'los Archivos tienen que ser en formato CVS/XLSX/XLS'
                });
            }
        }
    }    
    fileOne.mv(workBookPathOne,err=>{
        if(err){
            return res.status(500).json({
                msg:'la ruta especificada no existe'
            });
        }        
    });
    fileTwo.mv(workBookPathTwo,err=>{
        if(err){
            return res.status(500).json({
                msg:'la ruta especificada no existe'
            });
        }
        const fs = fileSystem.readdirSync(path.join(__dirname, '/client/public/uploads/'));
        //console.log(fs);
        fs.forEach((file)=>{
            const fileExtenstion = path.parse(file).ext;
            const fullFilePath = path.join(__dirname,'/client/public/uploads/',file);
            //console.log(fullFilePath);
            
            if(fileExtenstion === '.xlsx' || fileExtenstion === '.xls'){                
                dataExcelFile = readFileToJson(fullFilePath);
                //console.log(dataExcelFile);
                if (dataExcelFile === []){
                    return res.status(412).json({
                        msg:'En el archivo Excel no se encontró la hoja "Transacciones"'
                    });
                }
                //console.log(dataExcelFile);
                //combinedData = combinedData.concat(allData);
            }
            if(fileExtenstion === '.csv'){
                const options ={
                    delimiter:';'
                };
                const fileDataToJson = fileSystem.readFileSync(fullFilePath,{encoding:'utf8'});
                dataCsvFile = csvToJson.toObject(fileDataToJson,options);
                let jsonDataCsvFile={};
                let stringDataCsvFile='';
                
                dataCsvFile = dataCsvFile.map((recordDataCsvFile)=>{
                    stringDataCsvFile = JSON.stringify(recordDataCsvFile);
                    for (let g = 0; g<stringDataCsvFile.length; g++){
                        stringDataCsvFile = stringDataCsvFile.replace(`${String.fromCharCode(92)}"`,'');
                        stringDataCsvFile = stringDataCsvFile.replace('.','');
                        stringDataCsvFile = stringDataCsvFile.replace('$ ','$');
                    }    
                    jsonDataCsvFile = JSON.parse(stringDataCsvFile);

                    arrayDataCsvFile.push(jsonDataCsvFile);
                    /*console.log(arrayDataCsvFile);*/
                   
                    //recordDataCsvFile.Total = recordDataCsvFile.Total.replace('.','');
                    return recordDataCsvFile;
                }); 
                //console.log(arrayDataCsvFile);
                //console.log('-----------------------------------------------------')               
                //console.log(dataCsvFile);
                //combinedData = combinedData.concat(resultJson);
            }
            /*else{
                return res.status(406).json({
                    msg:'los Archivos tienen que ser en formato CVS/XLSX/XLS'
                });
            }*/
        });
        
        try{
            //console.log(workBookPathOne);
            //console.log(workBookPathTwo);
            fileSystem.unlinkSync(workBookPathOne);
            fileSystem.unlinkSync(workBookPathTwo);
        }catch(err){
            return res.status(400).json({
                msg:'los archivos subidos no pudieron ser eliminados'
            });
        }
        
        //console.log(dataCsvFile);
        let finalObjectData = [{}]; 
        let stringObjectData ='';
        let arrayObjectData=[]; 
        let jsonObjectData={};
        arrayDataCsvFile = arrayDataCsvFile.map((recordDataCsvFile)=>{
            dataExcelFile = dataExcelFile.map((recordDataExcelFile)=>{    
                if((recordDataExcelFile.Monto_TransBank === recordDataCsvFile.Total)&&((recordDataCsvFile.Estado === 'Agregado a laudus')||(recordDataCsvFile.Estado ==='Pago aceptado'))){                      
                   // console.log(`${recordDataExcelFile.Monto_TransBank}----${recordDataCsvFile.Total}`);
                    finalObjectData = finalObjectData.map((recordFinalObjectData)=>{                        
                        recordFinalObjectData.Referencia = recordDataCsvFile.Referencia;
                        recordFinalObjectData.Cliente = recordDataCsvFile.Cliente;
                        recordFinalObjectData.Total = recordDataCsvFile.Total;
                        recordFinalObjectData.Pago = recordDataCsvFile.Pago;
                        recordFinalObjectData.Fecha = recordDataCsvFile.Fecha;
                        recordFinalObjectData.Orden_de_compra = recordDataExcelFile.Orden_de_compra;
                        recordFinalObjectData.Código_autorización = recordDataExcelFile.Código_autorización;
                        recordFinalObjectData.Impresión = recordDataExcelFile.Impresión;                        
                        stringObjectData =JSON.stringify(recordFinalObjectData);
                        jsonObjectData = JSON.parse(stringObjectData);
                        arrayObjectData.push(jsonObjectData);
                        //console.log(jsonObjectData.Referencia);
                        return recordFinalObjectData;
                    }); 
                    //console.log(recordFinalObjectData);
                }
                return recordDataExcelFile;
            }); 
            return recordDataCsvFile;         
        });        
        //console.log(combinedData);
        const newWorkSheet = xlsx.utils.json_to_sheet(arrayObjectData);
        const newWorkBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkBook,newWorkSheet,'Data');
        const writeFilePath = path.join(__dirname,`/client/public/`);
        fileSystem.mkdir(writeFilePath, { recursive: true }, (err) => {
            if (err){
                return res.status(412).json({
                    msg: `Hubo un error al crear la carpeta ${writeFilePath}`
                });
            }else{
                xlsx.writeFile(newWorkBook,path.join(writeFilePath,`Consolidado ${dateTime.toISOString().slice(0,10)}_${number}.xlsx`),{cellDates:false});                
                res.json({msg: 'Archivo creado exitosamente'});
            }
        });
        
    });
});

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));
}

app.listen(app.get('port'), ()=>{
    console.log(`Server Started on port ${app.get('port')}`);
});