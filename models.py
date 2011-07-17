from settings import *
from mongoengine import *
connect("paste2image",host=DB_HOST,port=DB_PORT)

from datetime import datetime
import random

codebase = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

def random_string(length=6):
    s = []
    for _ in range(length):
        s.append( random.choice(codebase) )
    return ''.join(s)

class Pasted(Document):
    pid = StringField(max_length=8)
    content = StringField(max_length=65536)
    created = DateTimeField(default=datetime.now)
    image = FileField()
    def __init__(self, *args, **kwargs):
        super(Pasted, self).__init__(*args, **kwargs)
        if not self.pid:
            while True:
                self.pid = random_string(length=6)
                try:
                    Pasted.objects.get(pid=self.pid)
                except Pasted.DoesNotExist:
                    break
            self.save()


