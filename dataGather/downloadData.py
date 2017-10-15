import urllib.request
import csv

######################################
###          GLOBAL VARS           ###
######################################
fromYear = 1989
toYear = 2015
indicator = 'XPRT-TRD-VL'
numberCountries = 0

######################################
###           FUNCTIONS            ###
######################################

def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█'):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
    """
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print('\r%s |%s| %s%% %s' % (prefix, bar, percent, suffix), end='\r')
    # Print New Line on Complete
    if iteration == total:
        print()

def getNumberCountries(file):
    with open(file) as csvfile:
        readCSV = csv.reader(csvfile, delimiter=",")
        numberCountries = sum(1 for row in readCSV)
    csvfile.close()
    return numberCountries

def generateCountryCodes(file):
    codes = {}
    with open(file) as csvfile:
        readCSV = csv.reader(csvfile, delimiter=",")
        printProgressBar(0,numberCountries, prefix='\nGenerating codes:' , suffix='  0 of '+str(numberCountries), length=15)
        i = 0
        for row in readCSV:
            printProgressBar(i+1, numberCountries, prefix='Generating codes:',suffix='  '+str(i+1)+' of '+str(numberCountries) , length=15)
            codes[row[0]] = [row[1] , row[2]]
            i += 1
    return codes

def requestCSV(reporter, partner, startYear, endYear, tradeFlow, indicator):
    url = 'http://wits.worldbank.org/Download.aspx?Reporter='
    url += reporter + '&StartYear='
    url += startYear + '&EndYear='
    url += endYear + '&Tradeflow='
    url += tradeFlow + '&Indicator='
    url += indicator + '&Partner='
    url += partner + '&Product=all-groups&Type=ProductTimeseries&Lang=en'
    outName = 'dataset/'+reporter+'_'+partner+'_'+tradeFlow+'.xlsx'
    urllib.request.urlretrieve(url,outName)

#req = urllib.request.urlretrieve('http://wits.worldbank.org/Download.aspx?Reporter=ESP&StartYear=#1989&EndYear=2015&Tradeflow=Export&Indicator=XPRT-TRD-VL&Partner=LKA&Product=all-groups&Type=ProductTimeseries&Lang=en','test.xlsx')

def requestAllCountriesExportations(codes):
    print("\n\n------------------------------------------------------------------")
    print(    "---                 All Countries Exportations                 ---")
    print(    "------------------------------------------------------------------")

    for key in codes.items():
        printProgressBar(0,numberCountries, prefix='\Requesting '+key[1][0]+' exports' , suffix='  0 of '+str(numberCountries-1), length=15)
        i=0
        for partner in codes.items():
            if partner == key:
                continue
            printProgressBar(i+1,numberCountries, prefix='\Requesting '+key[1][0]+' exports' , suffix=' ['+partner[1][0]+']  '+str(i+1)+' of '+str(numberCountries-1), length=15)
            requestCSV(key[1][0],partner[1][0],str(fromYear),str(toYear),'Export',indicator)
            i += 1
        print("")


def requestGroupOfCountries(country,countries):
    printProgressBar(0,numberCountries, prefix='\Requesting '+country+' exports' , suffix='  0 of '+str(numberCountries-1), length=15)
    i=0
    for partner in countries.items():
        if partner[1][0] == country:
            continue
        printProgressBar(i+1,numberCountries, prefix='\Requesting '+country+' exports' , suffix=' ['+partner[1][0]+']  '+str(i+1)+' of '+str(numberCountries-1), length=15)
        requestCSV(country,partner[1][0],str(fromYear),str(toYear),'Export',indicator)
        i += 1
    print("")

def codesToList(codes):
    codesList = []
    for key in codes.items():
        codesList.append(key[1][0])
    return sorted(codesList)

def retrieveListofCodes(countrylist,countries):
    print("\n\n------------------------------------------------------------------")
    print(    "--- Requesting Specific Country Exportations ["+countrylist[0]+"] to ["+countrylist[len(countrylist)-1]+"]   ---")
    print(    "------------------------------------------------------------------")
    print(    "     Writing to ["+countrylist[0]+"]_["+countrylist[len(countrylist)-1]+"].log")
    createLogFile("["+countrylist[0]+"]_["+countrylist[len(countrylist)-1]+"].log")
    for code in countrylist:
        requestGroupOfCountries(code,countries)
        writeLogFile(code,"["+countrylist[0]+"]_["+countrylist[len(countrylist)-1]+"].log")
    filename.close()

def createLogFile(name):
    f = open(name,"w+")
    f.close()

def writeLogFile(country,filename):
    f = open(filename,"a+")
    f.write("["+country+"] Complete\n")
    f.close()


numberCountries = getNumberCountries('countryCodes.csv')
print("Number of countries: ",numberCountries)
countryCodes = generateCountryCodes('countryCodes.csv')
listCodes = codesToList(countryCodes)
#requestAllCountriesExportations(countryCodes)

### RETRIEVING 10 BY 10 COUNTRIES BY ALPHABETICAL ORDER ####

retrieveListofCodes(listCodes[:10],countryCodes)
retrieveListofCodes(listCodes[11:20],countryCodes)
retrieveListofCodes(listCodes[21:30],countryCodes)
retrieveListofCodes(listCodes[31:40],countryCodes)
retrieveListofCodes(listCodes[41:50],countryCodes)
retrieveListofCodes(listCodes[51:60],countryCodes)
retrieveListofCodes(listCodes[61:70],countryCodes)
retrieveListofCodes(listCodes[71:80],countryCodes)
retrieveListofCodes(listCodes[81:90],countryCodes)
