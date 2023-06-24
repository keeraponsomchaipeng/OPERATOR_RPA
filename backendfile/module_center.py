import math
import os
import glob
import pandas as pd
import logging
from datetime import date
from zipfile import ZipFile
import shutil
# from os.path import exists

def delete_all_file(dir):
    for f in os.listdir(dir):
        os.remove(os.path.join(dir, f))
        write_log('remove file '+os.path.join(dir, f))
    return

def delete_file(fullpath_filename):
    if os.path.exists(fullpath_filename):
        os.remove(fullpath_filename)
    return

def file_in_folder(dirname, pattern, fullpath=True):
    files = glob.glob1(dirname,pattern)
    if fullpath: files[:] = [dirname+'\\'+f for f in files]
    write_log('found file '+str(files))
    return files

def makedir(path):
    if not os.path.exists(path):
        os.makedirs(path)
    return

def get_first_sheetname(input_file):
    xl = pd.ExcelFile(input_file)
    return xl.sheet_names[0]

def write_log(msg, loglevel=None):
    loglevel=str(loglevel).lower()
    path_logrpa = os.path.expanduser('~/Documents')+'\\rpabyman'
    makedir(path_logrpa)
    logging.basicConfig(filename=path_logrpa+'\\'+'log_rpa_'+date.today().strftime("%Y%m%d")+'.log', format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.DEBUG)
    if loglevel=='info':
        logging.info(msg)  # will print a message to the console
    elif loglevel=='warn':
        logging.warning(msg)  # will not print anything, 
    elif loglevel=='error':
        logging.error(msg)
    elif loglevel=='critical':
        logging.critical(msg)
    else:
        logging.debug(msg)
    return

def count_thai_character(string):
    consonant='ก,ข,ฃ,ค,ฅ,ฆ,ง,จ,ฉ,ช,ซ,ฌ,ญ,ฎ,ฏ,ฐ,ฑ,ฒ,ณ,ด,ต,ถ,ท,ธ,น,บ,ป,ผ,ฝ,พ,ฟ,ภ,ม,ย,ร,ล,ว,ศ,ษ,ส,ห,ฬ,อ,ฮ'
    vowel_full='ะ,า,,ำ,แ,ฤ,ๅ,ฦ'
    vowel_half='เ,ไ,ใ,โ'
    title_list = list(string)
    len_chalacter = 0
    for t in title_list:
        # print(t,hex(ord(t)))
        if t in consonant:
            len_chalacter+=1
        elif t in vowel_full:
            len_chalacter+=1
        elif hex(ord(t)) =='0x20':
            len_chalacter+=1
        elif t in vowel_half:
            len_chalacter+=0.5
        # print(t,len_chalacter) 
    return math.ceil(len_chalacter)

def unzipfile(filezip_fullpath, path_output): 
    with ZipFile(filezip_fullpath, 'r') as zip_object:
        zip_object.extractall(path_output)
    return

# def move_file():
