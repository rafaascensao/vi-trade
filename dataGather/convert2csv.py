import pandas as pd
import os

importsLocation = 'dataset/imports/'
exportsLocation = 'dataset/exports/'
importDestCsv = 'dataset/imports/csv/'
exportDestCsv = 'dataset/exports/csv/'

def convertExcel2Csv(folder, name):
    src = folder + name
    name = name[:-4]
    name = name + "csv"
    dest = folder + '/csv/' + name
    data_xls = pd.read_excel(src, 'Product-TimeSeries-Product', index_col=None)
    data_xls = data_xls.to_csv(dest, encoding='utf-8', index=False)

def ensureDir(path):
    directory = os.path.dirname(path)
    if not os.path.exists(directory):
        os.makedirs(directory)

ensureDir(importDestCsv)
ensureDir(exportDestCsv)

#for filename in os.listdir(importsLocation):
#    if not os.path.isdir(importsLocation + filename):
#        convertExcel2Csv(importsLocation, filename)
for filename in os.listdir(exportsLocation):
    if not os.path.isdir(exportsLocation + filename):
        convertExcel2Csv(exportsLocation, filename)
print('Exports done')
