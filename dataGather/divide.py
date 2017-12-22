products = ['All Products','Animal','Textiles and Clothing','Wood','Minerals','Food Products','Chemicals','Plastic or Rubber','Fuels','Mach and Elec']
years = ['1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015']

#Reporter Name,Partner Name,Trade Flow,Product Group,Measure,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015

def main():
    csv = open('relationaltradepv.csv', 'r')
    print(len(years))
    i=0
    while i<len(years):
        e=0
        while e<len(products):
            csv = open('relationaltradepv.csv', 'r')
            lines = csv.readlines()
            filename = './traderel/'+products[e]+'trade'+years[i]+'.csv'
            print(filename)
            f=open(filename, 'w')
            if (i==len(years)):
                newline="Reporter Name,Partner Name,Product Group,"+years[i]
            else:
                newline="Reporter Name,Partner Name,Product Group,"+years[i]+"\n"
            f.write(newline)
            for line in lines:
                print(1)
                row=line.split(";")
                if (row[2]==products[e]):
                    print(2)
                    if "," in row[0]:
                        row[0] ="\""+row[0]+"\""
                    if "," in row[1]:
                        row[1] ="\""+row[1]+"\""
                    if (float(row[3+i])!=0):
                        if (i==len(years)):
                            newline=row[0]+","+row[1]+","+row[2]+","+row[3+i]
                            print(newline)
                        else:
                            newline=row[0]+","+row[1]+","+row[2]+","+row[3+i]+'\n'
                            print(newline)
                        f.write(newline)
            e+=1
        i+=1
main()
