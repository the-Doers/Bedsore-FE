import requests

url = "http://localhost:3000/insert"

r = requests.post(url, params={'pid': 1,
                               'p1': 800,
                               'p2': 765,
                               'p3': 689,
                               'p4': 444,
                               'hum': 0.345,
                               'temp': 0.657,
                               'amb_hum': 0.533,
                               'amb_temp': 26, })

if r.status_code != 200:
    print("Error:", r.status_code)
else:
    print('Success')
