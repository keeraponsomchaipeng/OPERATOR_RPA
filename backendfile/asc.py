import  module_center as mc
from datetime import datetime
# from zipfile import ZipFile
import pandas as pd
from pandas.errors import EmptyDataError
import os
import shutil
import module_center as mc

def read_asc(file_asc):
    # print(file_asc)
    try:
        df = pd.read_csv(file_asc, encoding="iso8859_11", low_memory = False, sep='\t')
    except EmptyDataError:
        df = pd.DataFrame()
    return df
    
def merge_df_asc(files_asc):
    for f in files_asc:
        print(datetime.now(),f)
        try:
            df
        except NameError:
            df = pd.DataFrame()
        df1 = read_asc(f)
        if not df1.empty:
            df = pd.concat([df, df1])
    df_asc = df
    df_asc.reset_index(drop=True, inplace=True)
    df = pd.DataFrame()
    return df_asc

def generate_report_dataframe(path_input_file_zip_asc):
    files_zip = mc.file_in_folder(path_input_file_zip_asc,'*.zip')                                      #ค้นหา file .zip เก็บในตัวแปล files_zip
    if "Report_Store_Receive" in files_zip[0]:                                                          
        for f in files_zip:
            path_file, filename = os.path.split(f)
            file_name_only = os.path.splitext(filename)[0]
            os.makedirs(path_file+'\\'+file_name_only)
            shutil.move(f, path_file+'\\'+file_name_only+'\\'+filename)
        folders_report_store_receive = mc.file_in_folder(path_input_file_zip_asc,'Report_Store_R*')
        # unzip
        for f in folders_report_store_receive:
            mc.unzipfile(mc.file_in_folder(f,'*.zip')[0], f)
        # unzip
        list_all_asc = []
        for f in folders_report_store_receive:
            if f.find('.') <0:
                list_asc = mc.file_in_folder(f,'*.asc')
                for l in list_asc:
                    list_all_asc.append(l)
        df = merge_df_asc(list_all_asc)
    elif "t_general_ordhistory" in files_zip[0]:
        mc.unzipfile(mc.file_in_folder(path_input_file_zip_asc,'*.zip')[0], path_input_file_zip_asc)
        list_asc = mc.file_in_folder(path_input_file_zip_asc,'*.asc')
        df = merge_df_asc(list_asc)
    return df
print(merge_df_asc)

def justunzip(path_input_file_zip_asc):
    files_zip = mc.file_in_folder(path_input_file_zip_asc,'*.zip')                                      #ค้นหา file .zip เก็บในตัวแปล files_zip
    if "Report_Store_Receive" in files_zip[0]:                                                          
        for f in files_zip:
            path_file, filename = os.path.split(f)
            file_name_only = os.path.splitext(filename)[0]
            os.makedirs(path_file+'\\'+file_name_only)
            shutil.move(f, path_file+'\\'+file_name_only+'\\'+filename)
        folders_report_store_receive = mc.file_in_folder(path_input_file_zip_asc,'Report_Store_R*')
        # unzip
        for f in folders_report_store_receive:
            mc.unzipfile(mc.file_in_folder(f,'*.zip')[0], f)
        # unzip
        list_all_asc = []
        for f in folders_report_store_receive:
            if f.find('.') <0:
                list_asc = mc.file_in_folder(f,'*.asc')
                for l in list_asc:
                    list_all_asc.append(l)
        df = merge_df_asc(list_all_asc)
    elif "t_general_ordhistory" in files_zip[0]:
        mc.unzipfile(mc.file_in_folder(path_input_file_zip_asc,'*.zip')[0], path_input_file_zip_asc)
        list_asc = mc.file_in_folder(path_input_file_zip_asc,'*.asc')
        df = merge_df_asc(list_asc)
    return df