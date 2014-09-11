#!/usr/bin/python
import time
import os
from pymongo import MongoClient



client = MongoClient()
db = client.hrui
data = db.data
while 1:	
	time.sleep(0.05)
	os.system('clear')
	position = data.find_one()
	print('x: '+position['x']+' y: '+position['y'])