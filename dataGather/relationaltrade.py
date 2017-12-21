import csv

#dfImport = pd.read_csv('imports.csv')
csv = open('exports1.csv', 'r')
products = ['All Products','Animal','Textiles and Clothing','Wood','Minerals','Food Products','Chemicals','Plastic or Rubber','Fuels','Mach and Elec']
years = ['1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015']

#Reporter Name,Partner Name,Trade Flow,Product Group,Measure,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015

filename = 'relationaltrade.csv'
lines = csv.readlines()
def main():
    f=open(filename, 'w')
    newline="Reporter Name,Partner Name,Product Group,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,Total\n"
    for line in lines:
        row=line.split(";")
        if (row[3] in products):
            if "," in row[0]:
                row[0] ="\""+row[0]+"\""
            if "," in row[1]:
                row[1] ="\""+row[1]+"\""
            newline=row[0]+","+row[1]+","+row[3]
            total=0
            for i in range(5, len(row)):
                if (i == len(row)-1):
                    row[i]=row[i][:-1] #remove \n from last element
                total=total+float(row[i])
                newline=newline+","+row[i]
            newline=newline+","+str(total)+"\n"
        f.write(newline)
main()
