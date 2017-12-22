import pandas as pd
import csv

dfExport = pd.read_csv('exports.csv')

products = set(['All Products','Animal','Textiles and Clothing','Wood','Minerals','Food Products','Chemicals','Plastic or Rubber','Fuels','Mach and Elec'])

dfCountries = pd.read_csv('countryCodes.csv')
countries = dfCountries['Name']

years = ['1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015']

def getTop(top, data, country, year):
    res = dict()
    return (data.sort_values(year,ascending=False)).head(top)

def getTopExport(top, country, year):
    data = dfExport.loc[(dfExport['Reporter Name'] == country) & (dfExport['Partner Name'] != " World") & (dfExport['Partner Name'] != 'European Union') & (dfExport['Product Group'] != 'All Products')]
    return getTop(top, data, country, year)

def getTopImport(top, country, year):
    data = dfExport.loc[(dfExport['Partner Name'] == country) & (dfExport['Reporter Name'] != " World") & (dfExport['Reporter Name'] != 'European Union') & (dfExport['Product Group'] != 'All Products')]
    return getTop(top, data, country, year)

for year in years:
    print("YEAR: " + year)
    print("----------------------------------------------------------------------------------__")
    filename = 'top/top' + year + '.csv'
    with open(filename, 'w') as f:
        wr = csv.writer(f)
        columns = ['Reporter Name', 'Partner Name', 'Trade Flow', 'Product Group', 'Value']
        wr.writerow(columns)
        for country in countries:
            print("Country: ", country)
            print("EXPORT")
            top = getTopExport(15, country, year)
            for index, row in top.iterrows():
                myList = [country]
                myList.extend([row['Partner Name']])
                myList.extend(['Export'])
                myList.extend([row['Product Group']])
                myList.extend([row[year]])
                wr.writerow(myList)

            print("IMPORT")
            top = getTopImport(15, country, year)
            for index, row in top.iterrows():
                myList = [country]
                myList.extend([row['Reporter Name']])
                myList.extend(['Import'])
                myList.extend([row['Product Group']])
                myList.extend([row[year]])
                wr.writerow(myList)
