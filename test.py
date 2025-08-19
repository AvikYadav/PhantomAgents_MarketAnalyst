import os
# Download latest version
# for i in range(2,201):
#     name = "data/c"+"".join(["0" for i in range(3-len(str(i)))]) + str(i)

for dir in os.listdir("data"):
    if dir =="c001" or "."in dir:
        continue
    lst = ["/core.csv","/documentation.json","/events_interactions.csv","/finances.csv","/macro_regulatory_data.csv","/market.csv","/sentiment_external_opinions.csv","/stockdata.csv"]
    for file in lst:
        with open("data/"+dir+file,"a",encoding="utf-8") as f:
            pass



























