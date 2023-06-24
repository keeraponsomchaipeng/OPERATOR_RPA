#Start Coding...

import os
import json
import pandas as pd
import numpy as np
import time
import requests
import glob
import sys
sys.path.append(r'R:\GOS\Key - MSGraph') #get config.py at path this path.

from datetime import datetime, date, timedelta
from bs4 import BeautifulSoup
from O365 import FileSystemTokenBackend,Account
from config import CLIENT_ID, CLIENT_SECRET, CLIENT_SCOPES, TOKEN_PATH, TOKEN_FILE

#---------- Authenticate -----------
credentials = (CLIENT_ID, CLIENT_SECRET)
token_backend = FileSystemTokenBackend(token_path=TOKEN_PATH, token_filename=TOKEN_FILE)
account = Account(credentials, token_backend=token_backend)

today = date.today()
yesterday = today - timedelta(days = 1)
yesterday = yesterday.strftime('%Y-%m-%d')
#print(yesterday)

def sharepoint_document(site, loc_share, loc_file, option,
                        file_names, download_all=False,
                        upload_all=False):
    
    loc_share = loc_share.split('->') #Split text.
    
    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    drive_document = account_site.list_document_libraries()

    folder_agent = [[], [], [], [], [], [], [], []] #define level folder_agent...
    status = False
    length = len(loc_share)-1
    step = 0

    # find first folder.
    for document in drive_document:
        if document.name == loc_share[step]:
            folder_agent[0] = document
            step = 1

            break

    # make option download.
    for i in range(len(loc_share)):
    
        try: #Search data
            
            for data in folder_agent[i].get_items():

                # Track all folder.
                #print("Folder : {}".format(data.name))

                if len(loc_share) == 1: #Case User ใช้ Foder Document ใส่ไฟล์
                    
                    # config dowload, upload type.
                    if download_all == False and upload_all == False:

                        if option == "Download":
                        
                            if 'Folder' not in str(type(data)):

                                for file_name in file_names:

                                    if data.name == file_name:
                                        
                                        data.download(to_path = loc_file)
                                        status = True
                
                elif data.name == loc_share[step] and step == length:

                    # Tracking
                    print("Access To : {}".format(data.name))
                    
                    # config dowload, upload type.
                    if download_all == False and upload_all == False:

                        if option == "Download":
                
                            files_in_folder = data.get_items()

                            for file_ in files_in_folder:
                        
                                if 'Folder' not in str(type(file_)):
                                    
                                    for file_name in file_names:

                                        if file_.name == file_name:

                                            # Checking property can be used by adding fields
                                            #check_modifred_date = file_.modified
                                            #check_created_date = file_.created

                                            file_.download(to_path = loc_file)
                                            status = True

                        elif option == "Upload":
                            
                            for file_ in file_names:
                                
                                if 'Folder' not in str(type(file_)):
                                    com_path = os.path.join(loc_file, file_)
                                    data.upload_file(com_path) 
                                    status = True

                        else:
                            #print("Operation fail.")
                            pass

                    elif download_all == True and upload_all != True:
                        
                        for file_ in data.get_items(): #download all files
                            
                            if 'Folder' not in str(type(file_)):
                                file_.download(to_path = loc_file)
                                
                        # Return Success
                        status = True

                    elif upload_all == True and download_all != True:
                        
                        ls_filess = os.listdir(loc_file) #data in the folder.

                        for file_ in ls_filess:

                            if 'Folder' not in str(type(file_)):
                                path_file = os.path.join(loc_file, file_) #join path.
                                data.upload_file(path_file) #then upload to share points.
                                status = True

                    break #out of loop when finish

                elif data.name == loc_share[step] and step != length:

                    # Tracking
                    print("Access To : {}".format(data.name))
                        
                    folder_agent[i+1] = data
                    step += 1
                    break #out of loop when can't found target.

        except Exception as e:
            
            pass
            #print("{}".format(e))

    if status == True:
        print("Success.")
    else:
        print("UnSuccess.")
        
    return status

def sharepoint_document_folder(site, loc_share, ls_folder):

    # https://github.com/O365/python-o365/blob/master/O365/drive.py # command

    loc_share = loc_share.split('->') #Split text.

    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    drive_document = account_site.list_document_libraries()

    folder_agent = [[], [], [], [], [], [], [], []] #define level folder_agent...
    length = len(loc_share)-1
    step = 0

    # find first folder.
    for document in drive_document:

        print(document.name)
        if document.name == loc_share[step]:
            folder_agent[0] = document
            step = 1
            break

    # scan folder target
    for i in range(len(loc_share)):

        try: #Search data
            for data in folder_agent[i].get_items():

                if data.name == loc_share[step] and step == length:

                    for folder in ls_folder:

                        data.create_child_folder(folder) # create folder

        except:
            pass

def sharepoint_update_status_item(site, ls_name, key_words):

    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    ls_share = account_site.get_list_by_name(display_name = ls_name)
    ls_item = ls_share.get_items()

    col_filename = 'Item_ID'
    col_status = 'Vat_code'
    
    #chage status pending
    for data in ls_item:

        fields_name = ls_share.get_item_by_id(data.object_id).fields
        try:
            if fields_name[col_filename] == str(key_words[col_filename]):
                if fields_name[col_status] == key_words[col_status]:

                    data.update_fields({col_status : key_words['ChangeTo']})
                    data.save_updates()
        
        except Exception as e:
            
            #pass
            print("Error : {}".format(e))


def sharepoint_update_sync_item(site, ls_name, key_words):
    
    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    ls_share = account_site.get_list_by_name(display_name=ls_name)
    ls_item = ls_share.get_items()

    # chage sync no to yes.
    for data in ls_item:

        fields_name = ls_share.get_item_by_id(data.object_id).fields
        try:
            if fields_name['File_Name'] == str(key_words['File_Name']):
                if fields_name['Sync_MM'] == key_words['Sync_MM']:
                    data.update_fields({'Sync_MM': key_words['ChangeTo']})
                    data.save_updates()

        except Exception as e:

            # pass
            print("Error : {}".format(e))

def sharepoint_create_list_item(site, ls_name, data_json):

    # connect to site sharepoint. 
    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    ls_share = account_site.get_list_by_name(display_name = ls_name)
    ls_item = ls_share.get_items()

    # create data.
    ls_share.create_list_item(data_json)

def sharepoint_delete_list_items(site, ls_name, key_words):

    # connect to site sharepoint.
    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    ls_share = account_site.get_list_by_name(display_name = ls_name)
    ls_item = ls_share.get_items()

    ls_items = []
    for data in ls_item:

        fields_name = ls_share.get_item_by_id(data.object_id).fields
        original_item = ls_share.get_item_by_id(data.object_id)

        try:
            if fields_name['Status'] == key_words['Status']:

                original_item.delete()

                
        except Exception as e:

            #pass
            print("Error : {}".format(e))

def returnNotMatches(a, b):
    
    return [[x for x in a if x not in b], [x for x in b if x not in a]]

def sharepoint_get_list_items(site, ls_name, columns):

    data_frame = pd.DataFrame()

    # connect to site sharepoint.
    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    ls_share = account_site.get_list_by_name(display_name = ls_name)
    ls_item = ls_share.get_items()
    
    ls_col = columns
    ls = []
    ls = [ls_col]
    for data in ls_item:
        ls_by_id = ls_share.get_item_by_id(data.object_id).fields # get list item from sharepoint.
        #print(ls_by_id)
        try:
            element = []
            for col in ls_col:
                try: 
                    element += [ls_by_id[col]]
                except Exception as e:
                    #print(e)
                    element += ['']
            ls += [element]
        except Exception as e:
            pass
            #print("Error : {}".format(e))

    if len(ls) == 1: #have no data

        element = []
        for i in range(len(columns)):

            element += ['']
        ls += [element]

        # make dataframe.
        data_frame = pd.DataFrame(ls[1::])
        data_frame.columns = ls[0]
    else:
        data_frame = pd.DataFrame(ls[1::])
        data_frame.columns = ls[0]

    return data_frame

def sharepoint_delete_all_items(site, ls_name):
    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    ls_share = account_site.get_list_by_name(display_name = ls_name)
    ls_item = ls_share.get_items()

    for data in ls_item:
        original_item = ls_share.get_item_by_id(data.object_id)
        original_item.delete()

if __name__ == '__main__':

    # create list on sharepoint
    site = 'rpa2'
    ls_name = 'ACC-Update Vat-Code Test'
    data_create = {
                    'Title' : 'UpdateItem',
                    'Item_ID' : '0500148',
                    'Item_Name': 'เอสเพรสโซ่เย็น',
                    'Vat_code' : 'Pending'
                    }
    data_create2 = {
                    'Title' : 'UpdateItem',
                    'Item_ID' : '0500150',
                    'Item_Name': 'เอสเพรสโซ่เย็น',
                    'Vat_code' : 'Pending'
                    }

    sharepoint_create_list_item(site, ls_name, data_create)
    sharepoint_create_list_item(site, ls_name, data_create2)
    account_site = account.sharepoint().get_site('root', 'sites/{}'.format(site))
    ls_share = account_site.get_list_by_name(display_name = ls_name)
    ls_item = ls_share.get_items()
    for data in ls_item:
        sp_list_item = ls_share.get_item_by_id(data.object_id)
        print(sp_list_item)
'''
0500070	มอคค่าเย็น
0500145	เอสเพรสโซ่ปั่น
0500146	คาปูชิโน่เย็น
0500147	ช็อกโกแลตเย็น
0500148	เอสเพรสโซ่เย็น
0500149	ช็อกโกแลตร้อน
0500150	ลาเต้ร้อน
0500151	มอคค่าร้อน
0500152	คาปูชิโน่ร้อน
0500153	เอสเพรสโซ่ร้อน
0500154	อเมริกาโน่ร้อน
0500172	น้ำแข็ง(SUPPLY USE)
'''
#Example of using.

# get dataframe from sharepoint
##site = 'rpa2'
##ls_name = 'RPA-StoreLayout-Timeline'
##columns = ['id', 'Title', 'FileName', 'TypeFile', 'Status', 'CreatedDate']
##df = sharepoint_get_list_items(site, ls_name, columns)
##print(df)

# Change Status
##site = 'rpa2'
##ls_name = 'RPA-StoreLayout-Timeline'
##key_words = {'File_Name': 'lay30013.pdf',
##             'Status_Upload': 'Pending',
##             'ChangeTo': 'Completed'
##             }
##sharepoint_update_status_item(site, ls_name, key_words)

# delete list.
##site = 'rpa2'
##ls_name = 'RPA-StoreLayout-Timeline'
##key_words = {
##                'Status': 'Completed'
##             }
##sharepoint_delete_list_items(site, ls_name, key_words)

# create list on sharepoint
##site = 'rpa2'
##ls_name = 'RPA-StoreLayout-StoreProfile'
##data_create = {
##                'Title' : 'Timeline',
##                'File_Name' : 'Edit.xlsx',
##                'File_Type': 'AUTOCAD',
##                'Status_Upload' : 'Pending',
##                'Created' : '2022-01-12 13:37:05+07:00'
##                }
##sharepoint_create_list_item(site, ls_name, data_create)

# # download/upload files on sharepoint
##site = 'spec'
###loc_file = r"R:\CPALL\MER\Mer_Store Layout\Input\รายชื่อหน่วยงาน"
##loc_file = r"D:\Downloads"
##loc_share = r"Documents->1.ร้านปัจจุบัน->RPA_Store Layout_UAT->All files for robot makes task->CSV Files"
##file_names = ['']
##Option = "Download"
##sharepoint_document(site, loc_share, loc_file,
##                    Option, file_names, download_all=True)
        
# create folder on sharepoint
##site = 'POS_Media'
##loc_share = r"Documents->Report" # location folder
##sub_folder = ['test_01', 'test_02'] # list name for create folder.
##sharepoint_document_folder(site, loc_share, sub_folder)

#End coding...

