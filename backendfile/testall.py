import asyncio
import nest_asyncio
from pyzeebe import ZeebeTaskRouter, ZeebeWorker, create_insecure_channel, Job
import module_center as mc
import asc
from datetime import datetime, timedelta
import pandas as pd
import os
import shutil
from dateutil.relativedelta import relativedelta
import re
import numpy as np
import matplotlib.pyplot as plt
import zipfile
import time
import sharepoint_tools

nest_asyncio.apply()

channel = create_insecure_channel(hostname="localhost", port=26500)
worker = ZeebeWorker(channel)


@worker.task(task_type="Checkfile" , variable_name="Check_file")
async def Check_file_already_upload(job: Job):
    print("start check file")
    download_folder = r'D:\WORK\SEND_SMS_24shopping\Robot_part\Download'
    files = os.listdir(download_folder)
    if len(files) == 0:
        return {"Check_file":"unexist"}
    else:
        return {"Check_file":"exist"}
    

@worker.task(task_type="Place_file" , variable_name="Place_file")
async def Yimpan(job: Job):
    ##Extract from download then move file to input
    zip_file_path = r"D:\WORK\SEND_SMS_24shopping\Robot_part\Download\decoded_zip.zip"
    output_folder_path = r"D:\WORK\SEND_SMS_24shopping\Robot_part\Download"

    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall(output_folder_path)
        
    #Start Move file
    print("Place_file")
    source_folder = r'D:\WORK\SEND_SMS_24shopping\Robot_part\Download'
    destination_folder = r'D:\WORK\SEND_SMS_24shopping\Robot_part\input\Report_Store_Receive'
    destination_folder2 = r'D:\WORK\SEND_SMS_24shopping\Robot_part\input\tgen'

    file_prefix = 'Report_Store_Receive'
    file_prefix2 = 't_general_o'

    # Get a list of all files in the source folder
    files = os.listdir(source_folder)

    # Iterate over the files and copy the ones starting with the specified prefix
    for file in files:
        if file.startswith(file_prefix):
            source_path = os.path.join(source_folder, file)
            destination_path = os.path.join(destination_folder, file)
            shutil.copy2(source_path, destination_path)
        elif file.startswith(file_prefix2):
            source_path = os.path.join(source_folder, file)
            destination_path = os.path.join(destination_folder2, file)
            shutil.copy2(source_path, destination_path)
    print("Files copied successfully!")
    
    # Delete files in the download folder
    folder_path = r"D:\WORK\SEND_SMS_24shopping\Robot_part\Download"

    # Get a list of all files and folders in the folder
    entries = os.listdir(folder_path)

    # Iterate through each entry and delete it
    for entry in entries:
        entry_path = os.path.join(folder_path, entry)
        if os.path.isfile(entry_path):
            os.remove(entry_path)
        else:
            shutil.rmtree(entry_path)

    print("Files and folders deleted successfully.")
    
    return {"Place_file":"success"}

@worker.task(task_type="tgen" , variable_name="tgenz")
async def Yimpan(job: Job):
    mc.write_log('start process')
    print("Start Tgen")
    pd.options.mode.chained_assignment = None
    path = "D:\\WORK\\SEND_SMS_24shopping\\Robot_part"         
    path_input = path+'\\input' 
    path_result = path+'\\result'
    path_input_report_tgen = path_input+ '\\tgen'
    print("Start Unzip file tgen")
    files_zip = mc.file_in_folder(path_input_report_tgen,'*.zip')
    if "t_general_ordhistory" in files_zip[0]:
        mc.unzipfile(mc.file_in_folder(path_input_report_tgen,'*.zip')[0], path_input_report_tgen)
    return {"tgenz":"success"}

@worker.task(task_type="Report_Store_Receive" , variable_name="Report_Store_Receivez")
async def Yimpan(job: Job):
    print("Start Report_Store")
    mc.write_log('start process')
    pd.options.mode.chained_assignment = None
    path = "D:\\WORK\\SEND_SMS_24shopping\\Robot_part"         
    path_input = path+'\\input' 
    path_result = path+'\\result'
    path_input_report_store_receive = path_input+ '\\Report_Store_Receive' 
    mc.write_log('start generate report store receive')                             
    print(datetime.now()," start generate report store receive")
    #Start Unzip Process
    print("Start Unzip file ReportStoreReceive")
    files_zip = mc.file_in_folder(path_input_report_store_receive,'*.zip')                                      #ค้นหา file .zip เก็บในตัวแปล files_zip
    if "Report_Store_Receive" in files_zip[0]:                                                          
        for f in files_zip:
            path_file, filename = os.path.split(f)
            file_name_only = os.path.splitext(filename)[0]
            os.makedirs(path_file+'\\'+file_name_only)
            shutil.move(f, path_file+'\\'+file_name_only+'\\'+filename)
        folders_report_store_receive = mc.file_in_folder(path_input_report_store_receive,'Report_Store_R*')
        # unzip
        for f in folders_report_store_receive:
            mc.unzipfile(mc.file_in_folder(f,'*.zip')[0], f)
    print("Unzip Donekub")
    print("This is job var : " + str(job.variables)) 
    return {"Report_Store_Receivez":"success"}

@worker.task(task_type="combine" , variable_name="Yimza" , timeout_ms=1200000)
async def Yimpan(job: Job):
    path = "D:\\WORK\\SEND_SMS_24shopping\\Robot_part"         
    path_input = path+'\\input' 
    path_result = path+'\\result'
    path_input_report_store_receive = path_input+ '\\Report_Store_Receive' 
    folders_report_store_receive = mc.file_in_folder(path_input_report_store_receive,'Report_Store_R*')
    list_all_asc = []
    for f in folders_report_store_receive:
        if f.find('.') <0:
            list_asc = mc.file_in_folder(f,'*.asc')
            for l in list_asc:
                list_all_asc.append(l)
    df = asc.merge_df_asc(list_all_asc)
    df = df.rename(columns= {'Order date': 'ORD_DATE','Order no.':'ORD_NO', 'Invoice no.':'INV_NO'})    
    df.drop_duplicates(subset=['ORD_NO', 'INV_NO'], inplace=True)                                       
    df['ORD_DATE'] = pd.to_datetime(df["ORD_DATE"], format="%d/%m/%Y")
    print(df)                                  
    df_date_min =  df['ORD_DATE'].min()
    df_date_max =  df['ORD_DATE'].max()
    for f in mc.file_in_folder(path_input_report_store_receive,'*'):                                    
        if f.find('.') <0:                                                                              
            shutil.rmtree(f)                                                                            
    print(datetime.now()," success generate report store receive")
    print(datetime.now(),"df_date_min(",df_date_min,"), df_date_max(", df_date_max,")")
    #tgen
    mc.write_log('start generate report tgen')   
    print(datetime.now()," start generate report tgen")
    path_input_report_tgen = path_input+ '\\tgen'
    list_ascz = mc.file_in_folder(path_input_report_tgen,'*.asc')
    df_tgen = asc.merge_df_asc(list_ascz)
    df_tgen = df_tgen[df_tgen['SHIP_TO']== 'S']                                                         
    df_tgen = df_tgen[['ORD_DATE','ORD_NO', 'INV_NO']]                                                  
    df_tgen['ORD_DATE'] = pd.to_datetime(df_tgen['ORD_DATE'], format='%d.%m.%Y')                        
    # df_tgen = df_tgen[(df_tgen['ORD_DATE'] >= df_date_min) & (df_tgen['ORD_DATE'] <= df_date_max)]
    df_tgen.drop_duplicates(subset=['ORD_NO', 'INV_NO'], inplace=True)                                  
    for f in os.listdir(path_input_report_tgen):
        os.remove(os.path.join(path_input_report_tgen, f))
    print(datetime.now()," success generate report tgen")
    print(datetime.now()," start merge report tgen and store receive")
    # print(df_tgen)
    mc.write_log('Start merge report tgen and store receive')
    df_join = pd.merge(df_tgen, df, on=['ORD_DATE','ORD_NO','INV_NO'], how='right')                     
    mc.write_log('success merge report tgen and store receive'+str(df_join))
    # Convert date columns to datetime type, handle empty values
    df_join['ORD_DATE'] = pd.to_datetime(df_join['ORD_DATE'], format='%d/%m/%Y')
    df_join['Store recv./Pay to cust.'] = pd.to_datetime(df_join['Store recv./Pay to cust.'], format='%d/%m/%Y', errors='coerce')
    # Apply the conditions
    today = pd.Timestamp(datetime.now().date()).replace(day=19 , month=6)
    print("Start Check today real file")
    two_days_ago = today - pd.DateOffset(days=2)
    date_check = two_days_ago.strftime('%d/%m/%Y')
    date_string = two_days_ago.strftime('%d_%m_%Y') 

    # df_join.loc[df_join['Type'] == 'คีย์จ่าย',['SEND_SMS']] = 'No'                                         
    # df_join_first = df_join.loc[df_join['SEND_SMS'] == 'No']                                            
    # df_join_temp = df_join.loc[df_join['SEND_SMS'] != 'No'] 
    print(datetime.now()," success merge report tgen and store receive")
    def calculate_sms_sent(df_join_temp):
        if (df_join_temp['Type'] == '').any() or (df_join_temp['Type'] == 'คีย์จ่าย').any():
            return False
        elif (df_join_temp['Type'] == 'คีย์รับ').all() and (df_join_temp['Store recv./Pay to cust.'].max() == two_days_ago):
            return True
        else:
            return False

    df_join['SEND_SMS'] = df_join.groupby('ORD_NO').apply(calculate_sms_sent).reindex(df_join['ORD_NO']).reset_index(drop=True)
    #formate column Store recv to str
    filename_order = path_result +'\\List_of_non_duplicate_order_to_SEND_SMS.'+date_string+'.xlsx'
    filtered_df = df_join[df_join['SEND_SMS'] == True]
    filtered_df = filtered_df.sort_values(by='Store recv./Pay to cust.', ascending=False)
    grouped_df = filtered_df.groupby('ORD_NO').first()
    grouped_df.to_excel(filename_order, index=True)
    print(str(filename_order) + "was created")  

    print(datetime.now()," success find status SEND_SMS")
    print(datetime.now()," start concat data")
    mc.write_log('success find status SEND_SMS')
    mc.write_log('start concat data')
    #df_join = pd.concat([df_join_first, df_join_temp])
    print(datetime.now()," success concat data")
    mc.write_log('success concat data'+str(df_join))
    #formate column Store recv to str
    df_join['Store recv./Pay to cust.'] = df_join['Store recv./Pay to cust.'].dt.strftime('%d/%m/%Y') 
    df_join.to_csv("gemtest.csv", index=False, encoding='utf-8-sig')
    #write file
    mc.write_log('start save file data')
    run = True
    max_row = 500000
    round = 1
    while run:
        row_count = len(df_join.index)
        filename = path_result +'\\tgen_result_following_sms_'+date_string+'.csv' if round == 1 else path_result+'\\tgen_result_following_sms_'+date_string+'_'+str(round)+'.csv' 
        round +=1
        if row_count >= max_row:                                                                
            print(datetime.now(),' row_count={0}:max_row={1}'.format(row_count, max_row))       
            df_new1, df_new2 = df_join[:max_row], df_join[max_row:]
            # df_new1.to_excel(filename ,index=False)
            df_new1.to_csv(filename ,index=False , encoding='utf-8-sig')                                                       
            print(datetime.now(),' Save File tgen_result_following_sms( '+filename+' )')
            df_join = df_new2
        else:
            # df_join.to_excel(filename, index=False)
            df_join.to_csv(filename, index=False , encoding='utf-8-sig')  
            # Perform only order_no                                         
            print(datetime.now(),' Save File tgen_result_following_sms( '+filename+' )')
            run = False
    #end write file
    print(datetime.now(),"COMPLETE Generate please check result "+ path_result)
    mc.write_log(' COMPLETE Generate please check result '+path_result)
    return {"Yimza" : "test"}

@worker.task(task_type="Upload" , variable_name="uploadtosharepoint" , timeout_ms=600000)
async def uploadsh(job: Job):
    site = 'MST-WORK-shopat24'
    loc_file = r"D:\WORK\SEND_SMS_24shopping\Robot_part\result"
    loc_share = r"Documents->Shop_at24->following_send_sms"
    file_names = ['']
    Option = "Upload"
    sharepoint_tools.sharepoint_document(site, loc_share, loc_file,
                                        Option, file_names, upload_all=True)
    print(loc_share)
    return {"uploadtosharepoint" : "success"}

@worker.task(task_type="Delete_file_rpa" , timeout_ms=600000)
async def Clear_file_in_folder_robot(job: Job):
    import time
    i = 0
    while i <= 50:
        try:
            print("Start remove file in folder")
            loc_file = r'D:\WORK\SEND_SMS_24shopping\Robot_part\Download'
            entries = os.listdir(loc_file)
            for entry in entries:
                entry_path = os.path.join(loc_file, entry)
                if os.path.isfile(entry_path):
                    os.remove(entry_path)
                else:
                    shutil.rmtree(entry_path)

            print("Files and folders deleted successfully.")
            return {"Clear_file_status" : "success"}
        except:
            print("try round : " + str(i))
            time.sleep(5)
        i = i + 1


from fastapi import FastAPI , HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse , FileResponse
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["*"] # Change the * to the domain name of your frontend server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import grpc
from zeebe_grpc import gateway_pb2, gateway_pb2_grpc
import base64
import logging
import json

class Decodeza(BaseModel):
    encoded : str
    to_flow : str
@app.post("/decode")
async def Uploadfile_to_bot(payload:Decodeza):
    print("Upload file for flow : " + payload.to_flow)
    jobcheck = []
    if payload.to_flow == "DEMO_webapp_RPA":
        service_upload_type = "Uploadfile"
    with grpc.insecure_channel("localhost:26500") as channel: #// For local server
    # with grpc.insecure_channel("localhost:26500") as channel:
        stub = gateway_pb2_grpc.GatewayStub(channel)

        # start a worker
        activate_jobs_response = stub.ActivateJobs(
            gateway_pb2.ActivateJobsRequest(
                type=service_upload_type,
                worker="Python worker 24",
                timeout=60000,
                maxJobsToActivate=1
            )
        )
        check_activate = "no item"
        for response in activate_jobs_response:
            check_activate = "me item"
            for job in response.jobs:
                jobcheck.append(job.key)
                print("This is job key " + str(jobcheck))
                try:
                    if len(jobcheck) != 0 :
                        # Decode the base64-encoded data
                        byte = bytes(payload.encoded, "utf-8")
                        decoded_data = base64.b64decode(byte)
                        # Save the decoded data as a ZIP file
                        output_zip_file_path = "D:\\WORK\\SEND_SMS_24shopping\\Robot_part\\Download\\decoded_zip.zip"  # Replace with the desired output ZIP file name
                        with open(output_zip_file_path, "wb") as file:
                            file.write(decoded_data)
                        print("Encoded file successfully decoded and saved as ZIP.")
                        print(job.variables)
                        stub.CompleteJob(gateway_pb2.CompleteJobRequest(jobKey=job.key, variables=json.dumps({"Uploadfile": "Success"})))
                        logging.info("Job Completed")
                    else:
                        print("didn't start job")
                except Exception as e:
                    stub.FailJob(gateway_pb2.FailJobRequest(jobKey=job.key))
                    logging.info(f"Job Failed {e}")
        if check_activate == "no item":
            raise HTTPException(status_code=404, detail="No work was active")
        else:
            print("This is a book")
            
class downloadfile(BaseModel):
    bpmn : str
    dept : str
@app.post("/download_sendsms")
async def downloadfile_sendsms(payload:downloadfile):
    import backend_function
    import authentication as auth
    if backend_function.get_processinstance_for_download_result(payload.bpmn) != "Can't download":
        
        ## Download file from sharepoint
        print("Start download file process")
        site = 'MST-WORK-shopat24'
        import os
        try:
            folder_path_input = r"D:\WORK\SEND_SMS_24shopping\Robot_part\Download\input"
            folder_path_result = r"D:\WORK\SEND_SMS_24shopping\Robot_part\Download\result"
            # Create a new folder
            os.mkdir(folder_path_input)
            os.mkdir(folder_path_result)
        except:
            print("Yim")
        try:
            loc_file = r"D:\WORK\SEND_SMS_24shopping\Robot_part\Download\input"
            loc_share = r"Documents->Shop_at24->following_send_sms"
            file_names = ['']
            Option = "Upload"
            sharepoint_tools.sharepoint_document(site, loc_share, loc_file,
                                                Option, file_names, download_all=True)
            print(loc_share)
            
            import zipfile
            def zip_folder(folder_path, zip_path):
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for root, dirs, files in os.walk(folder_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            zipf.write(file_path, os.path.relpath(file_path, folder_path))

            # Specify the folder path and the desired output zip file path

            zip_path = r'D:\WORK\SEND_SMS_24shopping\Robot_part\Download\result\output.zip'

            # Call the function to zip the folder
            zip_folder(folder_path_input, zip_path)
        except:
            raise HTTPException(status_code=400, detail="Zip file error")
        with grpc.insecure_channel("localhost:26500") as channel: #// For local server
            job_key = backend_function.get_job_key_for_downloadfile(listbpmn=auth.process_auth(payload.dept) , submit_processinstance=backend_function.get_processinstance_for_download_result(payload.bpmn))
            stub = gateway_pb2_grpc.GatewayStub(channel)
            loc_file = r'D:\WORK\SEND_SMS_24shopping\Robot_part\Download'
            print("Start zip file process")
            try:
                file_path = zip_path  # Replace with the actual file path
                file_name = os.path.basename(file_path)
                # Delete files in the download folder
                # Get a list of all files and folders in the folder
                entries = os.listdir(loc_file)
                stub.CompleteJob(gateway_pb2.CompleteJobRequest(jobKey=job_key, variables=json.dumps({"downloadfile": "Success"})))
                logging.info("Job Completed")
                print("Submit DONE for jobkey : " + str(job_key))
                return FileResponse(file_path, media_type="application/octet-stream", filename=str(file_name) , status_code=200)
            except Exception as e:
                print("Log failjob ?")
                stub.FailJob(gateway_pb2.FailJobRequest(jobKey=job_key))
                logging.info(f"Job Failed {e}")
                # Delete files in the download folder
                # Get a list of all files and folders in the folder
                entries = os.listdir(loc_file)

                # Iterate through each entry and delete it
                for entry in entries:
                    entry_path = os.path.join(loc_file, entry)
                    if os.path.isfile(entry_path):
                        os.remove(entry_path)
                    else:
                        shutil.rmtree(entry_path)

                print("Files and folders deleted successfully.")
                raise HTTPException(status_code=400, detail="Some error occured")
    else:
        raise HTTPException(status_code=201, detail="didn't process for download")
    
            



                    
import asyncio

async def run_app():
    await uvicorn.run(app, host="localhost", port=8001)

async def run_worker():
    await worker.work()

async def run_app_and_worker():
    await asyncio.gather(
        run_app(),
        run_worker()
    )

if __name__ == "__main__":
    asyncio.run(run_app_and_worker())

