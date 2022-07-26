from pyfirmata import Arduino, util
import pymysql
from datetime import datetime
import time
import requests
board = Arduino('/dev/ttyACM0')
url = "https://likith2000-bedsore.herokuapp.com/insert"

it = util.Iterator(board)
it.start()

s1 = board.analog[0]
s2 = board.analog[1]
s3 = board.analog[2]
s4 = board.analog[3]
s5 = board.analog[4]

s1.enable_reporting()
s2.enable_reporting()
s3.enable_reporting()
s4.enable_reporting()
s5.enable_reporting()

while True:
    time.sleep(15)
    print('s1:', s1.read())
    print('s2:', s2.read())
    print('s3:', s3.read())
    print('s4:', s4.read())
    print('s5:', s5.read())
    p1 = s1.read()
    p2 = s2.read()
    p3 = s3.read()
    p4 = s4.read()
    hum = s5.read()
    temp = '25'
    amb_hum = '0.5'
    amb_temp = '23'
    pid = '1'
    r = requests.post(url, params={'pid': 1,
                                   'p1': p1,
                                   'p2': p2,
                                   'p3': p3,
                                   'p4': p4,
                                   'hum': hum,
                                   'temp': temp,
                                   'amb_hum': amb_hum,
                                   'amb_temp': amb_temp, })
    if r.status_code != 200:
        print("Error:", r.status_code)
    else:
        print('Success')
