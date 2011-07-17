#coding:utf-8
'''
    Remap \uF700s japanese characters to \u3040s
    The purpose is to display better in chinese fonts
    These zones are marked as "Unicode DIY" zones and should not be used for communication
    This method should not be used at all?
'''


def charmap(char):
    if ord(char)>=0xf6f7 and ord(char)<=0xf749:
        return unichr(ord(char)-0xf6f7+0x3041)
    elif ord(char)>=0xf74a and ord(char)<=0xf79f:
        return unichr(ord(char)-0xf74a+0x30a1)
    return char

def convert(text):
    return u''.join( [ charmap(char) for char in text ] )
