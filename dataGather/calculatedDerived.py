import pandas as pd
import csv

dfImport = pd.read_csv('imports.csv')
dfExport = pd.read_csv('exports.csv')
dfCountries = pd.read_csv('countryCodes.csv')
countries = dfCountries['Name']
years = ['1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015']

def calculateSumForReporter(rep, data):
    res =[]
    allYears = data.loc[(data['Reporter Name'] == rep) & (data['Product Group'] == '  All Products')]
    for year in years:
        res.append(allYears[year].sum())
    return res

def sumRow(row):
    total = 0
    for value in row:
        total = total + value
    return total
    
with open('derived.csv', 'w') as fimp:
    wr = csv.writer(fimp)
    columns = ['Reporter Name', 'Trade Flow']
    columns.extend(years)
    columns.append('Total')
    wr.writerow(columns)
    for country in countries:
        print('Import: ' + country)
        myList = [country, 'Import']
        sums = calculateSumForReporter(country, dfImport)
        myList.extend(sums)
        myList.append(sumRow(sums))
        wr.writerow(myList) 
        print('Export: ' + country)
        myList = [country, 'Export']
        sums = calculateSumForReporter(country, dfExport)
        myList.extend(sums)
        myList.append(sumRow(sums))
        wr.writerow(myList)




