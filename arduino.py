import pyfirmata
from time import sleep
import csv

csvlst = []

port = 'dev/ttyACM0'

it = pyfirmata.util.Iterator(board)
it.start()

board = pyfirmata.Arduino(port)

pressure_sensor_1 = board.get_pin("a:0:i")
pressure_sensor_2 = board.get_pin("a:1:i")
temprature_humidity_sensor = board.get_pin("a:2:i")
skin_moisture_sensor = board.get_pin("a:3:i")


while True:
    total_time = 0
    pressure_sensor_1 = pressure_sensor_1.read()
    pressure_sensor_2 = pressure_sensor_2.read()
    temprature_humidity_sensor = temprature_humidity_sensor.read()
    skin_moisture_sensor = skin_moisture_sensor.read()
    lst = []
    lst.extend(((pressure_sensor_1+pressure_sensor_2)/2, temprature_humidity_sensor.temp,
               temprature_humidity_sensor.humidity, skin_moisture_sensor))
    tup = (tuple(li))
    csvlst.append(tup)
    total_time += 900000
    sleep(900000)
    if total_time > 21600000
     csvfile = open('data.csv', 'w', newline='')
      obj = csv.writer(csvfile, quoting=csv.QUOTE_ALL)
       for k in csvlst:
            obj.writerow(k)
        csvfile.close()
