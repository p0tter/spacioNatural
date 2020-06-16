import React, {Fragment, useState} from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';

export const FileUpload = () => {
    const[file,setFile] = useState(null);
    const[fileName,setFileName] = useState('Seleccione el Archivo');        
    const[message, setMessage] = useState('');
    const[uploadPercentage, setUploadPercentage] = useState(0);
    

    const onChange = e =>{     
        //setFile(e.target.files[0]);            
        //setFile1Name(e.target.files[0].name);
        setFile(e.target.files);
        setFileName(`Archivos Cargados ${e.target.files.length}`);
    }

    const onSubmit = async e=>{
         
        e.preventDefault();
        const formData = new FormData();
        if(!file){
            setMessage('No hay Archivos Cargados');
            //formData.append('file',file);
        }
        else{
            for (let i = 0; i<file.length; i++){
                formData.append(`file_${i}`,file[i]);
            }
            //console.log(formData);
            try{                
                await axios.post('http://localhost:5000/upload',formData,{
                    headers:{
                        'Content-Type':'multipart/form-data'
                        //'encType':'multipart/form-data'
                        
                    },
                    onUploadProgress: ProgressEvent =>{
                        setUploadPercentage(parseInt(Math.round((ProgressEvent.loaded *100) / ProgressEvent.total)));
                        setTimeout(()=>setUploadPercentage(0),10000);
                    }            
                })
                .then(res=>{
                    setMessage(res.data.msg);   
                });            
            }catch(err){
                if (err.response.status === 500){
                    setMessage('There was a problem with the server');
                }
                else if(err.response.status === 400){
                    setMessage(err.response.data.msg);
                }
                else if(err.response.status === 404){
                    setMessage(err.response.data.msg);
                }
                else if(err.response.status === 401){
                    setMessage(err.response.data.msg);
                }
                else if(err.response.status === 406){
                    setMessage(err.response.data.msg);
                }
                else if(err.response.status === 412){
                    setMessage(err.response.data.msg);
                }
                else{
                    setMessage('There was a problem with the server');
                }  
            }
        }
    }
    return (
        <Fragment>
            {message ? <Message msg={message}/> : null}
            <form onSubmit={onSubmit} >
                <div className="custom-file mb-4">
                    <input type="file" name="sampleFile" className="custom-file-input" id="customFile" multiple  onChange={onChange} />
                    <label className="custom-file-label" htmlFor="customFile">
                        {fileName}
                    </label>
                </div>
                <Progress percentage={uploadPercentage}/>
                <input type="submit" value="Aceptar" className="btn btn-primary btn-block mt-4"></input>
            </form>            
        </Fragment>
    )
}

export default FileUpload