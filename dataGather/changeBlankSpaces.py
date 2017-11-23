import pandas as pd

dfImport = pd.read_csv('all-imports.csv')
dfExport = pd.read_csv('all-exports.csv')

def recode_empty_cells(dataframe, list_of_columns):
    print('hello')
    for column in list_of_columns:
        dataframe[column].fillna(0, inplace=True)

    return dataframe

dfImport = recode_empty_cells(dfImport, list(dfImport))
dfExport = recode_empty_cells(dfExport, list(dfExport))
dfImport.to_csv('imports.csv', index=False)
dfExport.to_csv('exports.csv', index=False)



