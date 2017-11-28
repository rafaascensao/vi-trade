import pandas as pd

df = pd.read_csv('all-exports.csv')
to_stay = set(['All Products','Animal','Textiles and Clothing','Wood','Minerals','Food Products','Chemicals','Plastic or Rubber','Fuels','Mach and Elec'])
def recode_empty_cells(dataframe, list_of_columns):
    for column in list_of_columns:
        dataframe[column].fillna(0, inplace=True)

    return dataframe

df = recode_empty_cells(df, list(df))
print(df['Product Group'].str.strip())
df['Product Group'] = df['Product Group'].str.strip()
df = df[df['Product Group'].isin(to_stay)]
#df.to_csv('dataset/backup.csv', index=False)
df.to_csv('exports.csv', index=False)
